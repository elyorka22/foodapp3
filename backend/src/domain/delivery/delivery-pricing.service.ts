import { BadRequestException, Injectable } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import { DeliveryZonesService } from '../../modules/delivery-zones/delivery-zones.service';
import { Coordinates, defaultDistanceCalculator } from './distance-calculator';
import {
  calculateBillableDistanceKm,
  calculateCustomerDeliveryFee,
} from './delivery-fee.calculator';

export type DeliveryQuote = {
  distanceKm: number;
  billableDistanceKm: number;
  deliveryFee: number;
  perKmFee: number;
  baseDeliveryFee: number;
  restaurantLatitude: number;
  restaurantLongitude: number;
  customerLatitude: number;
  customerLongitude: number;
  zoneId?: string | null;
  zoneName?: string | null;
};

@Injectable()
export class DeliveryPricingService {
  constructor(
    private readonly settings: SettingsService,
    private readonly zones: DeliveryZonesService,
  ) {}

  async quote(params: {
    restaurant: Coordinates;
    customer: Coordinates;
    cityId?: string;
    businessId?: string;
    branchId?: string;
  }): Promise<DeliveryQuote> {
    const straightLineKm = defaultDistanceCalculator.distanceKm(
      params.restaurant,
      params.customer,
    );
    const billableDistanceKm = calculateBillableDistanceKm(straightLineKm);

    const zoneResult = await this.zones.check({
      lat: params.customer.latitude,
      lng: params.customer.longitude,
      cityId: params.cityId,
      businessId: params.businessId,
      branchId: params.branchId,
    });

    const scopedZones = await this.zones.countScopedActive({
      cityId: params.cityId,
      businessId: params.businessId,
      branchId: params.branchId,
    });

    if (zoneResult.deliverable && zoneResult.feeEstimate != null) {
      const dist = zoneResult.distanceKm ?? billableDistanceKm;
      return {
        distanceKm: dist,
        billableDistanceKm: dist,
        deliveryFee: Math.round(zoneResult.feeEstimate),
        perKmFee: 0,
        baseDeliveryFee: Math.round(zoneResult.feeEstimate),
        restaurantLatitude: params.restaurant.latitude,
        restaurantLongitude: params.restaurant.longitude,
        customerLatitude: params.customer.latitude,
        customerLongitude: params.customer.longitude,
        zoneId: zoneResult.zone?.id ?? null,
        zoneName: zoneResult.zone?.name ?? null,
      };
    }

    if (scopedZones > 0) {
      throw new BadRequestException(
        'Delivery is not available at this address (outside delivery zone)',
      );
    }

    // Fallback: global platform pricing when no zones configured for this scope
    const pricing = await this.settings.getDeliveryPricing();
    if (billableDistanceKm > pricing.maxDeliveryDistance) {
      throw new BadRequestException(
        `Delivery distance ${billableDistanceKm} km exceeds maximum ${pricing.maxDeliveryDistance} km`,
      );
    }

    const deliveryFee = calculateCustomerDeliveryFee(
      straightLineKm,
      pricing.perKmFee,
      pricing.baseDeliveryFee,
    );

    return {
      distanceKm: billableDistanceKm,
      billableDistanceKm,
      deliveryFee,
      perKmFee: pricing.perKmFee,
      baseDeliveryFee: pricing.baseDeliveryFee,
      restaurantLatitude: params.restaurant.latitude,
      restaurantLongitude: params.restaurant.longitude,
      customerLatitude: params.customer.latitude,
      customerLongitude: params.customer.longitude,
      zoneId: null,
      zoneName: null,
    };
  }
}

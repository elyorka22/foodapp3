import { BadRequestException, Injectable } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
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
};

@Injectable()
export class DeliveryPricingService {
  constructor(private readonly settings: SettingsService) {}

  async quote(params: {
    restaurant: Coordinates;
    customer: Coordinates;
  }): Promise<DeliveryQuote> {
    const pricing = await this.settings.getDeliveryPricing();
    const straightLineKm = defaultDistanceCalculator.distanceKm(
      params.restaurant,
      params.customer,
    );
    const billableDistanceKm = calculateBillableDistanceKm(straightLineKm);

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
    };
  }
}

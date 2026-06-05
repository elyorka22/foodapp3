import { Injectable } from '@nestjs/common';
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
  pricePerKm: number;
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
    const distanceKm = defaultDistanceCalculator.distanceKm(
      params.restaurant,
      params.customer,
    );
    const roadFactor = pricing.roadDistanceFactor ?? 1.35;
    const billableDistanceKm = calculateBillableDistanceKm(distanceKm, roadFactor);
    const deliveryFee = calculateCustomerDeliveryFee(distanceKm, pricing.pricePerKm, {
      roadDistanceFactor: roadFactor,
      minDeliveryFee: pricing.minDeliveryFee,
      baseFee: pricing.baseFee,
    });

    return {
      distanceKm,
      billableDistanceKm,
      deliveryFee,
      pricePerKm: pricing.pricePerKm,
      restaurantLatitude: params.restaurant.latitude,
      restaurantLongitude: params.restaurant.longitude,
      customerLatitude: params.customer.latitude,
      customerLongitude: params.customer.longitude,
    };
  }
}

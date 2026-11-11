import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryLocationValue } from '@/components/checkout/delivery-location';

const emptyLocation = (): DeliveryLocationValue => ({
  address: '',
  lat: null,
  lng: null,
});

export type FulfillmentMethod = 'delivery' | 'pickup';

type CheckoutState = {
  phone: string;
  promoCode: string;
  promoDiscount: number;
  promoMessage: string;
  fulfillment: FulfillmentMethod;
  deliveryLocation: DeliveryLocationValue;
  deliveryFee: number | null;
  billableDistanceKm: number | null;
  setPhone: (phone: string) => void;
  setPromoCode: (code: string) => void;
  setPromoResult: (discount: number, message: string) => void;
  setFulfillment: (fulfillment: FulfillmentMethod) => void;
  setDeliveryQuote: (
    fee: number,
    distanceKm: number,
    location: DeliveryLocationValue,
  ) => void;
  clearDeliveryQuote: () => void;
  reset: () => void;
};

const initialState = {
  phone: '',
  promoCode: '',
  promoDiscount: 0,
  promoMessage: '',
  fulfillment: 'delivery' as FulfillmentMethod,
  deliveryLocation: emptyLocation(),
  deliveryFee: null,
  billableDistanceKm: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initialState,
      setPhone: (phone) => set({ phone }),
      setPromoCode: (promoCode) => set({ promoCode }),
      setPromoResult: (promoDiscount, promoMessage) => set({ promoDiscount, promoMessage }),
      setFulfillment: (fulfillment) =>
        set({
          fulfillment,
          deliveryFee: null,
          billableDistanceKm: null,
          deliveryLocation: emptyLocation(),
        }),
      setDeliveryQuote: (deliveryFee, billableDistanceKm, deliveryLocation) =>
        set({ deliveryFee, billableDistanceKm, deliveryLocation }),
      clearDeliveryQuote: () =>
        set({
          deliveryFee: null,
          billableDistanceKm: null,
          deliveryLocation: emptyLocation(),
        }),
      reset: () => set({ ...initialState, deliveryLocation: emptyLocation() }),
    }),
    { name: 'food-checkout' },
  ),
);

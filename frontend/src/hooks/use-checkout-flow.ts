'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  customerNeedsPhone,
  getCustomer,
  getCustomerToken,
  isCustomerLoggedIn,
  saveTrackingToken,
} from '@/lib/customer';
import { validateDeliveryLocation } from '@/components/checkout/delivery-location';
import { fetchDeliveryQuote } from '@/hooks/use-delivery-pricing';
import { formatSum } from '@/lib/format-sum';
import { isValidUzPhone, normalizePhone } from '@/lib/phone';
import { uz } from '@/lib/uz';
import { useCartStore } from '@/store/cart';
import { useCheckoutStore } from '@/store/checkout';

export function useCheckoutFlow() {
  const router = useRouter();
  const { items, restaurantId, total, clear, addItem, decrementItem, removeItem } = useCartStore();
  const checkout = useCheckoutStore();

  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [gettingGps, setGettingGps] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const subtotal = total();
  const deliveryCalculating = gettingGps || deliveryLoading;
  const deliveryQuoted =
    checkout.deliveryFee != null && !deliveryCalculating && deliveryError == null;

  const grandTotal =
    checkout.deliveryFee != null
      ? Math.max(0, subtotal - checkout.promoDiscount) + checkout.deliveryFee
      : null;

  const clearAll = () => {
    clear();
    checkout.reset();
    router.push('/cart');
  };

  const applyPromo = async () => {
    if (!checkout.promoCode.trim() || !restaurantId) return;
    setValidatingPromo(true);
    checkout.setPromoResult(0, '');
    try {
      const res = await api<{
        valid: boolean;
        message?: string;
        discount: number;
      }>('/promo-codes/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: checkout.promoCode.trim(),
          restaurantId,
          subtotal,
          customerId: getCustomer()?.id,
        }),
      });
      if (res.valid) {
        checkout.setPromoResult(res.discount, uz.promoDiscount(formatSum(res.discount)));
      } else {
        checkout.setPromoResult(0, res.message ?? uz.invalidPromo);
      }
    } catch (err) {
      checkout.setPromoResult(
        0,
        err instanceof Error ? err.message : uz.promoValidateFailed,
      );
    } finally {
      setValidatingPromo(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    checkout.setPhone(value);
    setError('');
    if (!isValidUzPhone(value)) {
      checkout.clearDeliveryQuote();
    }
  };

  const requestDeliveryQuote = () => {
    if (!restaurantId) return;
    if (!navigator.geolocation) {
      setDeliveryError(uz.locationSendFailed);
      setError(uz.locationSendFailed);
      return;
    }
    setGettingGps(true);
    setDeliveryError(null);
    setError('');
    checkout.clearDeliveryQuote();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const location = { address: '', lat, lng };
        setGettingGps(false);
        setDeliveryLoading(true);
        try {
          const quote = await fetchDeliveryQuote({
            restaurantId,
            latitude: lat,
            longitude: lng,
          });
          checkout.setDeliveryQuote(quote.deliveryFee, quote.billableDistanceKm, location);
          setDeliveryError(null);
        } catch (err) {
          const message = err instanceof Error ? err.message : uz.orderFailed;
          setDeliveryError(message);
          setError(message);
        } finally {
          setDeliveryLoading(false);
        }
      },
      () => {
        setGettingGps(false);
        setDeliveryError(uz.locationSendFailed);
        setError(uz.locationSendFailed);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const submitOrder = async () => {
    if (!restaurantId || !items.length) return;

    const locationError = validateDeliveryLocation(checkout.deliveryLocation);
    if (locationError) {
      setError(locationError);
      return;
    }
    if (checkout.deliveryFee == null || deliveryCalculating || deliveryError) {
      setError(uz.deliveryPriceRequired);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedIn = getCustomer();
      const token = getCustomerToken();
      if (loggedIn && customerNeedsPhone()) {
        router.replace('/complete-profile');
        return;
      }
      const address =
        checkout.deliveryLocation.address.trim() ||
        `GPS: ${checkout.deliveryLocation.lat}, ${checkout.deliveryLocation.lng}`;
      const res = await api<{ order: { trackingToken: string; orderNumber?: string } }>(
        '/orders/guest',
        {
          method: 'POST',
          token: token ?? undefined,
          body: JSON.stringify({
            restaurantId,
            phone: loggedIn?.phone ?? normalizePhone(checkout.phone),
            customerId: loggedIn?.id,
            deliveryAddress: address,
            latitude: checkout.deliveryLocation.lat,
            longitude: checkout.deliveryLocation.lng,
            promoCode: checkout.promoCode.trim() || undefined,
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          }),
        },
      );
      saveTrackingToken(res.order.trackingToken, res.order.orderNumber);
      clear();
      checkout.reset();
      router.push(`/track/${res.order.trackingToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : uz.orderFailed);
    } finally {
      setLoading(false);
    }
  };

  const goToDetails = () => {
    if (!items.length) return;
    router.push('/checkout');
  };

  const goToDelivery = () => {
    if (!items.length) return;
    if (!isValidUzPhone(checkout.phone)) {
      setError(uz.checkoutEnterPhone);
      return;
    }
    setError('');
    router.push('/checkout/delivery');
  };

  const ensureLoggedInCustomer = useCallback(() => {
    if (isCustomerLoggedIn() && customerNeedsPhone()) {
      router.replace('/complete-profile');
      return false;
    }
    const customer = getCustomer();
    if (customer?.phone && !useCheckoutStore.getState().phone) {
      useCheckoutStore.getState().setPhone(customer.phone);
    }
    return true;
  }, [router]);

  return {
    items,
    restaurantId,
    subtotal,
    grandTotal,
    deliveryQuoted,
    deliveryCalculating,
    deliveryError,
    validatingPromo,
    loading,
    error,
    setError,
    addItem,
    decrementItem,
    removeItem,
    clearAll,
    applyPromo,
    handlePhoneChange,
    requestDeliveryQuote,
    submitOrder,
    goToDetails,
    goToDelivery,
    ensureLoggedInCustomer,
    checkout,
  };
}

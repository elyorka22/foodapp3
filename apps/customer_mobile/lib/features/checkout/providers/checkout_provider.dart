import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/location/location_providers.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/push/device_registration_service.dart';
import '../../../core/utils/format_sum.dart';
import '../../../core/utils/phone_util.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/delivery_location_field.dart' show validateDeliveryLocation;
import '../../auth/providers/auth_provider.dart';
import '../../cart/providers/cart_provider.dart';
import '../../orders/providers/active_order_provider.dart';
import '../data/orders_repository.dart';
import 'checkout_state.dart';

final checkoutProvider =
    NotifierProvider<CheckoutNotifier, CheckoutState>(CheckoutNotifier.new);

class CheckoutNotifier extends Notifier<CheckoutState> {
  @override
  CheckoutState build() => const CheckoutState();

  void setPhone(String value) {
    final fullPhone = normalizePhone(value);
    if (!isValidUzPhone(fullPhone)) {
      state = state.copyWith(phone: value, clearDelivery: true, clearError: true);
      return;
    }
    state = state.copyWith(phone: value, clearDelivery: true, clearError: true);
  }

  void setPromoCode(String value) {
    state = state.copyWith(promoCode: value);
  }

  void setError(String? message) {
    state = state.copyWith(error: message, clearError: message == null);
  }

  void clearDeliveryQuote() {
    state = state.copyWith(clearDelivery: true);
  }

  void reset() {
    state = const CheckoutState();
  }

  void clearAll() {
    ref.read(cartProvider.notifier).clear();
    reset();
  }

  Future<void> applyPromo() async {
    final code = state.promoCode.trim();
    final businessId = ref.read(cartProvider.notifier).businessId;
    final subtotal = ref.read(cartProvider.notifier).total;
    final customerId = ref.read(authStateProvider).valueOrNull?.id;
    if (code.isEmpty || businessId == null) return;

    state = state.copyWith(validatingPromo: true, promoMessage: '');
    try {
      final res = await ref.read(ordersRepositoryProvider).validatePromoCode(
            code: code,
            restaurantId: businessId,
            subtotal: subtotal,
            customerId: customerId,
          );
      if (res.valid) {
        state = state.copyWith(
          promoDiscount: res.discount,
          promoMessage: AppStrings.promoDiscount(formatSum(res.discount)),
          validatingPromo: false,
        );
      } else {
        state = state.copyWith(
          promoDiscount: 0,
          promoMessage: res.message ?? AppStrings.invalidPromo,
          validatingPromo: false,
        );
      }
    } catch (_) {
      state = state.copyWith(
        promoDiscount: 0,
        promoMessage: AppStrings.promoValidateFailed,
        validatingPromo: false,
      );
    }
  }

  Future<void> requestDeliveryQuote() async {
    final businessId = ref.read(cartProvider.notifier).businessId;
    if (businessId == null) return;

    state = state.copyWith(
      sendingLocation: true,
      clearDelivery: true,
      clearError: true,
    );

    final result = await ref.read(locationServiceProvider).resolveForCheckout(
          forceRefresh: true,
        );

    final loc = result.location;
    if (loc == null || !loc.isValid) {
      state = state.copyWith(
        sendingLocation: false,
        error: AppStrings.locationSendFailed,
        deliveryError: AppStrings.locationSendFailed,
      );
      return;
    }

    state = state.copyWith(
      sendingLocation: false,
      lat: loc.latitude,
      lng: loc.longitude,
      deliveryLoading: true,
    );

    try {
      final quote = await ref.read(ordersRepositoryProvider).fetchDeliveryQuote(
            restaurantId: businessId,
            latitude: loc.latitude,
            longitude: loc.longitude,
          );
      state = state.copyWith(
        deliveryFee: quote.deliveryFee,
        billableDistanceKm: quote.billableDistanceKm,
        deliveryLoading: false,
        deliveryError: null,
      );
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : e.message;
      state = state.copyWith(
        deliveryLoading: false,
        deliveryError: msg ?? AppStrings.orderFailed,
        error: msg ?? AppStrings.orderFailed,
      );
    } catch (_) {
      state = state.copyWith(
        deliveryLoading: false,
        deliveryError: AppStrings.orderFailed,
        error: AppStrings.orderFailed,
      );
    }
  }

  Future<String?> submitOrder() async {
    final items = ref.read(cartProvider);
    final businessId = ref.read(cartProvider.notifier).businessId;
    if (businessId == null || items.isEmpty) return null;

    final locationError = validateDeliveryLocation(lat: state.lat, lng: state.lng);
    if (locationError != null) {
      state = state.copyWith(error: locationError);
      return null;
    }
    if (state.deliveryFee == null || state.deliveryCalculating || state.deliveryError != null) {
      state = state.copyWith(error: AppStrings.deliveryPriceRequired);
      return null;
    }

    state = state.copyWith(placingOrder: true, clearError: true);

    try {
      final deliveryAddress = 'GPS: ${state.lat!}, ${state.lng!}';
      final phone = normalizePhone(state.phone);
      final customerId = ref.read(authStateProvider).valueOrNull?.id;
      final deviceId = await ref.read(deviceRegistrationServiceProvider).getDeviceId();
      await ref.read(deviceRegistrationServiceProvider).syncGuestPhone(phone);

      final res = await ref.read(ordersRepositoryProvider).createGuestOrder(
            CreateGuestOrderModel(
              restaurantId: businessId,
              phone: phone,
              deliveryAddress: deliveryAddress,
              latitude: state.lat!,
              longitude: state.lng!,
              customerId: customerId,
              deviceId: deviceId,
              promoCode: state.promoCode.trim().isEmpty ? null : state.promoCode.trim(),
              items: [
                for (final i in items)
                  GuestOrderItemModel(productId: i.productId, quantity: i.quantity),
              ],
            ),
          );

      final trackingToken = res.trackingToken;
      if (trackingToken != null && trackingToken.isNotEmpty) {
        await ref.read(activeOrderProvider.notifier).setActive(
              trackingToken,
              orderNumber: res.orderNumber,
            );
      }

      ref.read(cartProvider.notifier).clear();
      reset();
      state = state.copyWith(placingOrder: false);
      return trackingToken;
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : e.message;
      state = state.copyWith(
        placingOrder: false,
        error: msg ?? AppStrings.orderFailed,
      );
      return null;
    } catch (_) {
      state = state.copyWith(placingOrder: false, error: AppStrings.orderFailed);
      return null;
    }
  }
}

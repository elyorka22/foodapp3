import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/location/delivery_location.dart';
import '../../../core/location/location_failure.dart';
import '../../../core/location/location_providers.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/cart_item_model.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/food_app_card.dart';
import '../../../shared/widgets/food_app_input.dart';
import '../../auth/providers/auth_provider.dart';
import '../../cart/providers/cart_provider.dart';
import '../data/orders_repository.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _phone = TextEditingController();
  final _address = TextEditingController();
  DeliveryLocation? _location;
  bool _locating = false;
  String? _locationError;
  LocationFailure? _locationFailure;
  String _deliveryMethod = 'courier';
  String _paymentMethod = 'cash';
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadLocation(forceRefresh: false));
  }

  @override
  void dispose() {
    _phone.dispose();
    _address.dispose();
    super.dispose();
  }

  Future<void> _loadLocation({required bool forceRefresh}) async {
    setState(() {
      _locating = true;
      _locationError = null;
      _locationFailure = null;
    });
    final result = await ref.read(locationServiceProvider).resolveForCheckout(
          forceRefresh: forceRefresh,
        );
    if (!mounted) return;
    setState(() {
      _locating = false;
      _location = result.location;
      _locationFailure = result.failure;
      if (result.location == null) {
        _locationError = _messageForLocationFailure(result.failure);
      }
    });
  }

  String _messageForLocationFailure(LocationFailure? failure) {
    return switch (failure) {
      LocationFailure.permissionDenied => AppStrings.locationPermissionDenied,
      LocationFailure.permissionPermanentlyDenied =>
        AppStrings.locationPermissionSettings,
      LocationFailure.serviceDisabled => AppStrings.locationServiceDisabled,
      LocationFailure.timeout => AppStrings.locationTimeout,
      _ => AppStrings.locationUnavailable,
    };
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final total = ref.watch(cartProvider.notifier).total;
    final user = ref.watch(authStateProvider).valueOrNull;

    if (user?.phone != null && _phone.text.isEmpty) {
      _phone.text = user!.phone!;
    }
    if (user?.defaultDeliveryAddress != null && _address.text.isEmpty) {
      _address.text = user!.defaultDeliveryAddress!;
    }

    final canSubmit = cart.isNotEmpty &&
        _location != null &&
        _location!.isValid &&
        _address.text.trim().length >= 3 &&
        _phone.text.trim().length >= 9;

    return Scaffold(
      appBar: AppBar(title: Text(AppStrings.checkout, style: AppTypography.title)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          FoodAppInput(
            label: AppStrings.phone,
            controller: _phone,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: AppSpacing.md),
          FoodAppInput(
            label: AppStrings.deliveryAddress,
            controller: _address,
          ),
          const SizedBox(height: AppSpacing.md),
          FoodAppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(AppStrings.deliveryLocation, style: AppTypography.subtitle),
                const SizedBox(height: AppSpacing.sm),
                if (_locating)
                  const Row(
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: 12),
                      Text('GPS...'),
                    ],
                  )
                else if (_location != null)
                  Text(
                    '${_locationLabel(_location!)}\n'
                    '${_location!.latitude.toStringAsFixed(5)}, '
                    '${_location!.longitude.toStringAsFixed(5)}',
                    style: AppTypography.bodySmall,
                  )
                else if (_locationError != null) ...[
                  Text(_locationError!, style: AppTypography.bodySmall.copyWith(color: AppColors.danger)),
                  if (_locationFailure == LocationFailure.permissionPermanentlyDenied) ...[
                    const SizedBox(height: AppSpacing.sm),
                    const _OpenAppSettingsButton(),
                  ],
                ],
                const SizedBox(height: AppSpacing.md),
                FoodAppButton(
                  label: AppStrings.detectLocation,
                  variant: FoodAppButtonVariant.secondary,
                  expanded: false,
                  onPressed: _locating ? null : () => _loadLocation(forceRefresh: true),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(AppStrings.deliveryMethod, style: AppTypography.subtitle),
          RadioGroup<String>(
            groupValue: _deliveryMethod,
            onChanged: (v) {
              if (v != null) setState(() => _deliveryMethod = v);
            },
            child: const RadioListTile<String>(
              value: 'courier',
              title: Text('Kuryer'),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(AppStrings.paymentMethod, style: AppTypography.subtitle),
          RadioGroup<String>(
            groupValue: _paymentMethod,
            onChanged: (v) {
              if (v != null) setState(() => _paymentMethod = v);
            },
            child: const RadioListTile<String>(
              value: 'cash',
              title: Text('Naqd'),
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          Text('${AppStrings.total}: ${total.toStringAsFixed(0)} UZS', style: AppTypography.title),
          const SizedBox(height: AppSpacing.lg),
          FoodAppButton(
            label: AppStrings.placeOrder,
            isLoading: _loading,
            onPressed: canSubmit ? () => _submit(cart, user?.id) : null,
          ),
        ],
      ),
    );
  }

  String _locationLabel(DeliveryLocation loc) {
    return switch (loc.source) {
      LocationSource.gps => AppStrings.locationGps,
      LocationSource.cached => AppStrings.locationCached,
      LocationSource.profile => AppStrings.locationProfile,
      LocationSource.manual => AppStrings.locationManual,
    };
  }

  Future<void> _submit(List<CartItemModel> items, String? customerId) async {
    final businessId = ref.read(cartProvider.notifier).businessId;
    final loc = _location;
    if (businessId == null || loc == null) return;

    await ref.read(locationServiceProvider).saveManual(
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: _address.text.trim(),
        );

    setState(() => _loading = true);
    try {
      final order = CreateGuestOrderModel(
        restaurantId: businessId,
        phone: _phone.text.trim(),
        deliveryAddress: _address.text.trim(),
        latitude: loc.latitude,
        longitude: loc.longitude,
        customerId: customerId,
        items: [
          for (final i in items)
            GuestOrderItemModel(productId: i.productId, quantity: i.quantity),
        ],
      );
      final res = await ref.read(ordersRepositoryProvider).createGuestOrder(order);
      ref.read(cartProvider.notifier).clear();
      if (!mounted) return;

      final token = res.trackingToken;
      if (token != null && token.isNotEmpty) {
        context.go('${AppRoutes.orderTrack}/$token');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppStrings.orderNumber}: ${res.orderNumber}')),
        );
        context.go(AppRoutes.restaurants);
      }
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : e.message;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg ?? AppStrings.errorGeneric)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}

class _OpenAppSettingsButton extends StatelessWidget {
  const _OpenAppSettingsButton();

  @override
  Widget build(BuildContext context) {
    return FoodAppButton(
      label: AppStrings.openSettings,
      variant: FoodAppButtonVariant.secondary,
      expanded: false,
      onPressed: openAppSettings,
    );
  }
}

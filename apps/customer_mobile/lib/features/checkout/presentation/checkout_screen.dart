import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/location/location_providers.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/cart_item_model.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/customer_page.dart';
import '../../../shared/widgets/delivery_location_field.dart';
import '../../../shared/widgets/food_app_button.dart';
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
  final _comment = TextEditingController();
  final _promoCode = TextEditingController();

  double? _lat;
  double? _lng;
  bool _sendingLocation = false;
  num? _deliveryFee;
  bool _deliveryLoading = false;
  String? _deliveryError;
  num _promoDiscount = 0;
  String _promoMessage = '';
  bool _validatingPromo = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _phone.dispose();
    _address.dispose();
    _comment.dispose();
    _promoCode.dispose();
    super.dispose();
  }

  bool get _locationSent => _lat != null && _lng != null;

  Future<void> _sendLocation() async {
    setState(() {
      _sendingLocation = true;
      _error = null;
    });
    final result = await ref.read(locationServiceProvider).resolveForCheckout(
          forceRefresh: true,
        );
    if (!mounted) return;
    final businessId = ref.read(cartProvider.notifier).businessId;
    setState(() {
      _sendingLocation = false;
      final loc = result.location;
      if (loc != null && loc.isValid) {
        _lat = loc.latitude;
        _lng = loc.longitude;
      } else {
        _lat = null;
        _lng = null;
        _error = AppStrings.locationSendFailed;
      }
    });
    await _refreshDeliveryQuote(businessId);
  }

  Future<void> _refreshDeliveryQuote(String? businessId) async {
    if (businessId == null || _lat == null || _lng == null) {
      setState(() {
        _deliveryFee = null;
        _deliveryError = null;
        _deliveryLoading = false;
      });
      return;
    }

    setState(() {
      _deliveryLoading = true;
      _deliveryError = null;
    });

    try {
      final quote = await ref.read(ordersRepositoryProvider).fetchDeliveryQuote(
            restaurantId: businessId,
            latitude: _lat!,
            longitude: _lng!,
          );
      if (!mounted) return;
      setState(() {
        _deliveryFee = quote.deliveryFee;
        _deliveryLoading = false;
      });
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : e.message;
      if (!mounted) return;
      setState(() {
        _deliveryFee = null;
        _deliveryError = msg ?? AppStrings.orderFailed;
        _deliveryLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _deliveryFee = null;
        _deliveryError = AppStrings.orderFailed;
        _deliveryLoading = false;
      });
    }
  }

  Future<void> _applyPromo(String businessId, num subtotal, String? customerId) async {
    final code = _promoCode.text.trim();
    if (code.isEmpty) return;
    setState(() {
      _validatingPromo = true;
      _promoMessage = '';
    });
    try {
      final res = await ref.read(ordersRepositoryProvider).validatePromoCode(
            code: code,
            restaurantId: businessId,
            subtotal: subtotal,
            customerId: customerId,
          );
      if (!mounted) return;
      setState(() {
        if (res.valid) {
          _promoDiscount = res.discount;
          _promoMessage = AppStrings.promoDiscount(formatSum(res.discount));
        } else {
          _promoDiscount = 0;
          _promoMessage = res.message ?? AppStrings.invalidPromo;
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _promoDiscount = 0;
        _promoMessage = AppStrings.promoValidateFailed;
      });
    } finally {
      if (mounted) setState(() => _validatingPromo = false);
    }
  }

  Future<void> _submit(List<CartItemModel> items, String? customerId) async {
    final businessId = ref.read(cartProvider.notifier).businessId;
    if (businessId == null) return;

    final locationError = validateDeliveryLocation(
      address: _address.text,
      lat: _lat,
      lng: _lng,
    );
    if (locationError != null) {
      setState(() => _error = locationError);
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await ref.read(ordersRepositoryProvider).createGuestOrder(
            CreateGuestOrderModel(
              restaurantId: businessId,
              phone: _phone.text.trim(),
              deliveryAddress: _address.text.trim(),
              latitude: _lat!,
              longitude: _lng!,
              customerId: customerId,
              comment: _comment.text.trim().isEmpty ? null : _comment.text.trim(),
              promoCode: _promoCode.text.trim().isEmpty ? null : _promoCode.text.trim(),
              items: [
                for (final i in items)
                  GuestOrderItemModel(productId: i.productId, quantity: i.quantity),
              ],
            ),
          );
      ref.read(cartProvider.notifier).clear();
      if (!mounted) return;

      final token = res.trackingToken;
      if (token != null && token.isNotEmpty) {
        context.go('${AppRoutes.orderTrack}/$token');
      } else {
        context.go(AppRoutes.restaurants);
      }
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : e.message;
      if (mounted) setState(() => _error = msg ?? AppStrings.orderFailed);
    } catch (_) {
      if (mounted) setState(() => _error = AppStrings.orderFailed);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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

    if (cart.isEmpty) {
      return CustomerPage(
        child: Column(
          children: [
            const SizedBox(height: 32),
            Text(AppStrings.cartEmpty, style: AppTypography.subtitle),
            const SizedBox(height: AppSpacing.lg),
            GestureDetector(
              onTap: () => context.go(AppRoutes.restaurants),
              child: Text(
                AppStrings.browseRestaurants,
                style: AppTypography.body.copyWith(color: AppColors.primary),
              ),
            ),
          ],
        ),
      );
    }

    final businessId = ref.read(cartProvider.notifier).businessId;

    return CustomerPage(
      title: AppStrings.checkoutTitle,
      subtitle: AppStrings.noAccountRequired,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CustomerCard(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              children: [
                for (var i = 0; i < cart.length; i++) ...[
                  if (i > 0) const SizedBox(height: AppSpacing.sm),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          '${cart[i].name} × ${cart[i].quantity}',
                          style: AppTypography.bodySmall,
                        ),
                      ),
                      Text(
                        formatSum(cart[i].price * cart[i].quantity),
                        style: AppTypography.bodySmall,
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          _CheckoutTotals(
            subtotal: total,
            promoDiscount: _promoDiscount,
            deliveryFee: _deliveryFee,
            deliveryLoading: _deliveryLoading,
            deliveryError: _deliveryError,
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: CustomerTextField(
                  controller: _promoCode,
                  placeholder: AppStrings.promoCode,
                  textCapitalization: TextCapitalization.characters,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              SizedBox(
                width: 108,
                child: FoodAppButton(
                  label: _validatingPromo ? '...' : AppStrings.apply,
                  variant: FoodAppButtonVariant.secondary,
                  expanded: true,
                  onPressed: _validatingPromo || businessId == null
                      ? null
                      : () => _applyPromo(businessId, total, user?.id),
                ),
              ),
            ],
          ),
          if (_promoMessage.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              _promoMessage,
              style: AppTypography.bodySmall.copyWith(color: AppColors.primary),
            ),
          ],
          const SizedBox(height: AppSpacing.xxl),
          CustomerTextField(
            controller: _phone,
            placeholder: AppStrings.phonePlaceholder,
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: AppSpacing.lg),
          DeliveryLocationField(
            addressController: _address,
            locationSent: _locationSent,
            sending: _sendingLocation,
            onSendLocation: _sendLocation,
          ),
          const SizedBox(height: AppSpacing.lg),
          CustomerTextField(
            controller: _comment,
            placeholder: AppStrings.commentOptional,
            maxLines: 2,
          ),
          if (_error != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              _error!,
              style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
            ),
          ],
          const SizedBox(height: AppSpacing.xxl),
          FoodAppButton(
            label: _loading ? AppStrings.placingOrder : AppStrings.placeOrder,
            isLoading: _loading,
            onPressed: _loading ? null : () => _submit(cart, user?.id),
          ),
        ],
      ),
    );
  }
}

class _CheckoutTotals extends StatelessWidget {
  const _CheckoutTotals({
    required this.subtotal,
    required this.promoDiscount,
    required this.deliveryFee,
    required this.deliveryLoading,
    required this.deliveryError,
  });

  final num subtotal;
  final num promoDiscount;
  final num? deliveryFee;
  final bool deliveryLoading;
  final String? deliveryError;

  @override
  Widget build(BuildContext context) {
    final netSubtotal = subtotal - promoDiscount;
    final total = deliveryFee != null ? netSubtotal + deliveryFee! : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(AppStrings.productsSubtotal, style: AppTypography.bodySmall),
            Text(formatSum(subtotal), style: AppTypography.bodySmall),
          ],
        ),
        if (promoDiscount > 0) ...[
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(AppStrings.promoCode, style: AppTypography.bodySmall.copyWith(color: AppColors.success)),
              Text('−${formatSum(promoDiscount)}', style: AppTypography.bodySmall.copyWith(color: AppColors.success)),
            ],
          ),
        ],
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(AppStrings.deliveryLabel, style: AppTypography.bodySmall),
            Text(
              deliveryLoading
                  ? AppStrings.detectingLocation
                  : deliveryError != null
                      ? '—'
                      : deliveryFee != null
                          ? formatSum(deliveryFee)
                          : AppStrings.locationRequiredShort,
              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        if (deliveryError != null) ...[
          const SizedBox(height: 4),
          Text(deliveryError!, style: AppTypography.bodySmall.copyWith(color: AppColors.danger)),
        ],
        if (total != null) ...[
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(AppStrings.orderTotal, style: AppTypography.subtitle),
              Text(formatSum(total), style: AppTypography.subtitle),
            ],
          ),
        ],
      ],
    );
  }
}

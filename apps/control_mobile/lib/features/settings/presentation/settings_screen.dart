import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/section_panel.dart';
import '../data/delivery_pricing_model.dart';
import '../data/settings_model.dart';
import '../data/settings_repository.dart';

final settingsProvider = FutureProvider.autoDispose<AdminSettings>((ref) {
  return ref.watch(settingsRepositoryProvider).fetchAdminSettings();
});

final deliveryPricingProvider =
    FutureProvider.autoDispose<DeliveryPricing>((ref) {
  return ref.watch(settingsRepositoryProvider).fetchDeliveryPricing();
});

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _appName = TextEditingController();
  final _supportPhone = TextEditingController();
  final _supportEmail = TextEditingController();
  final _minOrder = TextEditingController();
  final _deliveryFee = TextEditingController();
  final _commission = TextEditingController();
  final _baseFee = TextEditingController();
  final _perKm = TextEditingController();
  final _maxDist = TextEditingController();
  final _courierPerKm = TextEditingController();
  final _courierMin = TextEditingController();
  bool _hydrated = false;
  bool _pricingHydrated = false;
  bool _saving = false;
  bool _savingPricing = false;
  String? _message;

  @override
  void dispose() {
    _appName.dispose();
    _supportPhone.dispose();
    _supportEmail.dispose();
    _minOrder.dispose();
    _deliveryFee.dispose();
    _commission.dispose();
    _baseFee.dispose();
    _perKm.dispose();
    _maxDist.dispose();
    _courierPerKm.dispose();
    _courierMin.dispose();
    super.dispose();
  }

  void _fill(AdminSettings s) {
    _appName.text = s.appName;
    _supportPhone.text = s.supportPhone;
    _supportEmail.text = s.supportEmail;
    _minOrder.text = s.minOrderAmount.toString();
    _deliveryFee.text = s.defaultDeliveryFee.toString();
    _commission.text = s.commissionDefault.toString();
    _hydrated = true;
  }

  void _fillPricing(DeliveryPricing p) {
    _baseFee.text = p.baseDeliveryFee.toString();
    _perKm.text = p.perKmFee.toString();
    _maxDist.text = p.maxDeliveryDistance.toString();
    _courierPerKm.text = p.courierPricePerKm.toString();
    _courierMin.text = p.courierMinFee.toString();
    _pricingHydrated = true;
  }

  Future<void> _save(AdminSettings current) async {
    setState(() {
      _saving = true;
      _message = null;
    });
    try {
      final updated = AdminSettings(
        appName: _appName.text.trim(),
        homeTitle: current.homeTitle,
        homeSubtitle: current.homeSubtitle,
        homeRestaurantsBannerImageUrl: current.homeRestaurantsBannerImageUrl,
        homeRestaurantsBannerTitle: current.homeRestaurantsBannerTitle,
        supportPhone: _supportPhone.text.trim(),
        partnershipPhone: current.partnershipPhone,
        socialInstagramUrl: current.socialInstagramUrl,
        socialYoutubeUrl: current.socialYoutubeUrl,
        supportEmail: _supportEmail.text.trim(),
        minOrderAmount: num.tryParse(_minOrder.text.trim()) ?? current.minOrderAmount,
        freeDeliveryThreshold: current.freeDeliveryThreshold,
        defaultDeliveryFee:
            num.tryParse(_deliveryFee.text.trim()) ?? current.defaultDeliveryFee,
        commissionDefault:
            num.tryParse(_commission.text.trim()) ?? current.commissionDefault,
        courierDispatchMode: current.courierDispatchMode,
        bannerDefaultImageScale: current.bannerDefaultImageScale,
        bannerDefaultImagePositionX: current.bannerDefaultImagePositionX,
        bannerDefaultImagePositionY: current.bannerDefaultImagePositionY,
        restaurantCardDefaultImageScale: current.restaurantCardDefaultImageScale,
        restaurantCardDefaultCoverPositionX:
            current.restaurantCardDefaultCoverPositionX,
        restaurantCardDefaultCoverPositionY:
            current.restaurantCardDefaultCoverPositionY,
      );
      await ref.read(settingsRepositoryProvider).updateAdminSettings(updated);
      ref.invalidate(settingsProvider);
      if (mounted) {
        setState(() => _message = AppStrings.saved);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _message = ApiException.formatError(e));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _savePricing(DeliveryPricing current) async {
    setState(() => _savingPricing = true);
    try {
      final updated = DeliveryPricing(
        baseDeliveryFee:
            num.tryParse(_baseFee.text.trim()) ?? current.baseDeliveryFee,
        perKmFee: num.tryParse(_perKm.text.trim()) ?? current.perKmFee,
        maxDeliveryDistance:
            num.tryParse(_maxDist.text.trim()) ?? current.maxDeliveryDistance,
        courierPricePerKm: num.tryParse(_courierPerKm.text.trim()) ??
            current.courierPricePerKm,
        courierMinFee:
            num.tryParse(_courierMin.text.trim()) ?? current.courierMinFee,
      );
      await ref
          .read(settingsRepositoryProvider)
          .updateDeliveryPricing(updated);
      ref.invalidate(deliveryPricingProvider);
      if (mounted) showActionSnackBar(context, AppStrings.saved);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _savingPricing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(settingsProvider);
    final pricingAsync = ref.watch(deliveryPricingProvider);

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.xxl,
      ),
      children: [
        const PageHeader(
          padded: false,
          title: AppStrings.settingsTitle,
          subtitle: AppStrings.mediaSectionHint,
        ),
        const SizedBox(height: 12),
        SectionPanel(
          title: AppStrings.mediaSection,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FilledButton.icon(
                onPressed: () => context.go(AppRoutes.promotions),
                icon: const Icon(Icons.image_outlined),
                label: const Text(AppStrings.bannerSurfaceHomeOffers),
              ),
              const SizedBox(height: 8),
              FilledButton.tonalIcon(
                onPressed: () => context.go(AppRoutes.catalog),
                icon: const Icon(Icons.category_outlined),
                label: const Text(AppStrings.categoriesSection),
              ),
              const SizedBox(height: 8),
              FilledButton.tonalIcon(
                onPressed: () => context.go(AppRoutes.businesses),
                icon: const Icon(Icons.storefront_outlined),
                label: const Text(AppStrings.navBusinesses),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionPanel(
          title: AppStrings.platformSection,
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final item in const [
                (AppStrings.navEmployees, AppRoutes.employees),
                (AppStrings.navBusinesses, AppRoutes.businesses),
                (AppStrings.navPush, AppRoutes.push),
                (AppStrings.navCouriers, AppRoutes.couriers),
                (AppStrings.navCustomers, AppRoutes.customers),
                (AppStrings.navCities, AppRoutes.cities),
                (AppStrings.navBusinessTypes, AppRoutes.businessTypes),
                (AppStrings.navBooking, AppRoutes.booking),
                (AppStrings.navAudit, AppRoutes.audit),
              ])
                OutlinedButton(
                  onPressed: () => context.go(item.$2),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 40),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                  ),
                  child: Text(item.$1),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        AsyncPageBody<AdminSettings>(
          asyncValue: async,
          onRefresh: () {
            _hydrated = false;
            return ref.refresh(settingsProvider.future);
          },
          padding: EdgeInsets.zero,
          dataBuilder: (settings) {
            if (!_hydrated) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) setState(() => _fill(settings));
              });
            }
            return SectionPanel(
              title: AppStrings.settingsAppName,
              child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _appName,
                  decoration: const InputDecoration(
                    labelText: AppStrings.settingsAppName,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _supportPhone,
                  decoration: const InputDecoration(
                    labelText: AppStrings.settingsSupportPhone,
                  ),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _supportEmail,
                  decoration: const InputDecoration(
                    labelText: AppStrings.settingsSupportEmail,
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _minOrder,
                  decoration: const InputDecoration(
                    labelText: AppStrings.settingsMinOrder,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _deliveryFee,
                  decoration: const InputDecoration(
                    labelText: AppStrings.settingsDeliveryFee,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _commission,
                  decoration: const InputDecoration(
                    labelText: AppStrings.settingsCommission,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _saving ? null : () => _save(settings),
                  child: Text(_saving ? AppStrings.loading : AppStrings.save),
                ),
                if (_message != null) ...[
                  const SizedBox(height: 12),
                  Text(_message!, style: AppTypography.bodySmall),
                ],
              ],
            ),
            );
          },
        ),
        const SizedBox(height: 16),
        pricingAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text(ApiException.formatError(e)),
          data: (pricing) {
            if (!_pricingHydrated) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) setState(() => _fillPricing(pricing));
              });
            }
            return SectionPanel(
              title: AppStrings.deliveryPricing,
              child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _baseFee,
                  decoration: const InputDecoration(
                    labelText: AppStrings.baseDeliveryFee,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _perKm,
                  decoration: const InputDecoration(
                    labelText: AppStrings.perKmFee,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _maxDist,
                  decoration: const InputDecoration(
                    labelText: AppStrings.maxDeliveryDistance,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _courierPerKm,
                  decoration: const InputDecoration(
                    labelText: AppStrings.courierPricePerKm,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _courierMin,
                  decoration: const InputDecoration(
                    labelText: AppStrings.courierMinFee,
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                MutationButton(
                  label: AppStrings.save,
                  loading: _savingPricing,
                  onPressed: () => _savePricing(pricing),
                ),
              ],
            ),
            );
          },
        ),
      ],
    );
  }
}

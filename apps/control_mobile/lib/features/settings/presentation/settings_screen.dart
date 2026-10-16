import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../data/settings_model.dart';
import '../data/settings_repository.dart';

final settingsProvider = FutureProvider.autoDispose<AdminSettings>((ref) {
  return ref.watch(settingsRepositoryProvider).fetchAdminSettings();
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
  final _supportTelegram = TextEditingController();
  final _minOrder = TextEditingController();
  final _deliveryFee = TextEditingController();
  final _commission = TextEditingController();
  bool _hydrated = false;
  bool _saving = false;
  String? _message;

  @override
  void dispose() {
    _appName.dispose();
    _supportPhone.dispose();
    _supportEmail.dispose();
    _supportTelegram.dispose();
    _minOrder.dispose();
    _deliveryFee.dispose();
    _commission.dispose();
    super.dispose();
  }

  void _fill(AdminSettings s) {
    _appName.text = s.appName;
    _supportPhone.text = s.supportPhone;
    _supportEmail.text = s.supportEmail;
    _supportTelegram.text = s.supportTelegram;
    _minOrder.text = s.minOrderAmount.toString();
    _deliveryFee.text = s.defaultDeliveryFee.toString();
    _commission.text = s.commissionDefault.toString();
    _hydrated = true;
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
        supportTelegram: _supportTelegram.text.trim(),
        helpTelegramUrl: current.helpTelegramUrl,
        partnershipTelegramUrl: current.partnershipTelegramUrl,
        partnershipPhone: current.partnershipPhone,
        socialInstagramUrl: current.socialInstagramUrl,
        socialTelegramUrl: current.socialTelegramUrl,
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

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(settingsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Text(AppStrings.settingsTitle, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<AdminSettings>(
            asyncValue: async,
            onRefresh: () {
              _hydrated = false;
              return ref.refresh(settingsProvider.future);
            },
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (settings) {
              if (!_hydrated) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) setState(() => _fill(settings));
                });
              }
              return Column(
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
                    controller: _supportTelegram,
                    decoration: const InputDecoration(
                      labelText: AppStrings.settingsSupportTelegram,
                    ),
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
              );
            },
          ),
        ),
      ],
    );
  }
}

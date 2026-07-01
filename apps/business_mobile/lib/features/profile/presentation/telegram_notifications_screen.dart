import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../restaurant/data/restaurant_repository.dart';

class TelegramNotificationsScreen extends ConsumerStatefulWidget {
  const TelegramNotificationsScreen({super.key});

  @override
  ConsumerState<TelegramNotificationsScreen> createState() =>
      _TelegramNotificationsScreenState();
}

class _TelegramNotificationsScreenState
    extends ConsumerState<TelegramNotificationsScreen> {
  final _controller = TextEditingController();
  bool _saving = false;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted) ref.invalidate(_restaurantProvider);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _save(String restaurantId) async {
    setState(() => _saving = true);
    try {
      final chatId = _controller.text.trim();
      await ref.read(restaurantRepositoryProvider).updateTelegramChatId(
            restaurantId,
            chatId.isEmpty ? null : chatId,
          );
      ref.invalidate(_restaurantProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text(AppStrings.telegramSaved)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String _formatCountdown(String? iso) {
    if (iso == null || iso.isEmpty) return '';
    final expires = DateTime.tryParse(iso);
    if (expires == null) return '';
    final diff = expires.difference(DateTime.now());
    if (diff.isNegative) return '0:00';
    final min = diff.inMinutes.remainder(60);
    final sec = diff.inSeconds.remainder(60);
    return '$min:${sec.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final restaurantAsync = ref.watch(_restaurantProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.telegramOrders),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: SafeArea(
        child: restaurantAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(e.toString())),
          data: (restaurant) {
            if (restaurant == null) {
              return const Center(child: Text(AppStrings.noRestaurantLinked));
            }
            if (_controller.text.isEmpty &&
                (restaurant.telegramOrderChatId?.isNotEmpty ?? false)) {
              _controller.text = restaurant.telegramOrderChatId!;
            }

            final isLinked = restaurant.telegramOrderChatId?.isNotEmpty ?? false;
            final pendingCode = restaurant.telegramLinkCode;
            final countdown = _formatCountdown(restaurant.telegramLinkExpiresAt);

            return ListView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              children: [
                Text(AppStrings.telegramOrdersHint, style: AppTypography.bodySmall),
                const SizedBox(height: AppSpacing.lg),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(AppStrings.telegramOrdersHowTo, style: AppTypography.caption),
                      const SizedBox(height: AppSpacing.md),
                      if (isLinked)
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${AppStrings.telegramLinked}: ${restaurant.telegramOrderChatId}',
                            style: AppTypography.bodySmall,
                          ),
                        ),
                      if (pendingCode != null && pendingCode.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.md),
                        Text(AppStrings.telegramPairingCode, style: AppTypography.subtitle),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          pendingCode,
                          textAlign: TextAlign.center,
                          style: AppTypography.title.copyWith(letterSpacing: 8),
                        ),
                        if (countdown.isNotEmpty)
                          Text(
                            '${AppStrings.telegramCodeExpires}: $countdown',
                            textAlign: TextAlign.center,
                            style: AppTypography.caption,
                          ),
                      ] else if (!isLinked) ...[
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          AppStrings.telegramWaitingCode,
                          style: AppTypography.caption,
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                ExpansionTile(
                  title: const Text('Qo\'lda chat ID'),
                  children: [
                    TextField(
                      controller: _controller,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        hintText: '123456789',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    FoodAppButton(
                      label: AppStrings.save,
                      isLoading: _saving,
                      onPressed: _saving ? null : () => _save(restaurant.id),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

final _restaurantProvider = FutureProvider.autoDispose((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
});

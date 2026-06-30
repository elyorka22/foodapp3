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

  @override
  void dispose() {
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
            return ListView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              children: [
                Text(AppStrings.telegramOrdersHint, style: AppTypography.bodySmall),
                const SizedBox(height: AppSpacing.lg),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(AppStrings.telegramChatId, style: AppTypography.subtitle),
                      const SizedBox(height: AppSpacing.sm),
                      TextField(
                        controller: _controller,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: '123456789',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(AppStrings.telegramOrdersHowTo, style: AppTypography.caption),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                FoodAppButton(
                  label: AppStrings.save,
                  loading: _saving,
                  onPressed: _saving ? null : () => _save(restaurant.id),
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

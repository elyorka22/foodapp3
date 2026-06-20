import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/models/order_model.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/screen_header.dart';
import '../data/couriers_repository.dart';

final couriersListProvider = FutureProvider.autoDispose<List<CourierListItemModel>>((ref) async {
  return ref.watch(couriersRepositoryProvider).fetchCouriers();
});

class ManagerCouriersScreen extends ConsumerStatefulWidget {
  const ManagerCouriersScreen({super.key});

  @override
  ConsumerState<ManagerCouriersScreen> createState() => _ManagerCouriersScreenState();
}

class _ManagerCouriersScreenState extends ConsumerState<ManagerCouriersScreen> {
  String? _actingId;

  @override
  Widget build(BuildContext context) {
    final couriers = ref.watch(couriersListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.managerCourierNew),
        icon: const Icon(Icons.person_add_outlined),
        label: const Text(AppStrings.createCourier),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(couriersListProvider),
        child: ListView(
          padding: scrollFabPadding(context),
          children: [
            const ScreenHeader(
              title: AppStrings.couriers,
              subtitle: 'Kuryerlarni yarating va boshqaring',
            ),
            couriers.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => ErrorState(
                message: ApiException.formatError(e),
                onRetry: () => ref.invalidate(couriersListProvider),
              ),
              data: (list) {
                if (list.isEmpty) {
                  return EmptyState(
                    icon: Icons.delivery_dining_outlined,
                    title: AppStrings.noCouriers,
                    actionLabel: AppStrings.createCourier,
                    onAction: () => context.push(AppRoutes.managerCourierNew),
                  );
                }
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    children: list.map((courier) {
                      final isActing = _actingId == courier.id;
                      return AppCard(
                        child: Row(
                          children: [
                            Stack(
                              children: [
                                CircleAvatar(
                                  radius: 24,
                                  backgroundColor: AppColors.primarySoft,
                                  child: Text(
                                    courier.fullName.characters.first,
                                    style: AppTypography.subtitle.copyWith(color: AppColors.primary),
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  bottom: 0,
                                  child: Container(
                                    width: 12,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: courier.isOnline ? AppColors.success : AppColors.textMuted,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(courier.fullName, style: AppTypography.subtitle),
                                  if (courier.phone != null)
                                    Text(courier.phone!, style: AppTypography.bodySmall),
                                  Text(
                                    courier.isOnline ? AppStrings.online : AppStrings.offline,
                                    style: AppTypography.caption.copyWith(
                                      color: courier.isOnline ? AppColors.success : AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (isActing)
                              const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            else
                              TextButton(
                                onPressed: () => _toggleActive(courier),
                                child: Text(
                                  courier.isActive ? AppStrings.block : AppStrings.unblock,
                                  style: TextStyle(
                                    color: courier.isActive ? AppColors.danger : AppColors.success,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _toggleActive(CourierListItemModel courier) async {
    setState(() => _actingId = courier.id);
    try {
      await ref
          .read(couriersRepositoryProvider)
          .setCourierActive(courier.id, !courier.isActive);
      ref.invalidate(couriersListProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingId = null);
    }
  }
}

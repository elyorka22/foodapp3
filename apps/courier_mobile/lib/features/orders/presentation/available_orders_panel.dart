import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/compact_order_tile.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../home/providers/courier_home_provider.dart';
import '../data/courier_repository.dart';

/// Opens a modal with all pool orders. Courier taps a row to accept it.
Future<void> showAvailableOrdersPanel(
  BuildContext context,
  WidgetRef ref, {
  bool playSoundOnOpen = false,
}) async {
  if (playSoundOnOpen) {
    // Sound is played by the watcher before opening; keep hook for manual open.
  }

  if (!context.mounted) return;
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => const _AvailableOrdersPanel(),
  );
}

class _AvailableOrdersPanel extends ConsumerStatefulWidget {
  const _AvailableOrdersPanel();

  @override
  ConsumerState<_AvailableOrdersPanel> createState() => _AvailableOrdersPanelState();
}

class _AvailableOrdersPanelState extends ConsumerState<_AvailableOrdersPanel> {
  String? _acceptingId;

  Future<void> _acceptOrder(CourierOrderModel order) async {
    if (_acceptingId != null) return;

    final online = ref.read(courierOnlineProvider).valueOrNull ?? false;
    if (!online) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.mustBeOnline)),
      );
      return;
    }

    setState(() => _acceptingId = order.id);
    try {
      await ref.read(courierRepositoryProvider).acceptOrder(order.id);
      ref.invalidate(activeOrderProvider);
      ref.invalidate(availableOrdersProvider);
      if (!mounted) return;
      Navigator.of(context).pop();
      context.push(AppRoutes.activeOrder, extra: order.id);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
      ref.invalidate(availableOrdersProvider);
    } finally {
      if (mounted) setState(() => _acceptingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(availableOrdersProvider);
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: 0.88,
        minChildSize: 0.45,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 10),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    AppSpacing.md,
                    AppSpacing.lg,
                    AppSpacing.sm,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppStrings.availableOrdersTitle,
                              style: AppTypography.subtitle.copyWith(fontSize: 18),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              AppStrings.availableOrdersHint,
                              style: AppTypography.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Expanded(
                  child: ordersAsync.when(
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Center(child: Text(e.toString())),
                    data: (orders) {
                      final offers =
                          orders.where((order) => order.isPendingOffer).toList();
                      if (offers.isEmpty) {
                        return Center(
                          child: Padding(
                            padding: const EdgeInsets.all(AppSpacing.xl),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.inbox_outlined,
                                  size: 56,
                                  color: AppColors.textMuted,
                                ),
                                const SizedBox(height: AppSpacing.md),
                                Text(
                                  AppStrings.noAvailableOrders,
                                  style: AppTypography.subtitle,
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                Text(
                                  AppStrings.waitingOrdersHint,
                                  style: AppTypography.bodySmall,
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        );
                      }

                      return ListView.separated(
                        controller: scrollController,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        itemCount: offers.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 6),
                        itemBuilder: (context, index) {
                          final order = offers[index];
                          final isAccepting = _acceptingId == order.id;
                          return CompactOrderTile(
                            order: order,
                            isLoading: isAccepting,
                            onAccept: isAccepting ? null : () => _acceptOrder(order),
                          );
                        },
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: FoodAppButton(
                    label: AppStrings.close,
                    variant: FoodAppButtonVariant.secondary,
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

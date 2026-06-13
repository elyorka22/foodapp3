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
import '../../../shared/widgets/active_job_hero.dart';
import '../../../shared/widgets/job_offer_card.dart';
import '../../../shared/widgets/shift_stats_bar.dart';
import '../../../shared/widgets/new_job_alert_banner.dart';
import '../../../shared/widgets/shift_status_header.dart';
import '../../home/providers/courier_home_provider.dart';
import '../../orders/data/courier_repository.dart';
import '../../orders/providers/new_job_alert_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String? _actingOrderId;
  bool _shiftLoading = false;
  bool _profileLoaded = false;
  @override
  void initState() {
    super.initState();
    Future.microtask(_loadProfile);
  }

  Future<void> _loadProfile() async {
    await ref.read(courierOnlineProvider.notifier).load();
    syncShiftSessionFromBackend(ref);
    if (mounted) setState(() => _profileLoaded = true);
  }

  Future<void> _refresh() async {
    if (!ref.read(shiftSessionOpenProvider) &&
        !(ref.read(courierOnlineProvider).valueOrNull ?? false)) {
      return;
    }
    ref.invalidate(activeOrderProvider);
    ref.invalidate(availableOrdersProvider);
    ref.invalidate(shiftStatsProvider);
    ref.invalidate(notificationsUnreadProvider);
  }

  Future<void> _toggleShift() async {
    final shiftOpen = ref.read(shiftSessionOpenProvider);
    if (_shiftLoading) return;
    if (shiftOpen && ref.read(activeOrderProvider).valueOrNull != null) return;

    setState(() => _shiftLoading = true);
    try {
      await ref.read(courierOnlineProvider.notifier).setOnline(!shiftOpen);
      if (!mounted) return;
      ref.read(shiftSessionOpenProvider.notifier).state = !shiftOpen;
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _shiftLoading = false);
    }
  }

  Future<void> _acceptOrder(CourierOrderModel order) async {
    if (_actingOrderId != null || !ref.read(shiftSessionOpenProvider)) return;

    setState(() => _actingOrderId = order.id);
    try {
      await ref.read(courierRepositoryProvider).acceptOrder(order.id);
      ref.read(newJobAlertProvider.notifier).state = null;
      ref.invalidate(activeOrderProvider);
      ref.invalidate(availableOrdersProvider);
      if (!mounted) return;
      context.push(AppRoutes.activeOrder, extra: order.id);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
      ref.invalidate(availableOrdersProvider);
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final shiftOpen = ref.watch(shiftSessionOpenProvider);
    final backendOnline = ref.watch(courierOnlineProvider).valueOrNull ?? false;
    final showInbox = shiftOpen || backendOnline;
    final activeOrder = ref.watch(activeOrderProvider);
    final available = ref.watch(availableOrdersProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final hasActiveOrder = activeOrder.valueOrNull != null;
    final shiftBusy = _shiftLoading || !_profileLoaded;
    final jobAlert = ref.watch(newJobAlertProvider);

    return Scaffold(
      body: Column(
        children: [
          SafeArea(
            bottom: false,
            child: _HomeTopBar(
              unread: unread,
              onNotifications: () => context.push(AppRoutes.notifications),
              onHistory: () => context.push(AppRoutes.orderHistory),
            ),
          ),
          if (jobAlert != null)
            NewJobAlertBanner(
              alert: jobAlert,
              onTap: () {
                ref.read(newJobAlertProvider.notifier).state = null;
                context.push(AppRoutes.incomingOrder, extra: jobAlert.orderId);
              },
              onDismiss: () => ref.read(newJobAlertProvider.notifier).state = null,
            ),
          if (_profileLoaded)
            ShiftStatusHeader(
              isOnline: shiftOpen,
              isLoading: shiftBusy,
              onToggle: shiftBusy || (shiftOpen && hasActiveOrder) ? null : _toggleShift,
            ),
          Expanded(
            child: !_profileLoaded
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _refresh,
                    color: AppColors.primary,
                    child: showInbox
                        ? _JobsInbox(
                            activeOrder: activeOrder,
                            available: available,
                            actingOrderId: _actingOrderId,
                            onAccept: _acceptOrder,
                            onOpenActive: (id) =>
                                context.push(AppRoutes.activeOrder, extra: id),
                          )
                        : const _OfflineWelcome(),
                  ),
          ),
          if (showInbox)
            shiftStats.when(
              loading: () => const SizedBox(
                height: 72,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, __) => const SizedBox.shrink(),
              data: (stats) => ShiftStatsBar(stats: stats),
            ),
        ],
      ),
    );
  }
}

class _HomeTopBar extends StatelessWidget {
  const _HomeTopBar({
    required this.unread,
    required this.onNotifications,
    required this.onHistory,
  });

  final AsyncValue<int> unread;
  final VoidCallback onNotifications;
  final VoidCallback onHistory;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 8, 0),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(AppStrings.appName, style: AppTypography.title),
              Text(AppStrings.appTagline, style: AppTypography.caption),
            ],
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: AppStrings.orderHistory,
            onPressed: onHistory,
          ),
          unread.when(
            data: (count) => Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: onNotifications,
                ),
                if (count > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      child: Text(
                        count > 99 ? '99+' : '$count',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.onPrimary,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            loading: () => IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: onNotifications,
            ),
            error: (_, __) => IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: onNotifications,
            ),
          ),
        ],
      ),
    );
  }
}

class _OfflineWelcome extends StatelessWidget {
  const _OfflineWelcome();

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.xxl),
      children: [
        const SizedBox(height: 48),
        const Icon(Icons.hub_outlined, size: 56, color: AppColors.textMuted),
        const SizedBox(height: AppSpacing.md),
        Text(
          AppStrings.goOnlineToSeeOrders,
          style: AppTypography.body,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _JobsInbox extends StatelessWidget {
  const _JobsInbox({
    required this.activeOrder,
    required this.available,
    required this.actingOrderId,
    required this.onAccept,
    required this.onOpenActive,
  });

  final AsyncValue<CourierOrderModel?> activeOrder;
  final AsyncValue<List<CourierOrderModel>> available;
  final String? actingOrderId;
  final Future<void> Function(CourierOrderModel order) onAccept;
  final void Function(String orderId) onOpenActive;

  @override
  Widget build(BuildContext context) {
    final active = activeOrder.valueOrNull;

    return available.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => const _EmptyInbox(message: AppStrings.noAvailableOrders),
      data: (orders) {
        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
          children: [
            if (active != null)
              ActiveJobHero(
                order: active,
                onOpen: () => onOpenActive(active.id),
              ),
            if (orders.isEmpty)
              const _EmptyInbox(message: AppStrings.noAvailableOrders)
            else
              ...orders.map(
                (order) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: JobOfferCard(
                    order: order,
                    isLoading: actingOrderId == order.id,
                    onAccept: actingOrderId == null ? () => onAccept(order) : null,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _EmptyInbox extends StatelessWidget {
  const _EmptyInbox({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          const Icon(Icons.inbox_outlined, size: 48, color: AppColors.textMuted),
          const SizedBox(height: AppSpacing.md),
          Text(message, style: AppTypography.body, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

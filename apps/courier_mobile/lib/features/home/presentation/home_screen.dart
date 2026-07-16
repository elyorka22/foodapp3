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
import '../../../shared/widgets/app_atmosphere.dart';
import '../../../shared/widgets/brand_mark.dart';
import '../../../shared/widgets/empty_state.dart';
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
    ref.invalidate(activeOrderProvider);
    ref.invalidate(homeInboxProvider);
    if (mounted) setState(() => _profileLoaded = true);
  }

  Future<void> _refresh() async {
    ref.invalidate(activeOrderProvider);
    ref.invalidate(homeInboxProvider);
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
    if (_actingOrderId != null) return;

    setState(() => _actingOrderId = order.id);
    try {
      await ref.read(courierRepositoryProvider).acceptOrder(order.id);
      ref.read(newJobAlertProvider.notifier).state = null;
      removePushInboxOrder(ref, order.id);
      ref.invalidate(activeOrderProvider);
      ref.invalidate(homeInboxProvider);
      if (!mounted) return;
      context.push(AppRoutes.activeOrder, extra: order.id);
    } on DioException catch (e) {
      removePushInboxOrder(ref, order.id);
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
      ref.invalidate(homeInboxProvider);
    } finally {
      if (mounted) setState(() => _actingOrderId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final shiftOpen = ref.watch(shiftSessionOpenProvider);
    final backendOnline = ref.watch(courierOnlineProvider).valueOrNull ?? false;
    final isOnline = shiftOpen || backendOnline;
    final activeOrder = ref.watch(activeOrderProvider);
    final inbox = ref.watch(homeInboxProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final hasActiveOrder = activeOrder.valueOrNull != null;
    final shiftBusy = _shiftLoading || !_profileLoaded;
    final jobAlert = ref.watch(newJobAlertProvider);
    final inboxOrders = inbox.maybeWhen(
      data: (orders) => orders,
      orElse: () => const <CourierOrderModel>[],
    );
    final visibleJobAlert = jobAlert != null &&
            !inboxOrders.any(
              (order) => order.id == jobAlert.orderId && order.isPendingOffer,
            )
        ? jobAlert
        : null;

    ref.listen(homeInboxProvider, (_, next) {
      next.whenData((orders) {
        final alert = ref.read(newJobAlertProvider);
        if (alert == null) return;
        if (orders.any((order) => order.id == alert.orderId && order.isPendingOffer)) {
          ref.read(newJobAlertProvider.notifier).state = null;
        }
      });
    });

    return Scaffold(
      body: AppAtmosphere(
        child: Column(
          children: [
            SafeArea(
              bottom: false,
              child: _HomeTopBar(
                unread: unread,
                onNotifications: () => context.push(AppRoutes.notifications),
                onHistory: () => context.push(AppRoutes.orderHistory),
              ),
            ),
            if (visibleJobAlert != null)
              NewJobAlertBanner(
                alert: visibleJobAlert,
                onTap: () {
                  ref.read(newJobAlertProvider.notifier).state = null;
                  context.push(AppRoutes.incomingOrder, extra: visibleJobAlert.orderId);
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
                      child: _JobsInbox(
                        isOnline: isOnline,
                        inbox: inbox,
                        actingOrderId: _actingOrderId,
                        onAccept: _acceptOrder,
                        onOpenActive: (id) =>
                            context.push(AppRoutes.activeOrder, extra: id),
                        onRetry: _refresh,
                      ),
                    ),
            ),
            if (_profileLoaded)
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
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 4),
      child: Row(
        children: [
          const BrandMark(size: 36, showGlow: false),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.appName, style: AppTypography.title.copyWith(fontSize: 20)),
                Text(
                  AppStrings.appTagline,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.history_rounded),
            tooltip: AppStrings.orderHistory,
            onPressed: onHistory,
          ),
          unread.when(
            data: (count) => Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_none_rounded),
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
                        style: AppTypography.caption.copyWith(
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
              icon: const Icon(Icons.notifications_none_rounded),
              onPressed: onNotifications,
            ),
            error: (_, __) => IconButton(
              icon: const Icon(Icons.notifications_none_rounded),
              onPressed: onNotifications,
            ),
          ),
        ],
      ),
    );
  }
}

class _JobsInbox extends StatelessWidget {
  const _JobsInbox({
    required this.isOnline,
    required this.inbox,
    required this.actingOrderId,
    required this.onAccept,
    required this.onOpenActive,
    required this.onRetry,
  });

  final bool isOnline;
  final AsyncValue<List<CourierOrderModel>> inbox;
  final String? actingOrderId;
  final Future<void> Function(CourierOrderModel order) onAccept;
  final void Function(String orderId) onOpenActive;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return inbox.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) {
        final message = error is ApiException
            ? error.message
            : ApiException.formatError(error);
        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            EmptyState(
              icon: Icons.cloud_off_outlined,
              title: message,
              actionLabel: AppStrings.retry,
              onAction: () => onRetry(),
            ),
          ],
        );
      },
      data: (orders) {
        if (orders.isEmpty) {
          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              EmptyState(
                icon: isOnline ? Icons.inbox_outlined : Icons.pause_circle_outline,
                title: AppStrings.noAvailableOrders,
                subtitle: isOnline
                    ? 'Yangi buyurtmalar shu yerda paydo bo\'ladi'
                    : 'Smena ochilmagan — buyurtmalar kelmaydi',
              ),
            ],
          );
        }

        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 4, AppSpacing.lg, AppSpacing.lg),
          children: [
            for (final order in orders)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: order.isPendingOffer
                    ? JobOfferCard(
                        order: order,
                        isLoading: actingOrderId == order.id,
                        onAccept:
                            actingOrderId == null ? () => onAccept(order) : null,
                      )
                    : ActiveJobHero(
                        order: order,
                        onOpen: () => onOpenActive(order.id),
                      ),
              ),
          ],
        );
      },
    );
  }
}

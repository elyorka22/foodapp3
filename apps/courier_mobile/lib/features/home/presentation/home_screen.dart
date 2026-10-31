import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/models/courier_shift_stats_model.dart';
import '../../../shared/widgets/active_job_hero.dart';
import '../../../shared/widgets/courier_avatar.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/job_offer_card.dart';
import '../../../shared/widgets/new_job_alert_banner.dart';
import '../../../shared/widgets/soft_map_backdrop.dart';
import '../../auth/providers/auth_provider.dart';
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
    final activeOrder = ref.watch(activeOrderProvider);
    final inbox = ref.watch(homeInboxProvider);
    final shiftStats = ref.watch(shiftStatsProvider);
    final unread = ref.watch(notificationsUnreadProvider);
    final user = ref.watch(authStateProvider).valueOrNull;
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
      backgroundColor: AppColors.background,
      body: SoftMapBackdrop(
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              _HomeProfileHeader(
                name: user?.fullName,
                isOnline: shiftOpen,
                unread: unread,
                onNotifications: () => context.push(AppRoutes.notifications),
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
              Expanded(
                child: !_profileLoaded
                    ? const Center(child: CircularProgressIndicator())
                    : RefreshIndicator(
                        onRefresh: _refresh,
                        color: AppColors.primary,
                        child: !shiftOpen
                            ? ListView(
                                physics: const AlwaysScrollableScrollPhysics(),
                                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                                children: [
                                  _OfflineStartCard(
                                    isLoading: shiftBusy,
                                    stats: shiftStats.valueOrNull,
                                    onStart: shiftBusy ? null : _toggleShift,
                                  ),
                                ],
                              )
                            : _JobsInbox(
                                inbox: inbox,
                                actingOrderId: _actingOrderId,
                                stats: shiftStats.valueOrNull,
                                onEndShift: hasActiveOrder || shiftBusy
                                    ? null
                                    : _toggleShift,
                                shiftLoading: shiftBusy,
                                onAccept: _acceptOrder,
                                onOpenActive: (id) =>
                                    context.push(AppRoutes.activeOrder, extra: id),
                                onRetry: _refresh,
                              ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HomeProfileHeader extends StatelessWidget {
  const _HomeProfileHeader({
    required this.name,
    required this.isOnline,
    required this.unread,
    required this.onNotifications,
  });

  final String? name;
  final bool isOnline;
  final AsyncValue<int> unread;
  final VoidCallback onNotifications;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0x2EFFAA00),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0x73D68C00), width: 1.5),
            ),
            child: Text(
              AppStrings.demandBadge,
              style: AppTypography.caption.copyWith(
                color: AppColors.warning,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              CourierAvatar(name: name, size: 48),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name?.trim().isNotEmpty == true ? name! : AppStrings.appName,
                      style: AppTypography.subtitle.copyWith(fontSize: 17),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 14, color: Color(0xFFE0A100)),
                        const SizedBox(width: 4),
                        Text(
                          '4,9 · ${AppStrings.vehicleScooter}',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isOnline ? AppColors.online : AppColors.offline,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          isOnline ? AppStrings.online : AppStrings.offline,
                          style: AppTypography.caption.copyWith(
                            color: isOnline ? AppColors.online : AppColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              unread.when(
                data: (count) => _BellButton(count: count, onTap: onNotifications),
                loading: () => _BellButton(count: 0, onTap: onNotifications),
                error: (_, __) => _BellButton(count: 0, onTap: onNotifications),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BellButton extends StatelessWidget {
  const _BellButton({required this.count, required this.onTap});

  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onTap,
          icon: const Icon(Icons.notifications_none_rounded, size: 26),
        ),
        if (count > 0)
          Positioned(
            right: 10,
            top: 10,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: AppColors.danger,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}

class _OfflineStartCard extends StatelessWidget {
  const _OfflineStartCard({
    required this.isLoading,
    required this.stats,
    required this.onStart,
  });

  final bool isLoading;
  final CourierShiftStatsModel? stats;
  final VoidCallback? onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(
                  color: AppColors.offline,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                AppStrings.offline,
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            AppStrings.startShiftTitle,
            style: AppTypography.title.copyWith(fontSize: 24),
          ),
          const SizedBox(height: 8),
          Text(AppStrings.startShiftHint, style: AppTypography.bodySmall),
          const SizedBox(height: 20),
          FoodAppButton(
            label: AppStrings.startShift,
            isLoading: isLoading,
            onPressed: onStart,
          ),
          const SizedBox(height: 18),
          _TodayStatsRow(stats: stats),
        ],
      ),
    );
  }
}

class _TodayStatsRow extends StatelessWidget {
  const _TodayStatsRow({required this.stats});

  final CourierShiftStatsModel? stats;

  @override
  Widget build(BuildContext context) {
    final earnings = stats?.todayEarnings ?? 0;
    final deliveries = stats?.todayDeliveries ?? 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: _StatCell(
              label: AppStrings.todayLabel,
              value: formatSumNumber(earnings),
              unit: AppStrings.currencySom,
            ),
          ),
          Container(width: 1, height: 42, color: AppColors.border),
          Expanded(
            child: _StatCell(
              label: AppStrings.todayOrders,
              value: '$deliveries',
              unit: AppStrings.unitOrders,
            ),
          ),
          Container(width: 1, height: 42, color: AppColors.border),
          Expanded(
            child: _StatCell(
              label: AppStrings.todayWorkTime,
              value: '—',
              unit: AppStrings.unitHours,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({
    required this.label,
    required this.value,
    required this.unit,
  });

  final String label;
  final String value;
  final String unit;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.subtitle.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(unit, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

class _JobsInbox extends StatelessWidget {
  const _JobsInbox({
    required this.inbox,
    required this.actingOrderId,
    required this.stats,
    required this.onEndShift,
    required this.shiftLoading,
    required this.onAccept,
    required this.onOpenActive,
    required this.onRetry,
  });

  final AsyncValue<List<CourierOrderModel>> inbox;
  final String? actingOrderId;
  final CourierShiftStatsModel? stats;
  final VoidCallback? onEndShift;
  final bool shiftLoading;
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
        return ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.online.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: AppColors.online,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.online.withValues(alpha: 0.45),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    AppStrings.online,
                    style: AppTypography.subtitle.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: onEndShift,
                    child: shiftLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            AppStrings.endShift,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.danger,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (stats != null) ...[
              Container(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: _TodayStatsRow(stats: stats),
              ),
              const SizedBox(height: 14),
            ],
            if (orders.isEmpty)
              EmptyState(
                icon: Icons.inbox_outlined,
                title: AppStrings.noAvailableOrders,
                subtitle: "Yangi buyurtmalar shu yerda paydo bo'ladi",
              )
            else
              for (final order in orders)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: order.isPendingOffer
                      ? JobOfferCard(
                          order: order,
                          isLoading: actingOrderId == order.id,
                          onAccept:
                              actingOrderId == null ? () => onAccept(order) : null,
                          onOpen: () =>
                              context.push(AppRoutes.incomingOrder, extra: order.id),
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

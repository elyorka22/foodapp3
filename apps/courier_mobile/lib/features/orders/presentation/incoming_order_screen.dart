import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/jobs/courier_job_adapter.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/courier_order_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../home/providers/courier_home_provider.dart';
import '../data/courier_repository.dart';

class IncomingOrderScreen extends ConsumerStatefulWidget {
  const IncomingOrderScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<IncomingOrderScreen> createState() => _IncomingOrderScreenState();
}

class _IncomingOrderScreenState extends ConsumerState<IncomingOrderScreen> {
  CourierOrderModel? _order;
  bool _loading = true;
  bool _acting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    CourierOrderModel? loaded;
    try {
      for (final order in await ref.read(courierRepositoryProvider).fetchHomeInbox()) {
        if (order.id == widget.orderId) {
          loaded = order;
          break;
        }
      }
    } catch (_) {}

    if (loaded == null) {
      try {
        loaded = await ref.read(courierRepositoryProvider).fetchOrder(widget.orderId);
      } catch (_) {
        loaded = null;
      }
    }
    final nextOrder = loaded != null && loaded.isCancelled ? null : loaded;
    if (mounted) setState(() => _order = nextOrder);
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final order = _order;
    if (order == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(AppStrings.orderUnavailable, style: AppTypography.subtitle),
                const SizedBox(height: AppSpacing.lg),
                FoodAppButton(
                  label: AppStrings.backToHome,
                  variant: FoodAppButtonVariant.secondary,
                  onPressed: () => context.go(AppRoutes.home),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final pickup = order.stops.isNotEmpty ? order.stops.first : null;
    final dropoff = order.stops.length > 1 ? order.stops.last : null;
    final merchant = order.merchantTypeLabel.isNotEmpty
        ? order.merchantTypeLabel
        : AppStrings.merchantRestaurant;
    final fee = order.estimatedCourierFee ?? order.courierEarnings;
    final itemCount = order.items.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 4, 16, 8),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppColors.greenSoft,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.online,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          AppStrings.online,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.online,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
                children: [
                  Text(AppStrings.newOrderTitle, style: AppTypography.title),
                  const SizedBox(height: 6),
                  Text(
                    itemCount == 0
                        ? merchant
                        : '$merchant · $itemCount ta pozitsiya',
                    style: AppTypography.bodySmall,
                  ),
                  const SizedBox(height: 22),
                  Text(
                    formatSum(fee),
                    style: AppTypography.display.copyWith(
                      fontSize: 40,
                      color: AppColors.accent,
                    ),
                  ),
                  if (order.distanceKm != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Jami ${order.distanceKm!.toStringAsFixed(1)} km',
                      style: AppTypography.bodySmall,
                    ),
                  ],
                  const SizedBox(height: 24),
                  _StopCard(
                    icon: Icons.storefront_outlined,
                    title: pickup?.title ?? order.restaurantName ?? '—',
                    subtitle: pickup?.subtitle ?? '',
                  ),
                  const SizedBox(height: 10),
                  _StopCard(
                    icon: Icons.location_on_outlined,
                    title: AppStrings.customerAddressLabel,
                    subtitle: dropoff?.subtitle ?? order.customerAddress ?? '—',
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _InfoChip(label: merchant),
                      _InfoChip(
                        label:
                            '${AppStrings.cashPayment} · ${formatSum(order.collectFromCustomer)}',
                        warning: true,
                      ),
                      const _InfoChip(label: AppStrings.approxWeight),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: SafeArea(
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: FoodAppButton(
                        label: AppStrings.rejectOrder,
                        variant: FoodAppButtonVariant.secondary,
                        isLoading: _acting,
                        onPressed: _acting ? null : _decline,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 2,
                      child: FoodAppButton(
                        label: AppStrings.acceptOrder,
                        isLoading: _acting,
                        onPressed: _acting ? null : _accept,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _accept() async {
    setState(() => _acting = true);
    try {
      syncShiftSessionFromBackend(ref);
      await ref.read(courierRepositoryProvider).acceptOrder(widget.orderId);
      removePushInboxOrder(ref, widget.orderId);
      ref.invalidate(activeOrderProvider);
      ref.invalidate(homeInboxProvider);
      if (!mounted) return;
      context.go(AppRoutes.activeOrder, extra: widget.orderId);
    } on DioException catch (e) {
      removePushInboxOrder(ref, widget.orderId);
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      ref.invalidate(homeInboxProvider);
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  Future<void> _decline() async {
    setState(() => _acting = true);
    try {
      await ref.read(courierRepositoryProvider).declineOrder(widget.orderId);
      removePushInboxOrder(ref, widget.orderId);
      ref.invalidate(homeInboxProvider);
      if (!mounted) return;
      context.go(AppRoutes.home);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }
}

class _StopCard extends StatelessWidget {
  const _StopCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.surfaceHighlight,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.textPrimary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.subtitle),
                if (subtitle.trim().isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(subtitle, style: AppTypography.bodySmall),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label, this.warning = false});

  final String label;
  final bool warning;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: warning ? AppColors.cashSoft : AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: warning ? const Color(0x73D68C00) : AppColors.border,
          width: warning ? 1.5 : 1,
        ),
      ),
      child: Text(
        label,
        style: AppTypography.caption.copyWith(
          color: warning ? AppColors.warning : AppColors.textSecondary,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

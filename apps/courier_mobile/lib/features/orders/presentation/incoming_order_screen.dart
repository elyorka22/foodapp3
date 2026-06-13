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
import '../../../shared/widgets/order_money_summary.dart';
import '../../../shared/widgets/service_type_badge.dart';
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
      loaded = await ref.read(courierRepositoryProvider).fetchOrder(widget.orderId);
    } catch (_) {
      try {
        final available = await ref.read(courierRepositoryProvider).fetchInboxOffers();
        for (final order in available) {
          if (order.id == widget.orderId) {
            loaded = order;
            break;
          }
        }
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

    final pickup = order.stops.first;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text(AppStrings.newOrder)),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Spacer(),
            ServiceTypeBadge(type: order.serviceType),
            const SizedBox(height: AppSpacing.lg),
            Text(
              pickup.title,
              style: AppTypography.title.copyWith(fontSize: 26),
              textAlign: TextAlign.center,
            ),
            if (pickup.subtitle != null) ...[
              const SizedBox(height: 8),
              Text(pickup.subtitle!, style: AppTypography.bodySmall, textAlign: TextAlign.center),
            ],
            const SizedBox(height: AppSpacing.xl),
            OrderMoneySummary(order: order),
            const SizedBox(height: AppSpacing.lg),
            Text(
              formatSum(order.collectFromCustomer),
              style: AppTypography.title.copyWith(
                color: AppColors.primary,
                fontSize: 32,
                fontWeight: FontWeight.w800,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              AppStrings.collectFromCustomer,
              style: AppTypography.caption,
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            FoodAppButton(
              label: AppStrings.accept,
              isLoading: _acting,
              onPressed: _accept,
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
      final online = ref.read(courierOnlineProvider).valueOrNull ?? false;
      if (!online) {
        throw ApiException(message: AppStrings.mustBeOnline);
      }
      await ref.read(courierRepositoryProvider).acceptOrder(widget.orderId);
      ref.invalidate(activeOrderProvider);
      ref.invalidate(homeInboxProvider);
      if (!mounted) return;
      context.go(AppRoutes.activeOrder, extra: widget.orderId);
    } on DioException catch (e) {
      final err = e.error;
      final msg = err is ApiException ? err.message : AppStrings.errorGeneric;
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }
}

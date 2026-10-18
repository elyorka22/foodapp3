import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../couriers/data/courier_model.dart';
import '../../couriers/data/couriers_repository.dart';
import '../data/order_model.dart';
import '../data/orders_repository.dart';
import 'orders_screen.dart';

class OrderDetailSheet extends ConsumerStatefulWidget {
  const OrderDetailSheet({super.key, required this.order});

  final ControlOrder order;

  @override
  ConsumerState<OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends ConsumerState<OrderDetailSheet> {
  late ControlOrder _order;
  bool _busy = false;
  List<ControlCourier> _couriers = const [];
  String? _selectedCourierId;

  @override
  void initState() {
    super.initState();
    _order = widget.order;
    _selectedCourierId = widget.order.courierId;
    _loadCouriers();
  }

  Future<void> _loadCouriers() async {
    try {
      final page = await ref
          .read(couriersRepositoryProvider)
          .fetchCouriers(page: 1, limit: 80, isActive: true);
      if (!mounted) return;
      setState(() => _couriers = page.data);
    } catch (_) {
      // Courier picker stays empty; assign actions still try API.
    }
  }

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
      final refreshed =
          await ref.read(ordersRepositoryProvider).fetchOrder(_order.id);
      if (!mounted) return;
      setState(() => _order = refreshed);
      ref.invalidate(ordersPagedProvider);
      showActionSnackBar(context, AppStrings.actionDone);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _changeStatus(String status) async {
    String? reason;
    if (status == 'CANCELLED') {
      final controller = TextEditingController();
      final ok = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text(AppStrings.cancelOrder),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              labelText: AppStrings.cancelReason,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text(AppStrings.cancel),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text(AppStrings.confirm),
            ),
          ],
        ),
      );
      if (ok != true) return;
      reason = controller.text.trim();
      if (reason.isEmpty) reason = 'Admin cancelled';
    }
    await _run(() => ref.read(ordersRepositoryProvider).updateStatus(
          _order.id,
          status: status,
          cancelReason: reason,
        ));
  }

  Future<void> _assign({required bool reassign}) async {
    final courierId = _selectedCourierId;
    if (courierId == null || courierId.isEmpty) {
      showActionSnackBar(context, AppStrings.selectCourier, error: true);
      return;
    }
    await _run(() async {
      final repo = ref.read(ordersRepositoryProvider);
      if (reassign) {
        await repo.reassignCourier(_order.id, courierId: courierId);
      } else {
        await repo.assignCourier(_order.id, courierId: courierId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          _order.orderNumber.isNotEmpty ? _order.orderNumber : _order.id,
          style: AppTypography.subtitle,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            StatusChip(status: _order.status),
            Text(formatMoney(_order.total), style: AppTypography.body),
          ],
        ),
        const SizedBox(height: 12),
        _infoRow(AppStrings.navBusinesses, _order.businessName),
        _infoRow(AppStrings.phoneLabel, _order.customerPhone),
        _infoRow(AppStrings.navCouriers, _order.courierName),
        if (_order.createdAt != null)
          _infoRow('Vaqt', formatDateTime(_order.createdAt)),
        const SizedBox(height: 16),
        Text(AppStrings.changeStatus, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final status in ControlOrder.statusOptions)
              if (status != _order.status)
                MutationButton(
                  label: status,
                  filled: false,
                  loading: _busy,
                  destructive: status == 'CANCELLED',
                  onPressed: () => _changeStatus(status),
                ),
          ],
        ),
        const SizedBox(height: 20),
        Text(AppStrings.selectCourier, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedCourierId != null &&
                  _couriers.any((c) => c.id == _selectedCourierId)
              ? _selectedCourierId
              : null,
          decoration: const InputDecoration(
            labelText: AppStrings.navCouriers,
          ),
          items: [
            for (final c in _couriers)
              DropdownMenuItem(
                value: c.id,
                child: Text(
                  '${c.displayName}${c.isOnline ? ' · online' : ''}',
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
          onChanged: _busy
              ? null
              : (v) => setState(() => _selectedCourierId = v),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            MutationButton(
              label: AppStrings.assignCourier,
              icon: Icons.person_add_alt_1_outlined,
              loading: _busy,
              onPressed: () => _assign(reassign: false),
            ),
            MutationButton(
              label: AppStrings.reassignCourier,
              icon: Icons.swap_horiz,
              filled: false,
              loading: _busy,
              onPressed: () => _assign(reassign: true),
            ),
            MutationButton(
              label: AppStrings.requestCourier,
              icon: Icons.campaign_outlined,
              filled: false,
              loading: _busy,
              onPressed: () => _run(
                () => ref
                    .read(ordersRepositoryProvider)
                    .requestCourier(_order.id),
              ),
            ),
            MutationButton(
              label: AppStrings.removeCourier,
              icon: Icons.person_remove_outlined,
              filled: false,
              destructive: true,
              loading: _busy,
              onPressed: () async {
                final ok = await showConfirmDialog(
                  context,
                  title: AppStrings.removeCourier,
                  message: AppStrings.confirmRemoveCourier,
                  destructive: true,
                );
                if (!ok) return;
                await _run(
                  () => ref
                      .read(ordersRepositoryProvider)
                      .removeCourier(_order.id),
                );
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _infoRow(String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ),
          Expanded(child: Text(value, style: AppTypography.bodySmall)),
        ],
      ),
    );
  }
}

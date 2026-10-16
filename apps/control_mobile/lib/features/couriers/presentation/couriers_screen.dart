import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/paginated_response.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/courier_model.dart';
import '../data/couriers_repository.dart';

final couriersListProvider =
    FutureProvider.autoDispose<PaginatedResponse<ControlCourier>>((ref) {
  return ref.watch(couriersRepositoryProvider).fetchCouriers(page: 1, limit: 50);
});

class CouriersScreen extends ConsumerWidget {
  const CouriersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(couriersListProvider);
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Text(AppStrings.navCouriers, style: AppTypography.display),
          ),
          Expanded(
            child: AsyncPageBody<PaginatedResponse<ControlCourier>>(
              asyncValue: async,
              onRefresh: () => ref.refresh(couriersListProvider.future),
              isEmpty: (p) => p.data.isEmpty,
              emptyMessage: AppStrings.emptyList,
              padding: const EdgeInsets.all(AppSpacing.lg),
              dataBuilder: (page) => ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: page.data.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final c = page.data[i];
                  return ControlListCard(
                    title: c.displayName,
                    subtitle: [
                      if (c.phone != null) c.phone!,
                      if (c.vehicleType != null) c.vehicleType!,
                      c.isOnline ? AppStrings.online : AppStrings.offline,
                    ].join(' · '),
                    trailing: StatusChip(
                      status: c.isActive ? 'DELIVERED' : 'CANCELLED',
                      label: c.isActive ? AppStrings.active : AppStrings.inactive,
                    ),
                    onTap: () => showDetailSheet(
                      context: context,
                      title: AppStrings.details,
                      builder: (_) => _CourierActions(courier: c),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showDetailSheet(
          context: context,
          title: AppStrings.addCourier,
          builder: (_) => const _CourierCreateForm(),
        ),
        icon: const Icon(Icons.add),
        label: const Text(AppStrings.addCourier),
      ),
    );
  }
}

class _CourierActions extends ConsumerStatefulWidget {
  const _CourierActions({required this.courier});
  final ControlCourier courier;

  @override
  ConsumerState<_CourierActions> createState() => _CourierActionsState();
}

class _CourierActionsState extends ConsumerState<_CourierActions> {
  bool _busy = false;

  Future<void> _setActive(bool active) async {
    setState(() => _busy = true);
    try {
      await ref
          .read(couriersRepositoryProvider)
          .updateStatus(widget.courier.id, isActive: active);
      ref.invalidate(couriersListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.pop(context);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(widget.courier.displayName, style: AppTypography.subtitle),
        const SizedBox(height: 16),
        MutationButton(
          label: widget.courier.isActive
              ? AppStrings.deactivate
              : AppStrings.activate,
          loading: _busy,
          filled: false,
          destructive: widget.courier.isActive,
          onPressed: () => _setActive(!widget.courier.isActive),
        ),
      ],
    );
  }
}

class _CourierCreateForm extends ConsumerStatefulWidget {
  const _CourierCreateForm();

  @override
  ConsumerState<_CourierCreateForm> createState() => _CourierCreateFormState();
}

class _CourierCreateFormState extends ConsumerState<_CourierCreateForm> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _vehicle = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _password.dispose();
    _vehicle.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    if (_name.text.trim().isEmpty ||
        _phone.text.trim().isEmpty ||
        _password.text.trim().length < 6) {
      showActionSnackBar(context, 'Ism, telefon, parol (min 6)', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(couriersRepositoryProvider).createCourier(
            fullName: _name.text.trim(),
            phone: _phone.text.trim(),
            password: _password.text.trim(),
            vehicleType: _vehicle.text.trim(),
          );
      ref.invalidate(couriersListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.pop(context);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _name,
          decoration: const InputDecoration(labelText: AppStrings.fullNameLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _phone,
          decoration: const InputDecoration(labelText: AppStrings.phoneLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _password,
          obscureText: true,
          decoration: const InputDecoration(labelText: AppStrings.password),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _vehicle,
          decoration: const InputDecoration(labelText: AppStrings.vehicleType),
        ),
        const SizedBox(height: 16),
        MutationButton(
          label: AppStrings.create,
          loading: _busy,
          onPressed: _create,
        ),
      ],
    );
  }
}

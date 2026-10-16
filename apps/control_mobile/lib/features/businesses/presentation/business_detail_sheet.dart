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
import '../data/businesses_repository.dart';
import '../data/restaurant_model.dart';
import 'businesses_screen.dart';

class BusinessDetailSheet extends ConsumerStatefulWidget {
  const BusinessDetailSheet({super.key, required this.restaurant});

  final ControlRestaurant restaurant;

  @override
  ConsumerState<BusinessDetailSheet> createState() =>
      _BusinessDetailSheetState();
}

class _BusinessDetailSheetState extends ConsumerState<BusinessDetailSheet> {
  late ControlRestaurant _restaurant;
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _address;
  final _ownerLogin = TextEditingController();
  final _ownerPassword = TextEditingController();
  final _ownerName = TextEditingController();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _restaurant = widget.restaurant;
    _name = TextEditingController(text: widget.restaurant.name);
    _phone = TextEditingController(text: widget.restaurant.phone ?? '');
    _address =
        TextEditingController(text: widget.restaurant.branchAddress ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    _ownerLogin.dispose();
    _ownerPassword.dispose();
    _ownerName.dispose();
    super.dispose();
  }

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
      ref.invalidate(businessesListProvider);
      if (mounted) showActionSnackBar(context, AppStrings.actionDone);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _saveQuickEdit() async {
    await _run(() async {
      final updated = await ref.read(businessesRepositoryProvider).updateRestaurant(
            _restaurant.id,
            name: _name.text.trim(),
            phone: _phone.text.trim(),
            branchAddress: _address.text.trim(),
          );
      if (mounted) setState(() => _restaurant = updated);
    });
  }

  Future<void> _setActive(bool active) async {
    await _run(() async {
      final updated = await ref.read(businessesRepositoryProvider).updateRestaurant(
            _restaurant.id,
            isActive: active,
          );
      if (mounted) setState(() => _restaurant = updated);
    });
  }

  Future<void> _approve(String status) async {
    if (status == 'REJECTED') {
      final ok = await showConfirmDialog(
        context,
        title: AppStrings.reject,
        message: AppStrings.confirmRejectBusiness,
        destructive: true,
      );
      if (!ok) return;
    }
    await _run(() async {
      await ref.read(businessesRepositoryProvider).updateApproval(
            _restaurant.id,
            status: status,
          );
      if (mounted) {
        setState(() {
          _restaurant = ControlRestaurant(
            id: _restaurant.id,
            name: _restaurant.name,
            slug: _restaurant.slug,
            isActive: _restaurant.isActive,
            approvalStatus: status,
            description: _restaurant.description,
            logoUrl: _restaurant.logoUrl,
            coverUrl: _restaurant.coverUrl,
            phone: _restaurant.phone,
            commissionRate: _restaurant.commissionRate,
            ordersCount: _restaurant.ordersCount,
            revenue: _restaurant.revenue,
            productsCount: _restaurant.productsCount,
            branchAddress: _restaurant.branchAddress,
            latitude: _restaurant.latitude,
            longitude: _restaurant.longitude,
            cityId: _restaurant.cityId,
            cityName: _restaurant.cityName,
            createdAt: _restaurant.createdAt,
          );
        });
      }
    });
  }

  Future<void> _createOwner() async {
    final login = _ownerLogin.text.trim();
    final password = _ownerPassword.text.trim();
    if (login.isEmpty || password.length < 6) {
      showActionSnackBar(
        context,
        'Login va parol (min 6) majburiy',
        error: true,
      );
      return;
    }
    await _run(() async {
      await ref.read(businessesRepositoryProvider).createOwnerAccount(
            _restaurant.id,
            login: login,
            password: password,
            fullName: _ownerName.text.trim(),
          );
      _ownerPassword.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(_restaurant.name, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            StatusChip(
              status: _restaurant.isActive ? 'DELIVERED' : 'CANCELLED',
              label: _restaurant.isActive ? AppStrings.active : AppStrings.inactive,
            ),
            StatusChip(
              status: _restaurant.approvalStatus == 'APPROVED'
                  ? 'DELIVERED'
                  : (_restaurant.approvalStatus == 'REJECTED'
                      ? 'CANCELLED'
                      : 'PENDING'),
              label: _restaurant.approvalStatus,
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          [
            '${_restaurant.ordersCount} buyurtma',
            formatMoney(_restaurant.revenue),
            '${_restaurant.productsCount} mahsulot',
          ].join(' · '),
          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        Text(AppStrings.approvalStatus, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            MutationButton(
              label: AppStrings.approve,
              loading: _busy,
              onPressed: () => _approve('APPROVED'),
            ),
            MutationButton(
              label: AppStrings.reject,
              filled: false,
              destructive: true,
              loading: _busy,
              onPressed: () => _approve('REJECTED'),
            ),
            MutationButton(
              label: AppStrings.suspend,
              filled: false,
              loading: _busy,
              onPressed: () => _approve('SUSPENDED'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            MutationButton(
              label: AppStrings.setActive,
              filled: false,
              loading: _busy,
              onPressed: _restaurant.isActive ? null : () => _setActive(true),
            ),
            MutationButton(
              label: AppStrings.setInactive,
              filled: false,
              destructive: true,
              loading: _busy,
              onPressed: !_restaurant.isActive ? null : () => _setActive(false),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text(AppStrings.edit, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        TextField(
          controller: _name,
          decoration: const InputDecoration(labelText: AppStrings.nameLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _phone,
          decoration: const InputDecoration(labelText: AppStrings.phoneLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _address,
          decoration: const InputDecoration(labelText: AppStrings.addressLabel),
        ),
        const SizedBox(height: 12),
        MutationButton(
          label: AppStrings.save,
          loading: _busy,
          onPressed: _saveQuickEdit,
        ),
        const SizedBox(height: 24),
        Text(AppStrings.ownerAccount, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        TextField(
          controller: _ownerLogin,
          decoration: const InputDecoration(labelText: AppStrings.ownerLogin),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _ownerPassword,
          obscureText: true,
          decoration: const InputDecoration(labelText: AppStrings.ownerPassword),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _ownerName,
          decoration: const InputDecoration(labelText: AppStrings.ownerFullName),
        ),
        const SizedBox(height: 12),
        MutationButton(
          label: AppStrings.createOwnerAccount,
          icon: Icons.person_add_alt,
          filled: false,
          loading: _busy,
          onPressed: _createOwner,
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

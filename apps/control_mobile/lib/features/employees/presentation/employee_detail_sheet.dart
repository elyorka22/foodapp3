import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/employees_repository.dart';
import '../data/staff_user_model.dart';
import 'employees_screen.dart';

class EmployeeDetailSheet extends ConsumerStatefulWidget {
  const EmployeeDetailSheet({super.key, required this.user});

  final StaffUser user;

  @override
  ConsumerState<EmployeeDetailSheet> createState() =>
      _EmployeeDetailSheetState();
}

class _EmployeeDetailSheetState extends ConsumerState<EmployeeDetailSheet> {
  late StaffUser _user;
  late final TextEditingController _fullName;
  late final TextEditingController _phone;
  final _password = TextEditingController();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _user = widget.user;
    _fullName = TextEditingController(text: widget.user.fullName ?? '');
    _phone = TextEditingController(text: widget.user.phone ?? '');
  }

  @override
  void dispose() {
    _fullName.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _run(Future<StaffUser> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final updated = await action();
      if (!mounted) return;
      setState(() => _user = updated);
      ref.invalidate(employeesListProvider);
      showActionSnackBar(context, AppStrings.actionDone);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = (_user.fullName?.isNotEmpty == true)
        ? _user.fullName!
        : (_user.email ?? _user.phone ?? _user.id);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(name, style: AppTypography.subtitle),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: [
            StatusChip(
              status: _user.isActive ? 'DELIVERED' : 'CANCELLED',
              label: _user.isActive ? AppStrings.active : AppStrings.inactive,
            ),
            Text(_user.role, style: AppTypography.bodySmall),
          ],
        ),
        if (_user.email != null) ...[
          const SizedBox(height: 8),
          Text(_user.email!, style: AppTypography.bodySmall),
        ],
        if (_user.businessName != null) ...[
          const SizedBox(height: 4),
          Text(
            _user.businessName!,
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          ),
        ],
        const SizedBox(height: 16),
        TextField(
          controller: _fullName,
          decoration: const InputDecoration(labelText: AppStrings.fullNameLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _phone,
          decoration: const InputDecoration(labelText: AppStrings.phoneLabel),
        ),
        const SizedBox(height: 12),
        MutationButton(
          label: AppStrings.save,
          loading: _busy,
          onPressed: () => _run(
            () => ref.read(employeesRepositoryProvider).updateUser(
                  _user.id,
                  fullName: _fullName.text.trim(),
                  phone: _phone.text.trim(),
                ),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _password,
          obscureText: true,
          decoration: const InputDecoration(labelText: AppStrings.newPassword),
        ),
        const SizedBox(height: 8),
        MutationButton(
          label: AppStrings.resetPassword,
          filled: false,
          loading: _busy,
          onPressed: () {
            final pwd = _password.text.trim();
            if (pwd.length < 6) {
              showActionSnackBar(context, 'Parol min 6 belgi', error: true);
              return;
            }
            _run(
              () => ref.read(employeesRepositoryProvider).updateUser(
                    _user.id,
                    password: pwd,
                  ),
            ).then((_) => _password.clear());
          },
        ),
        const SizedBox(height: 20),
        MutationButton(
          label: _user.isActive ? AppStrings.deactivate : AppStrings.activate,
          destructive: _user.isActive,
          filled: false,
          loading: _busy,
          onPressed: () async {
            if (_user.isActive) {
              final ok = await showConfirmDialog(
                context,
                title: AppStrings.deactivate,
                message: AppStrings.confirmDeactivate,
                destructive: true,
              );
              if (!ok) return;
            }
            await _run(
              () => ref.read(employeesRepositoryProvider).updateUser(
                    _user.id,
                    isActive: !_user.isActive,
                  ),
            );
          },
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

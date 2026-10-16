import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../data/employees_repository.dart';
import 'employees_screen.dart';

class EmployeeCreateSheet extends ConsumerStatefulWidget {
  const EmployeeCreateSheet({super.key});

  @override
  ConsumerState<EmployeeCreateSheet> createState() =>
      _EmployeeCreateSheetState();
}

class _EmployeeCreateSheetState extends ConsumerState<EmployeeCreateSheet> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _fullName = TextEditingController();
  final _phone = TextEditingController();
  String _role = 'MANAGER';
  bool _busy = false;

  static const _roles = ['MANAGER', 'BUSINESS', 'COURIER'];

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _fullName.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final email = _email.text.trim();
    final password = _password.text.trim();
    if (email.isEmpty || password.length < 6) {
      showActionSnackBar(context, 'Email va parol (min 6) majburiy', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(employeesRepositoryProvider).createUser(
            email: email,
            password: password,
            role: _role,
            fullName: _fullName.text.trim(),
            phone: _phone.text.trim(),
          );
      ref.invalidate(employeesListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.of(context).pop(true);
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
        Text(AppStrings.addEmployee, style: AppTypography.subtitle),
        const SizedBox(height: 12),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: AppStrings.emailLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _password,
          obscureText: true,
          decoration: const InputDecoration(labelText: AppStrings.password),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _fullName,
          decoration: const InputDecoration(labelText: AppStrings.fullNameLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _phone,
          decoration: const InputDecoration(labelText: AppStrings.phoneLabel),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _role,
          decoration: const InputDecoration(labelText: AppStrings.roleLabel),
          items: [
            for (final r in _roles)
              DropdownMenuItem(value: r, child: Text(r)),
          ],
          onChanged: _busy ? null : (v) => setState(() => _role = v ?? _role),
        ),
        const SizedBox(height: 16),
        MutationButton(
          label: AppStrings.create,
          loading: _busy,
          onPressed: _create,
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

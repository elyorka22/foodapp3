import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/password_text_field.dart';
import '../data/couriers_repository.dart';
import 'manager_couriers_screen.dart';

class ManagerCourierFormScreen extends ConsumerStatefulWidget {
  const ManagerCourierFormScreen({super.key});

  @override
  ConsumerState<ManagerCourierFormScreen> createState() => _ManagerCourierFormScreenState();
}

class _ManagerCourierFormScreenState extends ConsumerState<ManagerCourierFormScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _vehicle = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _password.dispose();
    _vehicle.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.createCourier)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _name,
              decoration: const InputDecoration(labelText: AppStrings.courierName),
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: AppStrings.phone),
            ),
            const SizedBox(height: AppSpacing.md),
            PasswordTextField(
              controller: _password,
              labelText: AppStrings.password,
            ),
            const SizedBox(height: AppSpacing.md),
            TextField(
              controller: _vehicle,
              decoration: const InputDecoration(labelText: AppStrings.vehicleType),
            ),
            const SizedBox(height: AppSpacing.xxl),
            FoodAppButton(
              label: AppStrings.create,
              isLoading: _loading,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty || _phone.text.trim().isEmpty || _password.text.length < 6) {
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(couriersRepositoryProvider).createCourier(
            fullName: _name.text.trim(),
            phone: _phone.text.trim(),
            password: _password.text,
            vehicleType: _vehicle.text.trim().isEmpty ? null : _vehicle.text.trim(),
          );
      ref.invalidate(couriersListProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.saved)),
      );
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}

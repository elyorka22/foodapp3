import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/image_upload_field.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../cities/data/cities_repository.dart';
import '../data/businesses_repository.dart';
import 'businesses_screen.dart';

final _createCitiesProvider =
    FutureProvider.autoDispose<List<ControlCity>>((ref) {
  return ref.watch(citiesRepositoryProvider).fetchCities();
});

class BusinessCreateSheet extends ConsumerStatefulWidget {
  const BusinessCreateSheet({super.key});

  @override
  ConsumerState<BusinessCreateSheet> createState() =>
      _BusinessCreateSheetState();
}

class _BusinessCreateSheetState extends ConsumerState<BusinessCreateSheet> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  final _description = TextEditingController();
  final _commission = TextEditingController(text: '0');
  final _lat = TextEditingController();
  final _lng = TextEditingController();
  final _logoUrl = TextEditingController();
  final _ownerLogin = TextEditingController();
  final _ownerPassword = TextEditingController();
  final _ownerFullName = TextEditingController();
  String? _cityId;
  bool _isActive = true;
  bool _busy = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    _description.dispose();
    _commission.dispose();
    _lat.dispose();
    _lng.dispose();
    _logoUrl.dispose();
    _ownerLogin.dispose();
    _ownerPassword.dispose();
    _ownerFullName.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final name = _name.text.trim();
    final cityId = _cityId;
    if (name.length < 2) {
      showActionSnackBar(context, 'Nom kamida 2 belgi', error: true);
      return;
    }
    if (cityId == null || cityId.isEmpty) {
      showActionSnackBar(context, 'Shaharni tanlang', error: true);
      return;
    }

    final ownerLogin = _ownerLogin.text.trim();
    final ownerPassword = _ownerPassword.text.trim();
    if (ownerLogin.isNotEmpty || ownerPassword.isNotEmpty) {
      if (ownerLogin.isEmpty || ownerPassword.length < 6) {
        showActionSnackBar(
          context,
          'Egasi: login va parol (min 6) kerak',
          error: true,
        );
        return;
      }
    }

    setState(() => _busy = true);
    try {
      await ref.read(businessesRepositoryProvider).createRestaurant(
            name: name,
            cityId: cityId,
            phone: _phone.text.trim(),
            description: _description.text.trim(),
            branchAddress: _address.text.trim(),
            latitude: double.tryParse(_lat.text.trim()),
            longitude: double.tryParse(_lng.text.trim()),
            logoUrl: _logoUrl.text.trim(),
            commissionRate: num.tryParse(_commission.text.trim()),
            isActive: _isActive,
            ownerLogin: ownerLogin.isEmpty ? null : ownerLogin,
            ownerPassword: ownerPassword.isEmpty ? null : ownerPassword,
            ownerFullName: _ownerFullName.text.trim(),
          );
      ref.invalidate(businessesListProvider);
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
    final citiesAsync = ref.watch(_createCitiesProvider);
    final cities = citiesAsync.valueOrNull
            ?.where((c) => c.isActive)
            .toList() ??
        const <ControlCity>[];
    final cityValue =
        cities.any((c) => c.id == _cityId) ? _cityId : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _name,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.nameLabel),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: cityValue,
          decoration: const InputDecoration(labelText: AppStrings.businessCity),
          items: [
            for (final c in cities)
              DropdownMenuItem(value: c.id, child: Text(c.name)),
          ],
          onChanged: _busy ? null : (v) => setState(() => _cityId = v),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _phone,
          enabled: !_busy,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(labelText: AppStrings.phoneLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _address,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.addressLabel),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _description,
          enabled: !_busy,
          maxLines: 2,
          decoration: const InputDecoration(
            labelText: AppStrings.descriptionLabel,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _commission,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: AppStrings.commissionLabel,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _lat,
                enabled: !_busy,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                  signed: true,
                ),
                decoration: const InputDecoration(
                  labelText: AppStrings.latitudeLabel,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _lng,
                enabled: !_busy,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                  signed: true,
                ),
                decoration: const InputDecoration(
                  labelText: AppStrings.longitudeLabel,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ImageUploadField(
          imageUrlController: _logoUrl,
          enabled: !_busy,
          refererPath: '/admin/restaurants',
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(AppStrings.active),
          value: _isActive,
          onChanged: _busy ? null : (v) => setState(() => _isActive = v),
        ),
        const SizedBox(height: 8),
        Text(
          AppStrings.ownerOptionalHint,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _ownerLogin,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.ownerLogin),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _ownerPassword,
          enabled: !_busy,
          obscureText: true,
          decoration:
              const InputDecoration(labelText: AppStrings.ownerPassword),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _ownerFullName,
          enabled: !_busy,
          decoration:
              const InputDecoration(labelText: AppStrings.ownerFullName),
        ),
        const SizedBox(height: 16),
        MutationButton(
          label: AppStrings.create,
          loading: _busy,
          onPressed: _busy ? null : _create,
        ),
        const SizedBox(height: AppSpacing.lg),
      ],
    );
  }
}

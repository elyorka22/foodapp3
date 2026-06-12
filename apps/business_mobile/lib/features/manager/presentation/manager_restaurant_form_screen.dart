import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/models/working_hour_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../../shared/widgets/password_text_field.dart';
import '../../restaurant/data/restaurant_repository.dart';
import 'manager_restaurants_screen.dart';

class ManagerRestaurantFormScreen extends ConsumerStatefulWidget {
  const ManagerRestaurantFormScreen({super.key, this.restaurantId});

  final String? restaurantId;

  @override
  ConsumerState<ManagerRestaurantFormScreen> createState() =>
      _ManagerRestaurantFormScreenState();
}

class _ManagerRestaurantFormScreenState extends ConsumerState<ManagerRestaurantFormScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  final _ownerLogin = TextEditingController();
  final _ownerPassword = TextEditingController();
  final _openTime = TextEditingController(text: '09:00');
  final _closeTime = TextEditingController(text: '22:00');
  bool _isActive = true;
  bool _closedSunday = false;
  bool _loading = false;
  bool _initialized = false;
  String _vertical = 'restaurant';
  bool _hasOwnerAccount = false;

  bool get _isEdit => widget.restaurantId != null;
  bool get _isStore => _vertical == 'store';

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    _ownerLogin.dispose();
    _ownerPassword.dispose();
    _openTime.dispose();
    _closeTime.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final extra = GoRouterState.of(context).extra;
    if (extra is String && (extra == 'store' || extra == 'restaurant')) {
      _vertical = extra;
    }

    if (_isEdit) {
      final repo = ref.read(restaurantRepositoryProvider);
      final restaurant = await repo.fetchRestaurant(widget.restaurantId!);
      final hours = await repo.fetchWorkingHours(widget.restaurantId!);

      _name.text = restaurant.name;
      _phone.text = restaurant.phone ?? '';
      _address.text = restaurant.branchAddress ?? '';
      _isActive = restaurant.isActive;
      _ownerLogin.text = restaurant.ownerLogin ?? '';
      _ownerPassword.text = restaurant.ownerPassword ?? '';
      _hasOwnerAccount = (restaurant.ownerLogin ?? '').trim().isNotEmpty;
      _vertical = restaurant.isStore ? 'store' : 'restaurant';

      if (hours.isNotEmpty) {
        final sample = hours.firstWhere((h) => !h.isClosed, orElse: () => hours.first);
        _openTime.text = sample.openTime;
        _closeTime.text = sample.closeTime;
        _closedSunday = hours.any((h) => h.dayOfWeek == 0 && h.isClosed);
      }
    }

    if (mounted) setState(() => _initialized = true);
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  @override
  Widget build(BuildContext context) {
    final title = _isEdit
        ? (_isStore ? AppStrings.editStore : AppStrings.editRestaurant)
        : (_isStore ? AppStrings.createStore : AppStrings.createRestaurant);

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: !_initialized
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _name,
                    decoration: InputDecoration(
                      labelText: _isStore ? AppStrings.storeName : AppStrings.restaurantName,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _phone,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: AppStrings.restaurantPhone),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _address,
                    decoration: const InputDecoration(labelText: AppStrings.restaurantAddress),
                    maxLines: 2,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(AppStrings.workingHours, style: AppTypography.subtitle),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _openTime,
                          decoration: const InputDecoration(
                            labelText: AppStrings.openTime,
                            hintText: '09:00',
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: TextField(
                          controller: _closeTime,
                          decoration: const InputDecoration(
                            labelText: AppStrings.closeTime,
                            hintText: '22:00',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(AppStrings.closedSunday),
                    value: _closedSunday,
                    onChanged: (v) => setState(() => _closedSunday = v),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    _isEdit
                        ? AppStrings.ownerAccountSection
                        : AppStrings.ownerAccountSectionCreate,
                    style: AppTypography.subtitle,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (_isEdit && !_hasOwnerAccount) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: Text(
                        AppStrings.noOwnerAccountHint,
                        style: AppTypography.caption.copyWith(
                          color: const Color(0xFF92400E),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],
                  TextField(
                    controller: _ownerLogin,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    decoration: const InputDecoration(
                      labelText: AppStrings.ownerLogin,
                      hintText: AppStrings.ownerLoginHint,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  PasswordTextField(
                    controller: _ownerPassword,
                    labelText: _isEdit && _hasOwnerAccount
                        ? AppStrings.newOwnerPassword
                        : AppStrings.ownerPassword,
                  ),
                  if (_isEdit && _hasOwnerAccount) ...[
                    const SizedBox(height: 4),
                    Text(
                      AppStrings.newOwnerPasswordHint,
                      style: AppTypography.caption,
                    ),
                  ],
                  const SizedBox(height: AppSpacing.md),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(AppStrings.active),
                    value: _isActive,
                    onChanged: (v) => setState(() => _isActive = v),
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  FoodAppButton(
                    label: AppStrings.save,
                    isLoading: _loading,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
    );
  }

  List<WorkingHourModel> _buildWorkingHours() {
    return buildWeeklyHours(
      openTime: _openTime.text.trim().isEmpty ? '09:00' : _openTime.text.trim(),
      closeTime: _closeTime.text.trim().isEmpty ? '22:00' : _closeTime.text.trim(),
      closedSunday: _closedSunday,
    );
  }

  Future<void> _save() async {
    if (_name.text.trim().isEmpty) return;

    final login = _ownerLogin.text.trim();
    final password = _ownerPassword.text;

    if (!_isEdit) {
      if (login.isEmpty || password.length < 6) {
        _showAccountError();
        return;
      }
    } else if (!_hasOwnerAccount && login.isNotEmpty && password.length < 6) {
      _showAccountError();
      return;
    } else if (_hasOwnerAccount && password.isNotEmpty && password.length < 6) {
      _showAccountError();
      return;
    }

    setState(() => _loading = true);
    try {
      final hours = _buildWorkingHours();
      final kind = _isStore ? 'STORE' : 'RESTAURANT';

      if (_isEdit) {
        final model = RestaurantModel(
          id: widget.restaurantId!,
          name: _name.text.trim(),
          kind: kind,
          phone: _phone.text.trim(),
          branchAddress: _address.text.trim(),
          isActive: _isActive,
          ownerLogin: login.isNotEmpty ? login : null,
          ownerPassword: password.isNotEmpty ? password : null,
          ownerFullName: _name.text.trim(),
          workingHours: hours,
        );
        await ref.read(restaurantRepositoryProvider).updateRestaurant(model);
      } else {
        final model = RestaurantModel(
          id: '',
          name: _name.text.trim(),
          kind: kind,
          phone: _phone.text.trim(),
          branchAddress: _address.text.trim(),
          isActive: _isActive,
          ownerLogin: _ownerLogin.text.trim(),
          ownerPassword: _ownerPassword.text,
          ownerFullName: _name.text.trim(),
          workingHours: hours,
        );
        await ref.read(restaurantRepositoryProvider).createRestaurant(model);
      }

      ref.invalidate(restaurantsListProvider);
      ref.invalidate(storesListProvider);
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

  void _showAccountError() {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Kirish va parol (kamida 6 belgi) kerak'),
      ),
    );
  }
}

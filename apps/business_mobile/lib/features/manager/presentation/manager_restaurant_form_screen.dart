import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/food_app_button.dart';
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
  bool _isActive = true;
  bool _loading = false;
  bool _initialized = false;

  bool get _isEdit => widget.restaurantId != null;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!_isEdit) return;
    final restaurant = await ref
        .read(restaurantRepositoryProvider)
        .fetchRestaurant(widget.restaurantId!);
    _name.text = restaurant.name;
    _phone.text = restaurant.phone ?? '';
    _address.text = restaurant.branchAddress ?? '';
    _isActive = restaurant.isActive;
    if (mounted) setState(() => _initialized = true);
  }

  @override
  void initState() {
    super.initState();
    if (_isEdit) {
      Future.microtask(_load);
    } else {
      _initialized = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? AppStrings.editRestaurant : AppStrings.createRestaurant),
      ),
      body: !_initialized
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _name,
                    decoration: const InputDecoration(labelText: AppStrings.restaurantName),
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

  Future<void> _save() async {
    if (_name.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final model = RestaurantModel(
        id: widget.restaurantId ?? '',
        name: _name.text.trim(),
        phone: _phone.text.trim(),
        branchAddress: _address.text.trim(),
        isActive: _isActive,
      );
      if (_isEdit) {
        await ref.read(restaurantRepositoryProvider).updateRestaurant(model);
      } else {
        await ref.read(restaurantRepositoryProvider).createRestaurant(model);
      }
      ref.invalidate(restaurantsListProvider);
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

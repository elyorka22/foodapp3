import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../restaurant/data/restaurant_repository.dart';
import '../data/products_repository.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key, this.restaurantId});

  /// When set, manager edits menu for this restaurant.
  final String? restaurantId;

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  String? _actingId;

  @override
  Widget build(BuildContext context) {
    final businessId = widget.restaurantId ?? ref.watch(_myRestaurantIdProvider).valueOrNull;
    final products = ref.watch(_productsProvider(businessId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: widget.restaurantId != null
          ? AppBar(title: const Text(AppStrings.menu))
          : null,
      floatingActionButton: businessId != null
          ? FloatingActionButton.extended(
              onPressed: () => _showProductForm(businessId),
              icon: const Icon(Icons.add),
              label: const Text(AppStrings.addProduct),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_productsProvider(businessId));
          ref.invalidate(_myRestaurantIdProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: 88),
          children: [
            if (widget.restaurantId == null)
              const ScreenHeader(
                title: AppStrings.menu,
                subtitle: 'Narx va mavjudlikni boshqaring',
              ),
            if (businessId == null)
              const EmptyState(
                icon: Icons.restaurant_menu_outlined,
                title: AppStrings.noProducts,
              )
            else
              products.when(
                loading: () => const Padding(
                  padding: EdgeInsets.all(48),
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (e, _) => ErrorState(
                  message: ApiException.formatError(e),
                  onRetry: () => ref.invalidate(_productsProvider(businessId)),
                ),
                data: (list) {
                  if (list.isEmpty) {
                    return const EmptyState(
                      icon: Icons.restaurant_menu_outlined,
                      title: AppStrings.noProducts,
                      subtitle: 'Birinchi mahsulotni qo\'shing',
                    );
                  }
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    child: Column(
                      children: list.map((p) => _ProductTile(
                            product: p,
                            isLoading: _actingId == p.id,
                            onEditPrice: () => _editPrice(p),
                            onToggle: () => _toggleAvailability(p, businessId),
                            onDelete: () => _deleteProduct(p, businessId),
                          )).toList(),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _showProductForm(String businessId, {ProductModel? existing}) async {
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final priceCtrl = TextEditingController(
      text: existing != null ? existing.price.toString() : '',
    );

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: AppSpacing.lg,
            right: AppSpacing.lg,
            top: AppSpacing.lg,
            bottom: MediaQuery.viewInsetsOf(ctx).bottom + AppSpacing.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                existing == null ? AppStrings.addProduct : AppStrings.editPrice,
                style: AppTypography.subtitle,
              ),
              const SizedBox(height: AppSpacing.lg),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: AppStrings.productName),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: priceCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: AppStrings.productPrice),
              ),
              const SizedBox(height: AppSpacing.lg),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text(AppStrings.save),
              ),
            ],
          ),
        );
      },
    );

    if (saved != true || !mounted) return;
    final price = num.tryParse(priceCtrl.text.trim());
    if (nameCtrl.text.trim().isEmpty || price == null) return;

    setState(() => _actingId = existing?.id ?? 'new');
    try {
      if (existing == null) {
        await ref.read(productsRepositoryProvider).createProduct(
              ProductModel(name: nameCtrl.text.trim(), price: price),
              businessId,
            );
      } else {
        await ref.read(productsRepositoryProvider).updateProduct(
              ProductModel(
                id: existing.id,
                name: nameCtrl.text.trim(),
                price: price,
                isAvailable: existing.isAvailable,
                businessId: businessId,
              ),
            );
      }
      ref.invalidate(_productsProvider(businessId));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingId = null);
    }
  }

  Future<void> _editPrice(ProductModel product) async {
    final businessId = widget.restaurantId ?? await ref.read(_myRestaurantIdProvider.future);
    if (businessId == null) return;
    return _showProductForm(businessId, existing: product);
  }

  Future<void> _toggleAvailability(ProductModel product, String businessId) async {
    setState(() => _actingId = product.id);
    try {
      await ref.read(productsRepositoryProvider).updateProduct(
            ProductModel(
              id: product.id,
              name: product.name,
              price: product.price,
              isAvailable: !product.isAvailable,
              businessId: businessId,
            ),
          );
      ref.invalidate(_productsProvider(businessId));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingId = null);
    }
  }

  Future<void> _deleteProduct(ProductModel product, String businessId) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text(AppStrings.delete),
        content: Text('${product.name} o\'chirilsinmi?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text(AppStrings.cancel)),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text(AppStrings.delete)),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _actingId = product.id);
    try {
      await ref.read(productsRepositoryProvider).deleteProduct(product.id);
      ref.invalidate(_productsProvider(businessId));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.formatError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _actingId = null);
    }
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({
    required this.product,
    required this.isLoading,
    required this.onEditPrice,
    required this.onToggle,
    required this.onDelete,
  });

  final ProductModel product;
  final bool isLoading;
  final VoidCallback onEditPrice;
  final VoidCallback onToggle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: AppTypography.subtitle),
                const SizedBox(height: 4),
                Text(
                  formatSum(product.price),
                  style: AppTypography.body.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  product.isAvailable ? AppStrings.available : AppStrings.unavailable,
                  style: AppTypography.caption.copyWith(
                    color: product.isAvailable ? AppColors.success : AppColors.danger,
                  ),
                ),
              ],
            ),
          ),
          if (isLoading)
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else ...[
            IconButton(
              onPressed: onEditPrice,
              icon: const Icon(Icons.edit_outlined),
              tooltip: AppStrings.editPrice,
            ),
            Switch(
              value: product.isAvailable,
              onChanged: (_) => onToggle(),
              activeTrackColor: AppColors.primarySoft,
              activeThumbColor: AppColors.primary,
            ),
            IconButton(
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline, color: AppColors.danger),
            ),
          ],
        ],
      ),
    );
  }
}

final _myRestaurantIdProvider = FutureProvider.autoDispose<String?>((ref) async {
  final restaurant = await ref.watch(restaurantRepositoryProvider).fetchMyRestaurant();
  return restaurant?.id;
});

final _productsProvider = FutureProvider.autoDispose.family<List<ProductModel>, String?>(
  (ref, businessId) async {
    if (businessId == null) return [];
    return ref.watch(productsRepositoryProvider).fetchProducts(businessId: businessId);
  },
);

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/format_sum.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../core/utils/image_url.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../restaurant/data/restaurant_repository.dart';
import '../data/products_repository.dart';
import 'product_form_screen.dart';

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
    final businessKind = ref.watch(_businessKindProvider(businessId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: widget.restaurantId != null
          ? AppBar(title: const Text(AppStrings.menu))
          : null,
      floatingActionButton: businessId != null
          ? FloatingActionButton.extended(
              onPressed: () => _openProductForm(businessId),
              icon: const Icon(Icons.add),
              label: const Text(AppStrings.addProduct),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(_productsProvider(businessId));
          ref.invalidate(_myRestaurantIdProvider);
          ref.invalidate(_businessKindProvider(businessId));
        },
        child: ListView(
          padding: scrollFabPadding(context),
          children: [
            if (widget.restaurantId == null)
              const ScreenHeader(
                title: AppStrings.menu,
                subtitle: 'Mahsulotlar, narx va mavjudlik',
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
                  final isStore = businessKind.valueOrNull ?? false;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    child: Column(
                      children: list
                          .map(
                            (p) => _ProductTile(
                              product: p,
                              isLoading: _actingId == p.id,
                              onEdit: () => _openProductForm(businessId, existing: p),
                              onToggle: () => _toggleAvailability(p, businessId, isStore),
                              onDelete: () => _deleteProduct(p, businessId),
                            ),
                          )
                          .toList(),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _openProductForm(String businessId, {ProductModel? existing}) async {
    final saved = await context.push<bool>(
      AppRoutes.productForm,
      extra: ProductFormArgs(businessId: businessId, existing: existing),
    );
    if (saved == true && mounted) {
      ref.invalidate(_productsProvider(businessId));
    }
  }

  Future<void> _toggleAvailability(
    ProductModel product,
    String businessId,
    bool isStore,
  ) async {
    final id = product.id;
    if (id == null) return;
    setState(() => _actingId = id);
    try {
      await ref.read(productsRepositoryProvider).updateProduct(
            ProductModel(
              id: id,
              name: product.name,
              price: product.price,
              description: product.description,
              isAvailable: !product.isAvailable,
              dishCategoryId: product.dishCategoryId,
              productCategoryId: product.productCategoryId,
            ),
            isStore: isStore,
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

    final id = product.id;
    if (id == null) return;
    setState(() => _actingId = id);
    try {
      await ref.read(productsRepositoryProvider).deleteProduct(id);
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
    required this.onEdit,
    required this.onToggle,
    required this.onDelete,
  });

  final ProductModel product;
  final bool isLoading;
  final VoidCallback onEdit;
  final VoidCallback onToggle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final imageUrl = resolveImageUrl(product.imageUrl);

    return AppCard(
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 56,
              height: 56,
              child: imageUrl != null
                  ? Image.network(imageUrl, fit: BoxFit.cover)
                  : const ColoredBox(
                      color: AppColors.primarySoft,
                      child: Icon(Icons.fastfood_outlined, color: AppColors.primary),
                    ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: AppTypography.subtitle),
                if ((product.description ?? '').isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    product.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.caption,
                  ),
                ],
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
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined),
              tooltip: AppStrings.editProduct,
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

final _businessKindProvider = FutureProvider.autoDispose.family<bool, String?>(
  (ref, businessId) async {
    if (businessId == null) return false;
    final restaurant = await ref.watch(restaurantRepositoryProvider).fetchRestaurant(businessId);
    return restaurant.isStore;
  },
);

final _productsProvider = FutureProvider.autoDispose.family<List<ProductModel>, String?>(
  (ref, businessId) async {
    if (businessId == null) return [];
    return ref.watch(productsRepositoryProvider).fetchProducts(businessId: businessId);
  },
);

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/dish_categories_provider.dart';

class CategoryProductsScreen extends ConsumerWidget {
  const CategoryProductsScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(dishCategoriesProvider);
    final products = ref.watch(categoryProductsProvider(slug));
    final categoryName = categories.valueOrNull?.where((c) => c.slug == slug).map((c) => c.name).firstOrNull ?? slug;

    return Scaffold(
      appBar: AppBar(title: Text(categoryName)),
      body: products.when(
        data: (list) {
          if (list.isEmpty) {
            return Center(child: Text(AppStrings.errorGeneric, style: AppTypography.body));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(AppSpacing.lg),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.md,
              crossAxisSpacing: AppSpacing.md,
              childAspectRatio: 0.72,
            ),
            itemCount: list.length,
            itemBuilder: (_, i) {
              final p = list[i];
              return InkWell(
                onTap: p.restaurantSlug != null ? () => context.go('/restaurants/${p.restaurantSlug}') : null,
                borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
                child: Card(
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: p.imageUrl != null
                            ? CachedNetworkImage(imageUrl: p.imageUrl!, fit: BoxFit.cover)
                            : Container(color: Colors.grey.shade200),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p.name, maxLines: 2, style: AppTypography.bodySmall),
                            if (p.restaurantName != null)
                              Text(p.restaurantName!, style: AppTypography.bodySmall.copyWith(fontSize: 11)),
                            if (p.description != null && p.description!.trim().isNotEmpty)
                              Text(
                                p.description!,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.bodySmall.copyWith(
                                  fontSize: 11,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            Text('${p.price} UZS', style: AppTypography.subtitle.copyWith(fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}

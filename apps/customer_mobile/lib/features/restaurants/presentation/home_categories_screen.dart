import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/public_settings_provider.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/home_service_cards.dart';
import '../../../shared/models/business_model.dart';
import '../../stores/providers/stores_provider.dart';

class HomeCategoriesScreen extends ConsumerWidget {
  const HomeCategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final typesAsync = ref.watch(businessTypesProvider);
    final overrides =
        ref.watch(publicSettingsProvider).valueOrNull?.homeServiceCards;
    final types = [...(typesAsync.valueOrNull ?? const <BusinessTypeModel>[])]
      ..sort((a, b) => (a.sortOrder ?? 0).compareTo(b.sortOrder ?? 0));

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          AppStrings.storeAllCategories,
          style: AppTypography.title.copyWith(fontSize: 17),
        ),
      ),
      body: typesAsync.isLoading && types.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
              ),
              itemCount: types.length,
              itemBuilder: (context, index) {
                final type = types[index];
                final layout = layoutForBusinessTypeSlug(
                  slug: type.slug,
                  imageUrl: type.imageUrl,
                  overrides: overrides,
                );
                final route = type.isRestaurantType
                    ? AppRoutes.allRestaurants
                    : '/stores/${type.slug}';
                return Material(
                  color: const Color(0xFFF3EEFF),
                  borderRadius: BorderRadius.circular(22),
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () => context.push(route),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Stack(
                        children: [
                          Text(
                            type.name,
                            style: AppTypography.subtitle.copyWith(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              height: 1.15,
                            ),
                          ),
                          if (layout.imageUrl.trim().isNotEmpty)
                            Align(
                              alignment: Alignment.bottomRight,
                              child: CachedNetworkImage(
                                imageUrl: layout.imageUrl,
                                width: 72,
                                height: 72,
                                fit: BoxFit.contain,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

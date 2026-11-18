import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/image_url.dart';
import '../models/restaurant_model.dart';

/// Compact 4-col circle strip (max 7 cats + “all” grid tile).
class StoreCategoryCircles extends StatelessWidget {
  const StoreCategoryCircles({
    super.key,
    required this.categories,
    required this.activeId,
    required this.onChanged,
    required this.onOpenAll,
  });

  final List<RestaurantCategoryModel> categories;
  final String activeId;
  final ValueChanged<String> onChanged;
  final VoidCallback onOpenAll;

  static const _tints = [
    Color(0xFFEEF2FF),
    Color(0xFFECFDF5),
    Color(0xFFFFF7ED),
    Color(0xFFFDF2F8),
    Color(0xFFF0F9FF),
    Color(0xFFFEF3C7),
    Color(0xFFF5F3FF),
  ];

  @override
  Widget build(BuildContext context) {
    final visible = categories.take(7).toList();
    final items = <_Item>[
      for (final c in visible) _Item(id: c.id, name: c.name, imageUrl: c.imageUrl),
      _Item(id: 'all', name: AppStrings.storeAllCategories, isAll: true),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 8,
        childAspectRatio: 0.78,
      ),
      itemBuilder: (context, index) {
        final item = items[index];
        final active = !item.isAll && activeId == item.id;
        final resolved = resolveImageUrl(item.imageUrl);
        return InkWell(
          onTap: () {
            if (item.isAll) {
              onOpenAll();
              return;
            }
            onChanged(item.id);
          },
          borderRadius: BorderRadius.circular(16),
          child: Column(
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: item.isAll || resolved == null
                      ? (item.isAll
                          ? const Color(0xFFFAFAFA)
                          : _tints[index % _tints.length])
                      : const Color(0xFFFAFAFA),
                  border: Border.all(
                    color: active ? AppColors.primary : const Color(0xFFE4E4E7),
                    width: active ? 2 : 1,
                  ),
                ),
                clipBehavior: Clip.antiAlias,
                child: item.isAll
                    ? const Icon(Icons.grid_view_rounded, size: 22)
                    : resolved != null && resolved.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: resolved,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Center(
                              child: Text(
                                item.name.isNotEmpty
                                    ? item.name[0].toUpperCase()
                                    : '?',
                                style: AppTypography.title.copyWith(fontSize: 20),
                              ),
                            ),
                          )
                        : Center(
                            child: Text(
                              item.name.isNotEmpty
                                  ? item.name[0].toUpperCase()
                                  : '?',
                              style: AppTypography.title.copyWith(fontSize: 20),
                            ),
                          ),
              ),
              const SizedBox(height: 6),
              Text(
                item.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 11,
                  height: 1.15,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Item {
  const _Item({
    required this.id,
    required this.name,
    this.imageUrl,
    this.isAll = false,
  });

  final String id;
  final String name;
  final String? imageUrl;
  final bool isAll;
}

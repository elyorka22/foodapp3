import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../models/city_model.dart';
import '../providers/cities_provider.dart';
import '../providers/selected_city_provider.dart';

/// City name with inverted caret — opens a bottom sheet picker.
class CitySelector extends ConsumerWidget {
  const CitySelector({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final citiesAsync = ref.watch(citiesProvider);
    final selected = ref.watch(selectedCityProvider);

    return citiesAsync.when(
      loading: () => Container(
        height: 30,
        width: 120,
        decoration: BoxDecoration(
          color: AppColors.border,
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      error: (_, __) => _CityButton(
        label: selected?.name ?? 'Chust',
        onTap: () {},
      ),
      data: (cities) => _CityButton(
        label: selected?.name ?? (cities.isNotEmpty ? cities.first.name : 'Chust'),
        onTap: cities.length <= 1
            ? null
            : () => _openCitySheet(context, ref, cities, selected?.slug),
      ),
    );
  }

  Future<void> _openCitySheet(
    BuildContext context,
    WidgetRef ref,
    List<CityModel> cities,
    String? selectedSlug,
  ) async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text('Shaharni tanlang', style: AppTypography.subtitle),
                const SizedBox(height: AppSpacing.md),
                for (final city in cities) ...[
                  _CityTile(
                    city: city,
                    selected: city.slug == selectedSlug,
                    onTap: () async {
                      await ref
                          .read(selectedCitySlugProvider.notifier)
                          .selectSlug(city.slug);
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
                  ),
                  const SizedBox(height: AppSpacing.sm),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _CityButton extends StatelessWidget {
  const _CityButton({required this.label, this.onTap});

  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final child = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Flexible(
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.title.copyWith(fontSize: 26),
          ),
        ),
        const SizedBox(width: 4),
        Icon(
          Icons.keyboard_arrow_down_rounded,
          size: 28,
          color: AppColors.textPrimary.withValues(alpha: onTap == null ? 0.35 : 1),
        ),
      ],
    );

    if (onTap == null) return child;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: child,
      ),
    );
  }
}

class _CityTile extends StatelessWidget {
  const _CityTile({
    required this.city,
    required this.selected,
    required this.onTap,
  });

  final CityModel city;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.primarySoft : AppColors.surface,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  city.name,
                  style: AppTypography.subtitle.copyWith(
                    color: selected ? AppColors.primaryDark : AppColors.textPrimary,
                  ),
                ),
              ),
              if (selected)
                const Icon(Icons.check_rounded, color: AppColors.primary, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}

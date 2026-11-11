import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/header_action.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/business_types_repository.dart';

final businessTypesListProvider =
    FutureProvider.autoDispose<List<ControlBusinessType>>((ref) {
  return ref.watch(businessTypesRepositoryProvider).fetchTypes();
});

class BusinessTypesScreen extends ConsumerWidget {
  const BusinessTypesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(businessTypesListProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: AppStrings.navBusinessTypes,
          trailing: HeaderAction(
            label: AppStrings.create,
            onPressed: () => showDetailSheet(
              context: context,
              title: AppStrings.addBusinessType,
              builder: (_) => const _TypeForm(),
            ),
          ),
        ),
        Expanded(
          child: AsyncPageBody<List<ControlBusinessType>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(businessTypesListProvider.future),
            isEmpty: (list) => list.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            dataBuilder: (list) => ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: 6),
              itemBuilder: (context, i) {
                final t = list[i];
                return ControlListCard(
                  title: t.name,
                  subtitle: t.verticalHint,
                  trailing: StatusChip(
                    status: t.isActive ? 'DELIVERED' : 'CANCELLED',
                    label: t.isActive ? AppStrings.active : AppStrings.inactive,
                  ),
                  onTap: () => showDetailSheet(
                    context: context,
                    title: AppStrings.edit,
                    builder: (_) => _TypeForm(type: t),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _TypeForm extends ConsumerStatefulWidget {
  const _TypeForm({this.type});
  final ControlBusinessType? type;

  @override
  ConsumerState<_TypeForm> createState() => _TypeFormState();
}

class _TypeFormState extends ConsumerState<_TypeForm> {
  late final TextEditingController _name;
  bool _isActive = true;
  bool _busy = false;
  String? _menuMode;

  static const _options = <({
    String value,
    String title,
    String hint,
  })>[
    (
      value: 'SHARED_CATALOG',
      title: AppStrings.catalogKindShared,
      hint: AppStrings.catalogKindSharedHint,
    ),
    (
      value: 'OWN_CATEGORIES',
      title: AppStrings.catalogKindOwn,
      hint: AppStrings.catalogKindOwnHint,
    ),
    (
      value: 'GLOBAL_DISH',
      title: AppStrings.catalogKindRestaurant,
      hint: AppStrings.catalogKindRestaurantHint,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.type?.name ?? '');
    _isActive = widget.type?.isActive ?? true;
    _menuMode = widget.type?.menuMode;
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    final menuMode = _menuMode;
    if (menuMode == null || menuMode.isEmpty) {
      showActionSnackBar(
        context,
        AppStrings.catalogKindRequired,
        error: true,
      );
      return;
    }
    setState(() => _busy = true);
    try {
      final repo = ref.read(businessTypesRepositoryProvider);
      if (widget.type == null) {
        await repo.createType(
          name: name,
          isActive: _isActive,
          menuMode: menuMode,
        );
      } else {
        await repo.updateType(
          widget.type!.id,
          name: name,
          isActive: _isActive,
          menuMode: menuMode,
        );
      }
      ref.invalidate(businessTypesListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.pop(context);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _name,
          decoration: const InputDecoration(labelText: AppStrings.nameLabel),
        ),
        const SizedBox(height: 12),
        Text(
          AppStrings.catalogKindLabel,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        for (final opt in _options) ...[
          Material(
            color: _menuMode == opt.value
                ? AppColors.primary.withOpacity(0.12)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: _busy
                  ? null
                  : () => setState(() => _menuMode = opt.value),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _menuMode == opt.value
                        ? AppColors.primary
                        : AppColors.border,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      _menuMode == opt.value
                          ? Icons.radio_button_checked
                          : Icons.radio_button_off,
                      size: 20,
                      color: _menuMode == opt.value
                          ? AppColors.primary
                          : AppColors.textSecondary,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            opt.title,
                            style: AppTypography.body.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            opt.hint,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(AppStrings.active),
          value: _isActive,
          onChanged: _busy ? null : (v) => setState(() => _isActive = v),
        ),
        MutationButton(label: AppStrings.save, loading: _busy, onPressed: _save),
        if (widget.type != null) ...[
          const SizedBox(height: 8),
          MutationButton(
            label: AppStrings.delete,
            filled: false,
            destructive: true,
            loading: _busy,
            onPressed: () async {
              setState(() => _busy = true);
              try {
                await ref
                    .read(businessTypesRepositoryProvider)
                    .deleteType(widget.type!.id);
                ref.invalidate(businessTypesListProvider);
                if (!mounted) return;
                showActionSnackBar(context, AppStrings.actionDone);
                Navigator.pop(context);
              } catch (e) {
                if (mounted) showActionError(context, e);
              } finally {
                if (mounted) setState(() => _busy = false);
              }
            },
          ),
        ],
      ],
    );
  }
}

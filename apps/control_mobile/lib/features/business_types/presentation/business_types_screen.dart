import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
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
                  subtitle: t.catalogMode,
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

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.type?.name ?? '');
    _isActive = widget.type?.isActive ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    setState(() => _busy = true);
    try {
      final repo = ref.read(businessTypesRepositoryProvider);
      if (widget.type == null) {
        await repo.createType(name: name, isActive: _isActive);
      } else {
        await repo.updateType(widget.type!.id, name: name, isActive: _isActive);
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

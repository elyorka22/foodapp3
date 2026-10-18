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
import '../data/cities_repository.dart';

final citiesListProvider =
    FutureProvider.autoDispose<List<ControlCity>>((ref) {
  return ref.watch(citiesRepositoryProvider).fetchCities();
});

class CitiesScreen extends ConsumerWidget {
  const CitiesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(citiesListProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: AppStrings.navCities,
          trailing: HeaderAction(
            label: AppStrings.create,
            onPressed: () => showDetailSheet(
              context: context,
              title: AppStrings.addCity,
              builder: (_) => const _CityForm(),
            ),
          ),
        ),
        Expanded(
          child: AsyncPageBody<List<ControlCity>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(citiesListProvider.future),
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
                final c = list[i];
                return ControlListCard(
                  title: c.name,
                  subtitle: c.slug,
                  trailing: StatusChip(
                    status: c.isActive ? 'DELIVERED' : 'CANCELLED',
                    label: c.isActive ? AppStrings.active : AppStrings.inactive,
                  ),
                  onTap: () => showDetailSheet(
                    context: context,
                    title: AppStrings.edit,
                    builder: (_) => _CityForm(city: c),
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

class _CityForm extends ConsumerStatefulWidget {
  const _CityForm({this.city});
  final ControlCity? city;

  @override
  ConsumerState<_CityForm> createState() => _CityFormState();
}

class _CityFormState extends ConsumerState<_CityForm> {
  late final TextEditingController _name;
  bool _isActive = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.city?.name ?? '');
    _isActive = widget.city?.isActive ?? true;
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
      final repo = ref.read(citiesRepositoryProvider);
      if (widget.city == null) {
        await repo.createCity(name: name, isActive: _isActive);
      } else {
        await repo.updateCity(widget.city!.id, name: name, isActive: _isActive);
      }
      ref.invalidate(citiesListProvider);
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
        if (widget.city != null) ...[
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
                    .read(citiesRepositoryProvider)
                    .deleteCity(widget.city!.id);
                ref.invalidate(citiesListProvider);
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

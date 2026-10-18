import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format_uz.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/confirm_dialog.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/header_action.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/page_header.dart';
import '../../../shared/widgets/status_chip.dart';
import '../../cities/data/cities_repository.dart';
import '../data/delivery_zone_model.dart';
import '../data/delivery_zones_repository.dart';

final _zoneCityFilterProvider = StateProvider.autoDispose<String?>((ref) => null);

final deliveryZonesListProvider =
    FutureProvider.autoDispose<List<ControlDeliveryZone>>((ref) {
  final cityId = ref.watch(_zoneCityFilterProvider);
  return ref.watch(deliveryZonesRepositoryProvider).fetchZones(cityId: cityId);
});

final _zoneCitiesProvider =
    FutureProvider.autoDispose<List<ControlCity>>((ref) {
  return ref.watch(citiesRepositoryProvider).fetchCities();
});

class DeliveryZonesScreen extends ConsumerWidget {
  const DeliveryZonesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(deliveryZonesListProvider);
    final citiesAsync = ref.watch(_zoneCitiesProvider);
    final selectedCityId = ref.watch(_zoneCityFilterProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageHeader(
          title: AppStrings.deliveryZonesTitle,
          trailing: HeaderAction(
            label: AppStrings.create,
            icon: Icons.add_location_alt_outlined,
            onPressed: () => showDetailSheet(
              context: context,
              title: AppStrings.addDeliveryZone,
              initialChildSize: 0.92,
              builder: (_) => const _ZoneFormSheet(),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            0,
            AppSpacing.lg,
            AppSpacing.sm,
          ),
          child: citiesAsync.when(
            data: (cities) {
              final active = cities.where((c) => c.isActive).toList();
              return DropdownButtonFormField<String?>(
                value: selectedCityId,
                decoration: const InputDecoration(
                  labelText: AppStrings.filterByCity,
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child: Text(AppStrings.allCities),
                  ),
                  for (final c in active)
                    DropdownMenuItem<String?>(
                      value: c.id,
                      child: Text(c.name),
                    ),
                ],
                onChanged: (v) {
                  ref.read(_zoneCityFilterProvider.notifier).state = v;
                },
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ),
        Expanded(
          child: AsyncPageBody<List<ControlDeliveryZone>>(
            asyncValue: async,
            onRefresh: () => ref.refresh(deliveryZonesListProvider.future),
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.sm,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            dataBuilder: (zones) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (zones.isEmpty) const Text(AppStrings.emptyList),
                  ...zones.map((z) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: ControlListCard(
                        title: z.name,
                        subtitle: [
                          if (z.cityName != null) z.cityName!,
                          if (z.radiusKm != null) '${z.radiusKm} km',
                          formatMoney(z.baseFee),
                        ].join(' · '),
                        trailing: StatusChip(
                          status: z.isActive ? 'DELIVERED' : 'CANCELLED',
                          label: z.isActive
                              ? AppStrings.active
                              : AppStrings.inactive,
                        ),
                        onTap: () => showDetailSheet(
                          context: context,
                          title: AppStrings.editDeliveryZone,
                          initialChildSize: 0.92,
                          builder: (_) => _ZoneFormSheet(zone: z),
                        ),
                      ),
                    );
                  }),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

class _ZoneFormSheet extends ConsumerStatefulWidget {
  const _ZoneFormSheet({this.zone});

  final ControlDeliveryZone? zone;

  @override
  ConsumerState<_ZoneFormSheet> createState() => _ZoneFormSheetState();
}

class _ZoneFormSheetState extends ConsumerState<_ZoneFormSheet> {
  late final TextEditingController _name;
  late final TextEditingController _lat;
  late final TextEditingController _lng;
  late final TextEditingController _radius;
  late final TextEditingController _baseFee;
  late final TextEditingController _perKm;
  late final TextEditingController _minFee;
  String? _cityId;
  bool _isActive = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final z = widget.zone;
    _name = TextEditingController(text: z?.name ?? '');
    _lat = TextEditingController(
      text: (z?.centerLatitude ?? 41.31).toString(),
    );
    _lng = TextEditingController(
      text: (z?.centerLongitude ?? 69.24).toString(),
    );
    _radius = TextEditingController(text: (z?.radiusKm ?? 5).toString());
    _baseFee = TextEditingController(text: (z?.baseFee ?? 8000).toString());
    _perKm = TextEditingController(text: (z?.pricePerKm ?? 1500).toString());
    _minFee = TextEditingController(
      text: (z?.minDeliveryFee ?? 5000).toString(),
    );
    _cityId = z?.cityId;
    _isActive = z?.isActive ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
    _lat.dispose();
    _lng.dispose();
    _radius.dispose();
    _baseFee.dispose();
    _perKm.dispose();
    _minFee.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final cityId = _cityId;
    final lat = double.tryParse(_lat.text.trim());
    final lng = double.tryParse(_lng.text.trim());
    final radius = double.tryParse(_radius.text.trim());
    final baseFee = num.tryParse(_baseFee.text.trim());
    final perKm = num.tryParse(_perKm.text.trim());
    final minFee = num.tryParse(_minFee.text.trim());

    if (name.length < 2) {
      showActionSnackBar(context, 'Nom kamida 2 belgi', error: true);
      return;
    }
    if (cityId == null || cityId.isEmpty) {
      showActionSnackBar(context, 'Shaharni tanlang', error: true);
      return;
    }
    if (lat == null || lng == null || radius == null || radius < 0.1) {
      showActionSnackBar(context, 'Lat/lng/radius noto‘g‘ri', error: true);
      return;
    }
    if (baseFee == null || perKm == null || minFee == null) {
      showActionSnackBar(context, 'Narxlarni to‘ldiring', error: true);
      return;
    }

    setState(() => _busy = true);
    try {
      final repo = ref.read(deliveryZonesRepositoryProvider);
      if (widget.zone == null) {
        await repo.createZone(
          name: name,
          cityId: cityId,
          centerLatitude: lat,
          centerLongitude: lng,
          radiusKm: radius,
          baseFee: baseFee,
          pricePerKm: perKm,
          minDeliveryFee: minFee,
          isActive: _isActive,
        );
      } else {
        await repo.updateZone(
          widget.zone!.id,
          name: name,
          cityId: cityId,
          centerLatitude: lat,
          centerLongitude: lng,
          radiusKm: radius,
          baseFee: baseFee,
          pricePerKm: perKm,
          minDeliveryFee: minFee,
          isActive: _isActive,
        );
      }
      ref.invalidate(deliveryZonesListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final id = widget.zone?.id;
    if (id == null) return;
    final ok = await showConfirmDialog(
      context,
      title: AppStrings.delete,
      message: AppStrings.confirmDeleteZone,
      destructive: true,
    );
    if (!ok) return;
    setState(() => _busy = true);
    try {
      await ref.read(deliveryZonesRepositoryProvider).deleteZone(id);
      ref.invalidate(deliveryZonesListProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cities = ref.watch(_zoneCitiesProvider).valueOrNull
            ?.where((c) => c.isActive)
            .toList() ??
        const <ControlCity>[];
    final cityValue =
        cities.any((c) => c.id == _cityId) ? _cityId : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _name,
          enabled: !_busy,
          decoration: const InputDecoration(labelText: AppStrings.nameLabel),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: cityValue,
          decoration: const InputDecoration(labelText: AppStrings.businessCity),
          items: [
            for (final c in cities)
              DropdownMenuItem(value: c.id, child: Text(c.name)),
          ],
          onChanged: _busy ? null : (v) => setState(() => _cityId = v),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _lat,
                enabled: !_busy,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                  signed: true,
                ),
                decoration: const InputDecoration(
                  labelText: AppStrings.latitudeLabel,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _lng,
                enabled: !_busy,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                  signed: true,
                ),
                decoration: const InputDecoration(
                  labelText: AppStrings.longitudeLabel,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _radius,
          enabled: !_busy,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(labelText: AppStrings.zoneRadiusKm),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _baseFee,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: AppStrings.zoneBaseFee),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _perKm,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration:
              const InputDecoration(labelText: AppStrings.zonePricePerKm),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _minFee,
          enabled: !_busy,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: AppStrings.zoneMinFee),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(AppStrings.active),
          value: _isActive,
          onChanged: _busy ? null : (v) => setState(() => _isActive = v),
        ),
        MutationButton(
          label: AppStrings.save,
          loading: _busy,
          onPressed: _busy ? null : _save,
        ),
        if (widget.zone != null) ...[
          const SizedBox(height: 8),
          MutationButton(
            label: AppStrings.delete,
            filled: false,
            destructive: true,
            loading: _busy,
            onPressed: _busy ? null : _delete,
          ),
        ],
      ],
    );
  }
}

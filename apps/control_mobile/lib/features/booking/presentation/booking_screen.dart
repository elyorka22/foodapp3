import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/control_list_card.dart';
import '../../../shared/widgets/detail_sheet.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../../../shared/widgets/status_chip.dart';
import '../data/booking_repository.dart';

class _BookingBundle {
  const _BookingBundle({required this.venues, required this.slides});
  final List<BookingVenue> venues;
  final List<BookingSlide> slides;
}

final bookingProvider =
    FutureProvider.autoDispose<_BookingBundle>((ref) async {
  final repo = ref.watch(bookingRepositoryProvider);
  final venues = await repo.fetchVenues();
  final slides = await repo.fetchSlides();
  return _BookingBundle(venues: venues, slides: slides);
});

class BookingScreen extends ConsumerWidget {
  const BookingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(bookingProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Text(AppStrings.navBooking, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<_BookingBundle>(
            asyncValue: async,
            onRefresh: () => ref.refresh(bookingProvider.future),
            isEmpty: (b) => b.venues.isEmpty && b.slides.isEmpty,
            emptyMessage: AppStrings.emptyList,
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (bundle) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          AppStrings.venuesSection,
                          style: AppTypography.subtitle,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => showDetailSheet(
                          context: context,
                          title: AppStrings.create,
                          builder: (_) => const _VenueForm(),
                        ),
                        icon: const Icon(Icons.add),
                        label: const Text(AppStrings.create),
                      ),
                    ],
                  ),
                  ...bundle.venues.map(
                    (v) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: ControlListCard(
                        title: v.name,
                        subtitle: v.address,
                        trailing: StatusChip(
                          status: v.isActive ? 'DELIVERED' : 'CANCELLED',
                          label: v.isActive
                              ? AppStrings.active
                              : AppStrings.inactive,
                        ),
                        onTap: () => showDetailSheet(
                          context: context,
                          title: AppStrings.edit,
                          builder: (_) => _VenueForm(venue: v),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          AppStrings.slidesSection,
                          style: AppTypography.subtitle,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => showDetailSheet(
                          context: context,
                          title: AppStrings.create,
                          builder: (_) => const _SlideForm(),
                        ),
                        icon: const Icon(Icons.add),
                        label: const Text(AppStrings.create),
                      ),
                    ],
                  ),
                  ...bundle.slides.map(
                    (s) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: ControlListCard(
                        title: s.title?.isNotEmpty == true ? s.title! : s.id,
                        subtitle: s.imageUrl,
                        trailing: StatusChip(
                          status: s.isActive ? 'DELIVERED' : 'CANCELLED',
                          label: s.isActive
                              ? AppStrings.active
                              : AppStrings.inactive,
                        ),
                        onTap: () async {
                          try {
                            await ref
                                .read(bookingRepositoryProvider)
                                .deleteSlide(s.id);
                            ref.invalidate(bookingProvider);
                            if (context.mounted) {
                              showActionSnackBar(
                                  context, AppStrings.actionDone);
                            }
                          } catch (e) {
                            if (context.mounted) showActionError(context, e);
                          }
                        },
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

class _VenueForm extends ConsumerStatefulWidget {
  const _VenueForm({this.venue});
  final BookingVenue? venue;

  @override
  ConsumerState<_VenueForm> createState() => _VenueFormState();
}

class _VenueFormState extends ConsumerState<_VenueForm> {
  late final TextEditingController _name;
  bool _isActive = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.venue?.name ?? '');
    _isActive = widget.venue?.isActive ?? true;
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
      final repo = ref.read(bookingRepositoryProvider);
      if (widget.venue == null) {
        await repo.createVenue(name: name);
      } else {
        await repo.updateVenue(widget.venue!.id, name: name, isActive: _isActive);
      }
      ref.invalidate(bookingProvider);
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
        if (widget.venue != null)
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text(AppStrings.active),
            value: _isActive,
            onChanged: _busy ? null : (v) => setState(() => _isActive = v),
          ),
        MutationButton(label: AppStrings.save, loading: _busy, onPressed: _save),
        if (widget.venue != null) ...[
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
                    .read(bookingRepositoryProvider)
                    .deleteVenue(widget.venue!.id);
                ref.invalidate(bookingProvider);
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

class _SlideForm extends ConsumerStatefulWidget {
  const _SlideForm();

  @override
  ConsumerState<_SlideForm> createState() => _SlideFormState();
}

class _SlideFormState extends ConsumerState<_SlideForm> {
  final _title = TextEditingController();
  final _imageUrl = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _imageUrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final imageUrl = _imageUrl.text.trim();
    if (imageUrl.isEmpty) return;
    setState(() => _busy = true);
    try {
      await ref.read(bookingRepositoryProvider).createSlide(
            imageUrl: imageUrl,
            title: _title.text.trim(),
          );
      ref.invalidate(bookingProvider);
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
          controller: _title,
          decoration: const InputDecoration(labelText: AppStrings.bannerTitle),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _imageUrl,
          decoration:
              const InputDecoration(labelText: AppStrings.bannerImageUrl),
        ),
        const SizedBox(height: 16),
        MutationButton(label: AppStrings.create, loading: _busy, onPressed: _save),
      ],
    );
  }
}

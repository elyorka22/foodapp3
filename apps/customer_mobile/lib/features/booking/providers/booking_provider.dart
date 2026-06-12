import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/booking_repository.dart';
import '../models/booking_models.dart';

final bookingVenuesProvider =
    FutureProvider.autoDispose<List<BookingVenueModel>>((ref) {
  return ref.watch(bookingRepositoryProvider).fetchVenues();
});

final bookingSlidesProvider =
    FutureProvider.autoDispose<List<BookingSlideModel>>((ref) {
  return ref.watch(bookingRepositoryProvider).fetchSlides();
});

final bookingVenueDetailProvider =
    FutureProvider.autoDispose.family<BookingVenueModel, String>((ref, slug) {
  return ref.watch(bookingRepositoryProvider).fetchVenue(slug);
});

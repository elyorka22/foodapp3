import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../models/booking_models.dart';

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  return BookingRepository(ref.watch(dioProvider));
});

class BookingRepository {
  BookingRepository(this._dio);

  final Dio _dio;

  Future<List<BookingVenueModel>> fetchVenues() async {
    final res = await _dio.get<List<dynamic>>('/booking/venues');
    return (res.data ?? [])
        .whereType<Map<String, dynamic>>()
        .map(BookingVenueModel.fromJson)
        .toList();
  }

  Future<BookingVenueModel> fetchVenue(String slug) async {
    final res = await _dio.get<Map<String, dynamic>>('/booking/venues/$slug');
    return BookingVenueModel.fromJson(res.data!);
  }

  Future<List<BookingSlideModel>> fetchSlides() async {
    final res = await _dio.get<List<dynamic>>('/booking/slides');
    return (res.data ?? [])
        .whereType<Map<String, dynamic>>()
        .map(BookingSlideModel.fromJson)
        .toList();
  }
}

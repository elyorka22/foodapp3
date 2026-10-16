import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';

class BookingVenue {
  const BookingVenue({
    required this.id,
    required this.name,
    required this.isActive,
    this.address,
    this.phone,
  });

  final String id;
  final String name;
  final bool isActive;
  final String? address;
  final String? phone;

  factory BookingVenue.fromJson(Map<String, dynamic> json) {
    return BookingVenue(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
    );
  }
}

class BookingSlide {
  const BookingSlide({
    required this.id,
    required this.imageUrl,
    required this.isActive,
    this.title,
    this.sortOrder = 0,
  });

  final String id;
  final String imageUrl;
  final bool isActive;
  final String? title;
  final int sortOrder;

  factory BookingSlide.fromJson(Map<String, dynamic> json) {
    return BookingSlide(
      id: json['id'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      title: json['title'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }
}

class BookingRepository {
  BookingRepository(this._dio);
  final Dio _dio;

  Future<List<BookingVenue>> fetchVenues() async {
    final res = await _dio.get<dynamic>(ApiPaths.bookingVenuesAdmin);
    return parseObjectList(res.data).map(BookingVenue.fromJson).toList();
  }

  Future<BookingVenue> createVenue({required String name}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.bookingVenuesAdmin,
      data: {'name': name},
    );
    return BookingVenue.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<BookingVenue> updateVenue(
    String id, {
    String? name,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.bookingVenue(id),
      data: {
        if (name != null) 'name': name,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return BookingVenue.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteVenue(String id) async {
    await _dio.delete<dynamic>(ApiPaths.bookingVenue(id));
  }

  Future<List<BookingSlide>> fetchSlides() async {
    final res = await _dio.get<dynamic>(ApiPaths.bookingSlidesAdmin);
    return parseObjectList(res.data).map(BookingSlide.fromJson).toList();
  }

  Future<BookingSlide> createSlide({
    required String imageUrl,
    String? title,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.bookingSlidesAdmin,
      data: {
        'imageUrl': imageUrl,
        if (title != null) 'title': title,
      },
    );
    return BookingSlide.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteSlide(String id) async {
    await _dio.delete<dynamic>(ApiPaths.bookingSlide(id));
  }
}

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  return BookingRepository(ref.watch(dioProvider));
});

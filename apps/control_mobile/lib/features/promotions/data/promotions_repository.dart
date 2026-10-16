import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import 'banner_model.dart';
import 'promo_model.dart';

class PromotionsRepository {
  PromotionsRepository(this._dio);

  final Dio _dio;

  Future<List<ControlPromoCode>> fetchPromoCodes() async {
    final res = await _dio.get<dynamic>(ApiPaths.promoCodes);
    return parseObjectList(res.data).map(ControlPromoCode.fromJson).toList();
  }

  Future<ControlPromoCode> createPromoCode({
    required String code,
    required String type,
    required num value,
    num? minimumOrderAmount,
    num? maximumDiscount,
    int? usageLimit,
    bool isActive = true,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.promoCodes,
      data: {
        'code': code,
        'type': type,
        'value': value,
        'isActive': isActive,
        if (minimumOrderAmount != null) 'minimumOrderAmount': minimumOrderAmount,
        if (maximumDiscount != null) 'maximumDiscount': maximumDiscount,
        if (usageLimit != null) 'usageLimit': usageLimit,
      },
    );
    return ControlPromoCode.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlPromoCode> updatePromoCode(
    String id, {
    String? code,
    String? type,
    num? value,
    bool? isActive,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.promoCode(id),
      data: {
        if (code != null) 'code': code,
        if (type != null) 'type': type,
        if (value != null) 'value': value,
        if (isActive != null) 'isActive': isActive,
      },
    );
    return ControlPromoCode.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deletePromoCode(String id) async {
    await _dio.delete<dynamic>(ApiPaths.promoCode(id));
  }

  Future<List<ControlBanner>> fetchBannersAdmin() async {
    final res = await _dio.get<dynamic>(ApiPaths.bannersAdmin);
    return parseObjectList(res.data).map(ControlBanner.fromJson).toList();
  }

  Future<ControlBanner> createBanner({
    required String imageUrl,
    String? title,
    String? link,
    String? placement,
    int? sortOrder,
    bool isActive = true,
    String? description,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.banners,
      data: {
        'imageUrl': imageUrl,
        'isActive': isActive,
        if (title != null) 'title': title,
        if (link != null) 'link': link,
        if (placement != null) 'placement': placement,
        if (sortOrder != null) 'sortOrder': sortOrder,
        if (description != null) 'description': description,
      },
    );
    return ControlBanner.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlBanner> updateBanner(
    String id, {
    String? title,
    String? imageUrl,
    String? link,
    String? placement,
    bool? isActive,
    int? sortOrder,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.banner(id),
      data: {
        if (title != null) 'title': title,
        if (imageUrl != null) 'imageUrl': imageUrl,
        if (link != null) 'link': link,
        if (placement != null) 'placement': placement,
        if (isActive != null) 'isActive': isActive,
        if (sortOrder != null) 'sortOrder': sortOrder,
      },
    );
    return ControlBanner.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteBanner(String id) async {
    await _dio.delete<dynamic>(ApiPaths.banner(id));
  }
}

final promotionsRepositoryProvider = Provider<PromotionsRepository>((ref) {
  return PromotionsRepository(ref.watch(dioProvider));
});

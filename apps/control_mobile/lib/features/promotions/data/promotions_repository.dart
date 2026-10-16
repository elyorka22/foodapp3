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

  /// `GET /promo-codes`
  Future<List<ControlPromoCode>> fetchPromoCodes() async {
    final res = await _dio.get<dynamic>(ApiPaths.promoCodes);
    return parseObjectList(res.data).map(ControlPromoCode.fromJson).toList();
  }

  /// `GET /banners/admin`
  Future<List<ControlBanner>> fetchBannersAdmin() async {
    final res = await _dio.get<dynamic>(ApiPaths.bannersAdmin);
    return parseObjectList(res.data).map(ControlBanner.fromJson).toList();
  }
}

final promotionsRepositoryProvider = Provider<PromotionsRepository>((ref) {
  return PromotionsRepository(ref.watch(dioProvider));
});

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';
import '../../../shared/models/order_model.dart';

final couriersRepositoryProvider = Provider<CouriersRepository>((ref) {
  return CouriersRepository(ref.watch(dioProvider));
});

class CouriersRepository {
  CouriersRepository(this._dio);

  final Dio _dio;

  Future<List<CourierListItemModel>> fetchCouriers() async {
    final res = await _dio.get<dynamic>(ApiPaths.couriers);
    return parseListResponse(res.data)
        .map(CourierListItemModel.fromJson)
        .toList();
  }
}

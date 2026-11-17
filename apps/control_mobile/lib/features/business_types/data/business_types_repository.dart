import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/utils/json_parse.dart';

class ControlBusinessType {
  const ControlBusinessType({
    required this.id,
    required this.name,
    required this.isActive,
    this.slug,
    this.description,
    this.catalogMode,
    this.menuMode,
    this.homeGridRow = 1,
    this.sortOrder = 0,
  });

  final String id;
  final String name;
  final bool isActive;
  final String? slug;
  final String? description;
  final String? catalogMode;
  /// `GLOBAL_DISH` | `OWN_CATEGORIES` | `SHARED_CATALOG`
  final String? menuMode;
  /// 1 = top home carousel, 2 = bottom home row
  final int homeGridRow;
  final int sortOrder;

  bool get isStoreVertical =>
      menuMode == 'OWN_CATEGORIES' || menuMode == 'SHARED_CATALOG';

  String get verticalHint {
    final row = homeGridRow == 2 ? '2-qator' : '1-qator';
    switch (menuMode) {
      case 'SHARED_CATALOG':
        return 'Umumiy katalog · $row';
      case 'OWN_CATEGORIES':
        return 'Individual katalog · $row';
      case 'GLOBAL_DISH':
        return 'Restoran · $row';
      default:
        return '${isStoreVertical ? "Do'kon" : 'Restoran'} · $row';
    }
  }

  factory ControlBusinessType.fromJson(Map<String, dynamic> json) {
    final row = (json['homeGridRow'] as num?)?.toInt() ?? 1;
    return ControlBusinessType(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      catalogMode: json['catalogMode'] as String?,
      menuMode: json['menuMode'] as String?,
      homeGridRow: row == 2 ? 2 : 1,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }
}

class BusinessTypesRepository {
  BusinessTypesRepository(this._dio);
  final Dio _dio;

  Future<List<ControlBusinessType>> fetchTypes() async {
    final res = await _dio.get<dynamic>(ApiPaths.businessTypesAdmin);
    return parseObjectList(res.data)
        .map(ControlBusinessType.fromJson)
        .toList();
  }

  Future<ControlBusinessType> createType({
    required String name,
    required String menuMode,
    bool isActive = true,
    int homeGridRow = 1,
    String catalogMode = 'CATALOG',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.businessTypes,
      data: {
        'name': name,
        'isActive': isActive,
        'catalogMode': catalogMode,
        'menuMode': menuMode,
        'homeGridRow': homeGridRow == 2 ? 2 : 1,
      },
    );
    return ControlBusinessType.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlBusinessType> updateType(
    String id, {
    String? name,
    bool? isActive,
    String? menuMode,
    int? homeGridRow,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.businessType(id),
      data: {
        if (name != null) 'name': name,
        if (isActive != null) 'isActive': isActive,
        if (menuMode != null) 'menuMode': menuMode,
        if (homeGridRow != null) 'homeGridRow': homeGridRow == 2 ? 2 : 1,
      },
    );
    return ControlBusinessType.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> deleteType(String id) async {
    await _dio.delete<dynamic>(ApiPaths.businessType(id));
  }
}

final businessTypesRepositoryProvider =
    Provider<BusinessTypesRepository>((ref) {
  return BusinessTypesRepository(ref.watch(dioProvider));
});

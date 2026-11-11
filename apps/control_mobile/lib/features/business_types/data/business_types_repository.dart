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
  final int sortOrder;

  bool get isStoreVertical =>
      menuMode == 'OWN_CATEGORIES' || menuMode == 'SHARED_CATALOG';

  String get verticalHint {
    switch (menuMode) {
      case 'SHARED_CATALOG':
        return 'Umumiy katalog';
      case 'OWN_CATEGORIES':
        return 'Individual katalog';
      case 'GLOBAL_DISH':
        return 'Restoran';
      default:
        return isStoreVertical ? "Do'kon" : 'Restoran';
    }
  }

  factory ControlBusinessType.fromJson(Map<String, dynamic> json) {
    return ControlBusinessType(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      catalogMode: json['catalogMode'] as String?,
      menuMode: json['menuMode'] as String?,
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
    String catalogMode = 'CATALOG',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiPaths.businessTypes,
      data: {
        'name': name,
        'isActive': isActive,
        'catalogMode': catalogMode,
        'menuMode': menuMode,
      },
    );
    return ControlBusinessType.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<ControlBusinessType> updateType(
    String id, {
    String? name,
    bool? isActive,
    String? menuMode,
  }) async {
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiPaths.businessType(id),
      data: {
        if (name != null) 'name': name,
        if (isActive != null) 'isActive': isActive,
        if (menuMode != null) 'menuMode': menuMode,
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

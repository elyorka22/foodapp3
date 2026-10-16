class PaginationMeta {
  const PaginationMeta({
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  final int total;
  final int page;
  final int limit;
  final int totalPages;

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 20,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? 1,
    );
  }
}

class PaginatedResponse<T> {
  const PaginatedResponse({
    required this.data,
    required this.meta,
  });

  final List<T> data;
  final PaginationMeta meta;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final rawList = json['data'];
    final items = rawList is List
        ? rawList
            .whereType<Map<String, dynamic>>()
            .map(fromJson)
            .toList()
        : <T>[];
    final metaRaw = json['meta'];
    final meta = metaRaw is Map<String, dynamic>
        ? PaginationMeta.fromJson(metaRaw)
        : PaginationMeta(
            total: items.length,
            page: 1,
            limit: items.length,
            totalPages: 1,
          );
    return PaginatedResponse(data: items, meta: meta);
  }
}

/// Backend may return a plain array (e.g. GET /users) or `{ data, meta }`.
PaginatedResponse<T> paginatedFromFlexibleJson<T>(
  dynamic json,
  T Function(Map<String, dynamic>) fromJson,
) {
  if (json is List) {
    final items =
        json.whereType<Map<String, dynamic>>().map(fromJson).toList();
    return PaginatedResponse(
      data: items,
      meta: PaginationMeta(
        total: items.length,
        page: 1,
        limit: items.isNotEmpty ? items.length : 20,
        totalPages: 1,
      ),
    );
  }
  if (json is Map<String, dynamic>) {
    return PaginatedResponse.fromJson(json, fromJson);
  }
  return PaginatedResponse(
    data: const [],
    meta: const PaginationMeta(total: 0, page: 1, limit: 20, totalPages: 0),
  );
}

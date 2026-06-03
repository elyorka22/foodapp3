class PaginatedResponse<T> {
  const PaginatedResponse({required this.data, this.total, this.page, this.totalPages});

  final List<T> data;
  final int? total;
  final int? page;
  final int? totalPages;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) itemFromJson,
  ) {
    final raw = json['data'];
    final list = raw is List
        ? raw
            .whereType<Map>()
            .map((e) => itemFromJson(Map<String, dynamic>.from(e)))
            .toList()
        : <T>[];

    final meta = json['meta'];
    int? total;
    int? page;
    int? totalPages;
    if (meta is Map<String, dynamic>) {
      total = _asInt(meta['total']);
      page = _asInt(meta['page']);
      totalPages = _asInt(meta['totalPages']);
    }

    return PaginatedResponse(
      data: list,
      total: total,
      page: page,
      totalPages: totalPages,
    );
  }
}

int? _asInt(Object? v) {
  if (v is int) return v;
  if (v is num) return v.toInt();
  return null;
}

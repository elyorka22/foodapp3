import '../../../core/utils/json_parse.dart';

/// Admin business row from `GET /restaurants/admin`.
class ControlRestaurant {
  const ControlRestaurant({
    required this.id,
    required this.name,
    required this.slug,
    required this.isActive,
    this.approvalStatus = 'PENDING',
    this.description,
    this.logoUrl,
    this.coverUrl,
    this.phone,
    this.commissionRate = 0,
    this.ordersCount = 0,
    this.revenue = 0,
    this.productsCount = 0,
    this.branchAddress,
    this.cityId,
    this.cityName,
    this.businessTypeId,
    this.businessTypeName,
    this.latitude,
    this.longitude,
    this.createdAt,
  });

  final String id;
  final String name;
  final String slug;
  final bool isActive;
  final String approvalStatus;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final String? phone;
  final num commissionRate;
  final int ordersCount;
  final num revenue;
  final int productsCount;
  final String? branchAddress;
  final String? cityId;
  final String? cityName;
  final String? businessTypeId;
  final String? businessTypeName;
  final double? latitude;
  final double? longitude;
  final DateTime? createdAt;

  factory ControlRestaurant.fromJson(Map<String, dynamic> json) {
    final city = json['city'] as Map<String, dynamic>?;
    final businessType = json['businessType'] as Map<String, dynamic>?;
    return ControlRestaurant(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? false,
      approvalStatus: json['approvalStatus'] as String? ?? 'PENDING',
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      phone: json['phone'] as String?,
      commissionRate: parseNum(json['commissionRate']),
      ordersCount: (json['ordersCount'] as num?)?.toInt() ?? 0,
      revenue: parseNum(json['revenue']),
      productsCount: (json['productsCount'] as num?)?.toInt() ?? 0,
      branchAddress: json['branchAddress'] as String?,
      cityId: json['cityId'] as String? ?? city?['id'] as String?,
      cityName: city?['name'] as String?,
      businessTypeId:
          json['businessTypeId'] as String? ?? businessType?['id'] as String?,
      businessTypeName: businessType?['name'] as String?,
      latitude: parseDouble(json['latitude']),
      longitude: parseDouble(json['longitude']),
      createdAt: parseDateTime(json['createdAt']),
    );
  }
}

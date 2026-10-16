import '../../../core/utils/json_parse.dart';

class StaffUser {
  const StaffUser({
    required this.id,
    required this.role,
    required this.isActive,
    this.email,
    this.phone,
    this.fullName,
    this.createdAt,
    this.businessId,
    this.businessName,
  });

  final String id;
  final String role;
  final bool isActive;
  final String? email;
  final String? phone;
  final String? fullName;
  final DateTime? createdAt;
  final String? businessId;
  final String? businessName;

  factory StaffUser.fromJson(Map<String, dynamic> json) {
    final business = json['business'] as Map<String, dynamic>?;
    final restaurant = json['restaurant'] as Map<String, dynamic>?;
    final merchant = business ?? restaurant;

    return StaffUser(
      id: json['id'] as String? ?? '',
      role: json['role'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      fullName: json['fullName'] as String?,
      createdAt: parseDateTime(json['createdAt']),
      businessId: merchant?['id'] as String?,
      businessName: merchant?['name'] as String?,
    );
  }
}

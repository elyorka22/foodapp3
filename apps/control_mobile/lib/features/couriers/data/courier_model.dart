class ControlCourier {
  const ControlCourier({
    required this.id,
    required this.isActive,
    this.isOnline = false,
    this.fullName,
    this.phone,
    this.email,
    this.vehicleType,
    this.userId,
  });

  final String id;
  final bool isActive;
  final bool isOnline;
  final String? fullName;
  final String? phone;
  final String? email;
  final String? vehicleType;
  final String? userId;

  String get displayName {
    if (fullName != null && fullName!.isNotEmpty) return fullName!;
    if (phone != null && phone!.isNotEmpty) return phone!;
    return id;
  }

  factory ControlCourier.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    return ControlCourier(
      id: json['id'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      isOnline: json['isOnline'] as bool? ?? false,
      fullName: json['fullName'] as String? ?? user?['fullName'] as String?,
      phone: json['phone'] as String? ?? user?['phone'] as String?,
      email: json['email'] as String? ?? user?['email'] as String?,
      vehicleType: json['vehicleType'] as String?,
      userId: user?['id'] as String? ?? json['userId'] as String?,
    );
  }
}

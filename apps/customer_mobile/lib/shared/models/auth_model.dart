class CustomerUserModel {
  const CustomerUserModel({
    required this.id,
    required this.fullName,
    required this.isActive,
    required this.needsPhone,
    this.phone,
    this.email,
    this.defaultDeliveryAddress,
  });

  final String id;
  final String fullName;
  final bool isActive;
  final bool needsPhone;
  final String? phone;
  final String? email;
  final String? defaultDeliveryAddress;

  factory CustomerUserModel.fromJson(Map<String, dynamic> json) {
    return CustomerUserModel(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      isActive: json['isActive'] as bool? ?? true,
      needsPhone: json['needsPhone'] as bool? ?? false,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      defaultDeliveryAddress: json['defaultDeliveryAddress'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'isActive': isActive,
        'needsPhone': needsPhone,
        'phone': phone,
        'email': email,
        'defaultDeliveryAddress': defaultDeliveryAddress,
      };
}

class AuthResponseModel {
  const AuthResponseModel({
    required this.accessToken,
    required this.user,
  });

  final String accessToken;
  final CustomerUserModel user;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      accessToken: json['accessToken'] as String,
      user: CustomerUserModel.fromJson(
        Map<String, dynamic>.from(json['user'] as Map),
      ),
    );
  }
}

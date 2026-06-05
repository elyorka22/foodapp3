import 'dart:convert';

class AuthUserModel {
  const AuthUserModel({
    required this.id,
    required this.fullName,
    this.phone,
    this.email,
    required this.role,
  });

  final String id;
  final String fullName;
  final String? phone;
  final String? email;
  final String role;

  factory AuthUserModel.fromJson(Map<String, dynamic> json) {
    return AuthUserModel(
      id: json['id'] as String,
      fullName: json['fullName'] as String? ?? '',
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String? ?? 'COURIER',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'role': role,
      };
}

class AuthResponseModel {
  const AuthResponseModel({
    required this.accessToken,
    required this.user,
  });

  final String accessToken;
  final AuthUserModel user;

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      accessToken: json['accessToken'] as String,
      user: AuthUserModel.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

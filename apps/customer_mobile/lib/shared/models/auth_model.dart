class CustomerUserModel {
  const CustomerUserModel({
    required this.id,
    required this.fullName,
    required this.isActive,
    required this.isTelegramVerified,
    required this.needsPhone,
    this.phone,
    this.email,
    this.telegramId,
    this.telegramUsername,
    this.defaultDeliveryAddress,
  });

  final String id;
  final String fullName;
  final bool isActive;
  final bool isTelegramVerified;
  final bool needsPhone;
  final String? phone;
  final String? email;
  final String? telegramId;
  final String? telegramUsername;
  final String? defaultDeliveryAddress;

  factory CustomerUserModel.fromJson(Map<String, dynamic> json) {
    return CustomerUserModel(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      isActive: json['isActive'] as bool? ?? true,
      isTelegramVerified: json['isTelegramVerified'] as bool? ?? false,
      needsPhone: json['needsPhone'] as bool? ?? false,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      telegramId: json['telegramId']?.toString(),
      telegramUsername: json['telegramUsername'] as String?,
      defaultDeliveryAddress: json['defaultDeliveryAddress'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'isActive': isActive,
        'isTelegramVerified': isTelegramVerified,
        'needsPhone': needsPhone,
        'phone': phone,
        'email': email,
        'telegramId': telegramId,
        'telegramUsername': telegramUsername,
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

class TelegramAuthPayload {
  const TelegramAuthPayload({
    required this.id,
    required this.firstName,
    required this.authDate,
    required this.hash,
    this.lastName,
    this.username,
    this.photoUrl,
  });

  final int id;
  final String firstName;
  final int authDate;
  final String hash;
  final String? lastName;
  final String? username;
  final String? photoUrl;

  Map<String, dynamic> toJson() => {
        'id': id,
        'first_name': firstName,
        'auth_date': authDate,
        'hash': hash,
        if (lastName != null) 'last_name': lastName,
        if (username != null) 'username': username,
        if (photoUrl != null) 'photo_url': photoUrl,
      };
}

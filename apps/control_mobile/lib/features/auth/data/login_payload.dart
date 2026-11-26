import '../../../core/config/app_config.dart';
import '../../../core/utils/phone_util.dart';

/// Login body for Nest LoginDto: email OR phone, plus password and client.
Map<String, dynamic> buildControlLoginPayload(String loginId, String password) {
  final id = loginId.trim();
  final client = AppConfig.clientId;
  if (id.contains('@')) {
    return {
      'email': id.toLowerCase(),
      'password': password,
      'client': client,
    };
  }
  return {
    'phone': normalizePhone(id),
    'password': password,
    'client': client,
  };
}

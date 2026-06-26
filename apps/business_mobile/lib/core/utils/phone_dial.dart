import 'package:url_launcher/url_launcher.dart';

/// Opens the device dialer with the given phone number prefilled.
Future<bool> launchPhoneCall(String phone) async {
  final trimmed = phone.trim();
  if (trimmed.isEmpty) return false;

  final dial = trimmed.replaceAll(RegExp(r'[\s\-()]'), '');
  final uri = Uri(scheme: 'tel', path: dial);
  if (!await canLaunchUrl(uri)) return false;
  return launchUrl(uri);
}

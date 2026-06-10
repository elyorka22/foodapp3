import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens Google Maps or Yandex Maps for navigation to a destination.
Future<void> showMapPicker(BuildContext context, double lat, double lng) async {
  await showModalBottomSheet<void>(
    context: context,
    builder: (ctx) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.map_outlined),
            title: const Text('Google Maps'),
            onTap: () {
              Navigator.pop(ctx);
              _openGoogleMaps(lat, lng);
            },
          ),
          ListTile(
            leading: const Icon(Icons.navigation_outlined),
            title: const Text('Yandex Maps'),
            onTap: () {
              Navigator.pop(ctx);
              _openYandexMaps(lat, lng);
            },
          ),
        ],
      ),
    ),
  );
}

Future<void> _openGoogleMaps(double lat, double lng) async {
  final uri = Uri.parse(
    'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving',
  );
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

Future<void> _openYandexMaps(double lat, double lng) async {
  final appUri = Uri.parse('yandexmaps://maps.yandex.ru/?pt=$lng,$lat&z=16&l=map');
  if (await canLaunchUrl(appUri)) {
    await launchUrl(appUri, mode: LaunchMode.externalApplication);
    return;
  }
  final webUri = Uri.parse('https://yandex.com/maps/?pt=$lng,$lat&z=16&l=map');
  if (await canLaunchUrl(webUri)) {
    await launchUrl(webUri, mode: LaunchMode.externalApplication);
  }
}

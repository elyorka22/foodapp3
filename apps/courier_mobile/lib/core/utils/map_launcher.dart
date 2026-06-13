import 'dart:io';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens external map apps for turn-by-turn navigation (free — no SDK/API key).
Future<void> showMapPicker(
  BuildContext context,
  double lat,
  double lng, {
  String? label,
}) async {
  await showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (ctx) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
            child: Text(
              label ?? 'Navigatsiya',
              style: Theme.of(ctx).textTheme.titleMedium,
            ),
          ),
          ListTile(
            leading: const Icon(Icons.map_outlined),
            title: const Text('Google Maps'),
            subtitle: const Text('Yo\'l-yo\'riq bilan ochish'),
            onTap: () async {
              Navigator.pop(ctx);
              final ok = await openGoogleNavigation(lat, lng);
              if (!ok && context.mounted) {
                _showLaunchError(context);
              }
            },
          ),
          ListTile(
            leading: const Icon(Icons.navigation_outlined),
            title: const Text('Yandex Navigator'),
            subtitle: const Text('Yo\'l-yo\'riq bilan ochish'),
            onTap: () async {
              Navigator.pop(ctx);
              final ok = await openYandexNavigation(lat, lng);
              if (!ok && context.mounted) {
                _showLaunchError(context);
              }
            },
          ),
          const SizedBox(height: 8),
        ],
      ),
    ),
  );
}

Future<bool> openGoogleNavigation(double lat, double lng) async {
  final candidates = <Uri>[
    if (Platform.isAndroid) Uri.parse('google.navigation:q=$lat,$lng&mode=d'),
    Uri.parse('geo:$lat,$lng?q=$lat,$lng'),
    Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving',
    ),
  ];

  for (final uri in candidates) {
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (launched) return true;
    } catch (_) {}
  }
  return false;
}

Future<bool> openYandexNavigation(double lat, double lng) async {
  final candidates = <Uri>[
    Uri.parse('yandexnavi://build_route_on_map?lat_to=$lat&lon_to=$lng'),
    Uri.parse('yandexmaps://maps.yandex.ru/?rtext=~$lat,$lng&rtt=auto'),
    Uri.parse('https://yandex.com/maps/?rtext=~$lat,$lng&rtt=auto'),
  ];

  for (final uri in candidates) {
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (launched) return true;
    } catch (_) {}
  }
  return false;
}

void _showLaunchError(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text('Xarita ilovasini ochib bo\'lmadi. Google yoki Yandex Maps o\'rnating.'),
    ),
  );
}

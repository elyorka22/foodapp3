import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app.dart';
import 'core/config/app_config.dart';
import 'core/l10n/app_strings.dart';
import 'core/push/firebase_bootstrap.dart';
import 'core/storage/storage_providers.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_typography.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Never throw before runApp — that leaves the native Flutter splash forever.
  final configError = AppConfig.configError();
  if (configError != null) {
    runApp(_BootErrorApp(message: configError));
    return;
  }

  // Only registers the FCM background handler (sync). Full Firebase init
  // runs after the first frame in PushBootstrap — never block the splash.
  try {
    await bootstrapFirebase();
  } catch (e, st) {
    debugPrint('[BOOT] Firebase bootstrap skipped: $e\n$st');
  }

  // shared_preferences can crash/hang on some Android builds.
  // Session auth uses secure storage; prefs are optional.
  SharedPreferences? prefs;
  try {
    prefs = await SharedPreferences.getInstance()
        .timeout(const Duration(seconds: 3));
  } catch (e, st) {
    debugPrint('[BOOT] SharedPreferences unavailable: $e\n$st');
    prefs = null;
  }

  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: const BusinessApp(),
    ),
  );
}

/// Shown instead of hanging on the Flutter logo when boot config fails.
class _BootErrorApp extends StatelessWidget {
  const _BootErrorApp({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(AppStrings.appName, style: AppTypography.display),
                const SizedBox(height: 16),
                Text(
                  'Ilova ishga tushmadi',
                  style: AppTypography.subtitle,
                ),
                const SizedBox(height: 12),
                Text(message, style: AppTypography.bodySmall),
                const SizedBox(height: 24),
                Text(
                  'Release APK must be built with:\n'
                  '--dart-define=API_BASE_URL=https://foodapp.uz/api/v1',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

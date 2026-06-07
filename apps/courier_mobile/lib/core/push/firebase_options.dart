import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Firebase config for courier app (must match android/app/google-services.json).
abstract final class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Firebase is not configured for web.');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'Firebase is not configured for $defaultTargetPlatform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBWoHjbK9vAsKdL8l0HAVj0aI3S730kJR8',
    appId: '1:278845357182:android:cd35f6cd2043d7000cac2f',
    messagingSenderId: '278845357182',
    projectId: 'foodapp-17385',
    storageBucket: 'foodapp-17385.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBWoHjbK9vAsKdL8l0HAVj0aI3S730kJR8',
    appId: '1:278845357182:android:cd35f6cd2043d7000cac2f',
    messagingSenderId: '278845357182',
    projectId: 'foodapp-17385',
    storageBucket: 'foodapp-17385.firebasestorage.app',
    iosBundleId: 'com.foodapp.courier',
  );
}

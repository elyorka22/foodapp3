import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/config/app_config.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/push/firebase_bootstrap.dart';

final googleAuthServiceProvider = Provider<GoogleAuthService>((ref) {
  return GoogleAuthService();
});

/// User closed the Google account picker without signing in.
class GoogleAuthCancelledException implements Exception {}

/// Firebase / Google Cloud project is missing the APK signing certificate (SHA-1).
class GoogleAuthConfigException implements Exception {
  GoogleAuthConfigException([this.message = AppStrings.googleSignInConfigError]);

  final String message;

  @override
  String toString() => message;
}

class GoogleAuthService {
  GoogleAuthService({GoogleSignIn? googleSignIn})
      : _googleSignIn = googleSignIn ??
            GoogleSignIn(
              serverClientId: AppConfig.googleWebClientId.isEmpty
                  ? null
                  : AppConfig.googleWebClientId,
            );

  final GoogleSignIn _googleSignIn;

  Future<String> signInAndGetIdToken() async {
    if (!isFirebaseReady) {
      throw GoogleAuthConfigException(AppStrings.googleSignInFirebaseNotReady);
    }

    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw GoogleAuthCancelledException();
      }

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCred =
          await FirebaseAuth.instance.signInWithCredential(credential);
      final token = await userCred.user?.getIdToken(true);
      if (token == null || token.isEmpty) {
        throw Exception('Failed to obtain Firebase ID token');
      }
      return token;
    } on GoogleAuthCancelledException {
      rethrow;
    } on GoogleAuthConfigException {
      rethrow;
    } on PlatformException catch (e) {
      if (_isDeveloperConfigError(e)) {
        throw GoogleAuthConfigException();
      }
      throw GoogleAuthConfigException(AppStrings.googleSignInFailed);
    }
  }

  bool _isDeveloperConfigError(PlatformException e) {
    if (e.code == 'sign_in_failed' && (e.message ?? '').contains(': 10')) {
      return true;
    }
    return e.message?.contains('ApiException: 10') == true ||
        e.message?.contains('DEVELOPER_ERROR') == true;
  }
}

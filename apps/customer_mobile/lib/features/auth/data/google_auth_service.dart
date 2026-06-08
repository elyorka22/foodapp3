import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/config/app_config.dart';
import '../../../core/push/firebase_bootstrap.dart';

final googleAuthServiceProvider = Provider<GoogleAuthService>((ref) {
  return GoogleAuthService();
});

/// User closed the Google account picker without signing in.
class GoogleAuthCancelledException implements Exception {}

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
      throw StateError('Firebase is not initialized');
    }

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
  }
}

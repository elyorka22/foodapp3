import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/auth_model.dart';
import '../data/auth_repository.dart';

final authStateProvider =
    AsyncNotifierProvider<AuthNotifier, AuthUserModel?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<AuthUserModel?> {
  @override
  Future<AuthUserModel?> build() async {
    try {
      return await ref
          .read(authRepositoryProvider)
          .currentUser()
          .timeout(const Duration(seconds: 6));
    } catch (_) {
      // Corrupt / hung secure storage must not leave the app on splash forever.
      return null;
    }
  }

  Future<void> login(String loginId, String password) async {
    // Do not set AsyncLoading here: that would flip isLoading and historically
    // bounced the UI off the login screen before the error could be shown.
    // LoginScreen already shows its own submitting indicator.
    state = await AsyncValue.guard(() async {
      final res = await ref.read(authRepositoryProvider).login(
            loginId: loginId,
            password: password,
          );
      return res.user;
    });
    if (state.hasError) {
      throw state.error!;
    }
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
  }
}

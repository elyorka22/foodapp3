import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/push/device_registration_service.dart';
import '../../../shared/models/auth_model.dart';
import '../data/auth_repository.dart';

final authStateProvider =
    AsyncNotifierProvider<AuthNotifier, AuthUserModel?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<AuthUserModel?> {
  @override
  Future<AuthUserModel?> build() async {
    return ref.read(authRepositoryProvider).currentUser();
  }

  Future<void> login(String loginId, String password) async {
    state = const AsyncLoading();
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
    await ref.read(deviceRegistrationServiceProvider).registerAfterAuth();
  }

  Future<void> logout() async {
    await ref.read(deviceRegistrationServiceProvider).unregisterOnLogout();
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
  }
}

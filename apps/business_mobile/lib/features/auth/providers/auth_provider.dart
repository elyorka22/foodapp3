import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/auth_model.dart';
import '../data/auth_repository.dart';

final authStateProvider =
    AsyncNotifierProvider<AuthNotifier, AuthUserModel?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<AuthUserModel?> {
  @override
  Future<AuthUserModel?> build() async {
    return ref.read(authRepositoryProvider).currentUser();
  }

  Future<void> login(String phone, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res = await ref.read(authRepositoryProvider).login(
            phone: phone,
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

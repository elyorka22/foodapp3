import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/auth_model.dart';
import '../data/auth_repository.dart';

final authStateProvider =
    AsyncNotifierProvider<AuthNotifier, CustomerUserModel?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<CustomerUserModel?> {
  @override
  Future<CustomerUserModel?> build() async {
    return ref.read(authRepositoryProvider).currentUser();
  }

  Future<void> loginPhone(String phone, String? password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res = await ref
          .read(authRepositoryProvider)
          .loginPhone(phone: phone, password: password);
      return res.user;
    });
  }

  Future<void> register({
    required String phone,
    required String fullName,
    String? password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res = await ref.read(authRepositoryProvider).register(
            phone: phone,
            fullName: fullName,
            password: password,
          );
      return res.user;
    });
  }

  Future<CustomerUserModel?> loginGoogle() async {
    final previousUser = state.valueOrNull;
    state = const AsyncLoading();
    try {
      final res = await ref.read(authRepositoryProvider).loginGoogle();
      state = AsyncData(res.user);
      return res.user;
    } catch (error, stackTrace) {
      state = AsyncData(previousUser);
      Error.throwWithStackTrace(error, stackTrace);
    }
  }

  Future<CustomerUserModel?> loginTelegram(TelegramAuthPayload payload) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res =
          await ref.read(authRepositoryProvider).loginTelegram(payload);
      return res.user;
    });
    return state.valueOrNull;
  }

  Future<void> completeProfile(String phone) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res = await ref.read(authRepositoryProvider).completeProfile(phone: phone);
      return res.user;
    });
  }

  bool get needsPhoneCompletion =>
      state.valueOrNull?.needsPhone == true;

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(authRepositoryProvider).fetchMe(),
    );
  }
}

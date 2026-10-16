/// In-memory only. Never persisted. Used so Diagnostics can retry login
/// with values currently typed on the login form.
abstract final class LoginDraft {
  static String loginId = '';
  static String password = '';

  static void update({required String loginId, required String password}) {
    LoginDraft.loginId = loginId;
    LoginDraft.password = password;
  }

  static void clearSecrets() {
    password = '';
  }

  static bool get hasCredentials =>
      loginId.trim().isNotEmpty && password.length >= 6;
}

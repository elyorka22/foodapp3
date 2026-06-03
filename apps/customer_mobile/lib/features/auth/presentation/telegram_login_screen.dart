import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/config/app_config.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/auth_model.dart';
import '../providers/auth_provider.dart';

/// Production Telegram Login via WebView widget (same HMAC contract as web).
class TelegramLoginScreen extends ConsumerStatefulWidget {
  const TelegramLoginScreen({super.key});

  @override
  ConsumerState<TelegramLoginScreen> createState() => _TelegramLoginScreenState();
}

class _TelegramLoginScreenState extends ConsumerState<TelegramLoginScreen> {
  late final WebViewController _controller;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    final bot = AppConfig.telegramBotUsername.trim();
    if (bot.isEmpty) {
      _error = 'TELEGRAM_BOT_USERNAME sozlanmagan (--dart-define)';
      _loading = false;
      return;
    }

    final html = _buildWidgetHtml(bot);
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'FoodAppTelegram',
        onMessageReceived: (msg) => _onTelegramPayload(msg.message),
      )
      ..setNavigationDelegate(
        NavigationDelegate(onPageFinished: (_) {
          if (mounted) setState(() => _loading = false);
        }),
      )
      ..loadHtmlString(html);

    _loading = true;
  }

  String _buildWidgetHtml(String botUsername) {
    return '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f7f8fa; font-family: sans-serif; }
  </style>
  <script>
    function onTelegramAuth(user) {
      FoodAppTelegram.postMessage(JSON.stringify(user));
    }
  </script>
</head>
<body>
  <script async src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="$botUsername"
    data-size="large"
    data-onauth="onTelegramAuth(user)"
    data-request-access="write"></script>
</body>
</html>
''';
  }

  Future<void> _onTelegramPayload(String jsonStr) async {
    try {
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      final payload = TelegramAuthPayload(
        id: (map['id'] as num).toInt(),
        firstName: map['first_name'] as String,
        authDate: (map['auth_date'] as num).toInt(),
        hash: map['hash'] as String,
        lastName: map['last_name'] as String?,
        username: map['username'] as String?,
        photoUrl: map['photo_url'] as String?,
      );
      final user = await ref.read(authStateProvider.notifier).loginTelegram(payload);
      if (!mounted) return;
      if (user?.needsPhone == true) {
        context.go(AppRoutes.completeProfile);
      } else {
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${AppStrings.errorGeneric}: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppStrings.telegramLogin)),
      body: _error != null
          ? Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Text(_error!, style: AppTypography.body),
            )
          : Stack(
              children: [
                WebViewWidget(controller: _controller),
                if (_loading) const Center(child: CircularProgressIndicator()),
              ],
            ),
    );
  }
}

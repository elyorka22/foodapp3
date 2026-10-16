import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';

class TelegramBotSettings {
  const TelegramBotSettings({
    this.welcomeMessage = '',
    this.siteUrl = '',
  });

  final String welcomeMessage;
  final String siteUrl;

  factory TelegramBotSettings.fromJson(Map<String, dynamic> json) {
    final settings = json['settings'] as Map<String, dynamic>? ?? json;
    return TelegramBotSettings(
      welcomeMessage: settings['welcomeMessage'] as String? ??
          settings['welcome_message'] as String? ??
          '',
      siteUrl: settings['siteUrl'] as String? ??
          settings['site_url'] as String? ??
          '',
    );
  }
}

class TelegramRepository {
  TelegramRepository(this._dio);
  final Dio _dio;

  Future<TelegramBotSettings> fetchAdmin() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiPaths.telegramBotAdmin);
    return TelegramBotSettings.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<TelegramBotSettings> updateAdmin({
    String? welcomeMessage,
    String? siteUrl,
  }) async {
    final res = await _dio.put<Map<String, dynamic>>(
      ApiPaths.telegramBotAdmin,
      data: {
        if (welcomeMessage != null) 'welcomeMessage': welcomeMessage,
        if (siteUrl != null) 'siteUrl': siteUrl,
      },
    );
    return TelegramBotSettings.fromJson(res.data ?? <String, dynamic>{});
  }

  Future<void> registerWebhook() async {
    await _dio.post<dynamic>(ApiPaths.telegramBotRegisterWebhook);
  }
}

final telegramRepositoryProvider = Provider<TelegramRepository>((ref) {
  return TelegramRepository(ref.watch(dioProvider));
});

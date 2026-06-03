import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_config.dart';
import '../../../core/constants/api_paths.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/startup_diagnostics.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';

/// Temporary screen to debug production API connectivity on device.
class NetworkHealthScreen extends ConsumerStatefulWidget {
  const NetworkHealthScreen({super.key});

  @override
  ConsumerState<NetworkHealthScreen> createState() => _NetworkHealthScreenState();
}

class _NetworkHealthScreenState extends ConsumerState<NetworkHealthScreen> {
  bool _running = false;
  final List<_HealthProbeResult> _results = [];

  Future<void> _runProbes() async {
    setState(() {
      _running = true;
      _results.clear();
    });

    final dio = ref.read(dioProvider);
    await _probe(dio, label: 'GET /restaurants', path: ApiPaths.restaurants, query: {'limit': 1});
    await _probe(dio, label: 'GET /banners', path: ApiPaths.banners);

    if (mounted) setState(() => _running = false);
  }

  Future<void> _probe(
    Dio dio, {
    required String label,
    required String path,
    Map<String, dynamic>? query,
  }) async {
    final expectedUrl = AppConfig.resolveRequestUrl(path, queryParameters: query);
    try {
      final response = await dio.get<dynamic>(path, queryParameters: query);
      _results.add(
        _HealthProbeResult(
          label: label,
          expectedUrl: expectedUrl,
          actualUrl: response.requestOptions.uri.toString(),
          statusCode: response.statusCode,
          bodyPreview: _previewBody(response.data),
          error: null,
        ),
      );
    } on DioException catch (e) {
      _results.add(
        _HealthProbeResult(
          label: label,
          expectedUrl: expectedUrl,
          actualUrl: e.requestOptions.uri.toString(),
          statusCode: e.response?.statusCode,
          bodyPreview: _previewBody(e.response?.data),
          error: _formatDioException(e),
        ),
      );
    } catch (e, st) {
      _results.add(
        _HealthProbeResult(
          label: label,
          expectedUrl: expectedUrl,
          actualUrl: expectedUrl,
          statusCode: null,
          bodyPreview: null,
          error: '$e\n$st',
        ),
      );
    }
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final diagnostics = ref.watch(startupDiagnosticsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Network health (temp)')),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text('Startup', style: AppTypography.subtitle),
          const SizedBox(height: AppSpacing.sm),
          diagnostics.when(
            data: (d) => SelectableText(d.toString(), style: AppTypography.bodySmall),
            loading: () => const CircularProgressIndicator(),
            error: (e, _) => Text('$e', style: AppTypography.bodySmall),
          ),
          const SizedBox(height: AppSpacing.lg),
          FilledButton(
            onPressed: _running ? null : _runProbes,
            child: Text(_running ? 'Running…' : 'Run GET /restaurants & /banners'),
          ),
          const SizedBox(height: AppSpacing.lg),
          ..._results.map(_ResultCard.new),
        ],
      ),
    );
  }
}

class _HealthProbeResult {
  _HealthProbeResult({
    required this.label,
    required this.expectedUrl,
    required this.actualUrl,
    required this.statusCode,
    required this.bodyPreview,
    required this.error,
  });

  final String label;
  final String expectedUrl;
  final String actualUrl;
  final int? statusCode;
  final String? bodyPreview;
  final String? error;
}

class _ResultCard extends StatelessWidget {
  const _ResultCard(this.result);

  final _HealthProbeResult result;

  @override
  Widget build(BuildContext context) {
    final ok = result.error == null && (result.statusCode ?? 0) >= 200 && (result.statusCode ?? 0) < 300;
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${result.label} — ${ok ? 'OK' : 'FAIL'}', style: AppTypography.subtitle),
            const SizedBox(height: AppSpacing.sm),
            _row('Expected URL', result.expectedUrl),
            _row('Actual URL', result.actualUrl),
            _row('Status', '${result.statusCode ?? '—'}'),
            if (result.bodyPreview != null) _row('Body preview', result.bodyPreview!),
            if (result.error != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text('Dio / error', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.bold)),
              SelectableText(result.error!, style: AppTypography.bodySmall),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
          SelectableText(value, style: AppTypography.bodySmall),
        ],
      ),
    );
  }
}

String? _previewBody(dynamic data) {
  if (data == null) return null;
  final text = data.toString();
  if (text.length <= 500) return text;
  return '${text.substring(0, 500)}…';
}

String _formatDioException(DioException e) {
  final buffer = StringBuffer()
    ..writeln('type: ${e.type}')
    ..writeln('message: ${e.message}')
    ..writeln('error: ${e.error}');
  if (e.response != null) {
    buffer.writeln('response.statusCode: ${e.response!.statusCode}');
    buffer.writeln('response.data: ${e.response!.data}');
  }
  return buffer.toString().trim();
}

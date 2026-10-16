import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../../core/config/app_config.dart';
import '../../../core/diagnostics/diagnostic_log.dart';
import '../../../core/diagnostics/diagnostic_platform.dart';
import '../../../core/diagnostics/login_draft.dart';
import '../../../core/diagnostics/network_isolation_probe.dart';
import '../../../core/diagnostics/probe_result.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/http_adapter_stub.dart'
    if (dart.library.io) '../../../core/network/http_adapter_io.dart'
        as http_adapter;
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';

class DiagnosticsScreen extends ConsumerStatefulWidget {
  const DiagnosticsScreen({super.key});

  @override
  ConsumerState<DiagnosticsScreen> createState() => _DiagnosticsScreenState();
}

class _DiagnosticsScreenState extends ConsumerState<DiagnosticsScreen> {
  final _filterCtrl = TextEditingController();
  String _filter = '';
  bool _busy = false;
  String? _banner;
  final Map<String, ProbeResult> _lastByKind = {};

  @override
  void initState() {
    super.initState();
    DiagnosticLog.instance.addListener(_onLog);
  }

  @override
  void dispose() {
    DiagnosticLog.instance.removeListener(_onLog);
    _filterCtrl.dispose();
    super.dispose();
  }

  void _onLog() {
    if (mounted) setState(() {});
  }

  List<String> get _lines {
    final q = _filter.trim().toLowerCase();
    return DiagnosticLog.instance.events
        .map((e) => e.formattedLine)
        .where((l) => q.isEmpty || l.toLowerCase().contains(q))
        .toList()
        .reversed
        .toList();
  }

  Future<void> _copy() async {
    final text = DiagnosticLog.instance.exportText(filter: _filter);
    await Clipboard.setData(ClipboardData(text: text));
    if (!mounted) return;
    setState(() => _banner = AppStrings.diagCopied);
  }

  Future<void> _share() async {
    final text = DiagnosticLog.instance.exportText(filter: _filter);
    await Share.share(text, subject: 'FoodApp Control diagnostics');
  }

  Future<void> _runProbe(
    String label,
    Future<ProbeResult> Function() action,
  ) async {
    setState(() {
      _busy = true;
      _banner = null;
    });
    try {
      final result = await action();
      if (!mounted) return;
      setState(() {
        _lastByKind[result.probeKind] = result;
        _banner = '$label: ${result.ok ? "OK" : "FAIL"} — '
            '${AppStrings.diagProbeDone}';
      });
    } catch (e) {
      if (mounted) {
        setState(() => _banner = ApiException.formatError(e));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _probeDio() {
    return _runProbe(AppStrings.diagProbeDio, () async {
      final id = DiagnosticLog.instance.nextRequestId();
      return runDioHealthProbe(
        requestId: id,
        dioGetHealthStatus: () => ref
            .read(authRepositoryProvider)
            .probeHealthStatus(requestId: id),
      );
    });
  }

  Future<void> _probeHttpClient() {
    return _runProbe(
      AppStrings.diagProbeHttpClient,
      () => runHttpClientHealthProbe(),
    );
  }

  Future<void> _probeDnsTls() {
    return _runProbe(
      AppStrings.diagProbeDnsTls,
      () => runDnsTlsProbe(),
    );
  }

  Future<void> _retryLogin() async {
    if (!LoginDraft.hasCredentials) {
      setState(() => _banner = AppStrings.diagNeedCredentials);
      return;
    }
    setState(() {
      _busy = true;
      _banner = null;
    });
    DiagnosticLog.instance.log(
      requestId: DiagnosticLog.instance.nextRequestId(),
      stage: 'diag_retry_login',
      message: 'starting login from diagnostics (credentials not logged)',
    );
    try {
      await ref.read(authStateProvider.notifier).login(
            LoginDraft.loginId,
            LoginDraft.password,
          );
      LoginDraft.clearSecrets();
      if (mounted) {
        setState(() => _banner = AppStrings.diagLoginOk);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _banner = ApiException.formatError(e));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lines = _lines;
    final compareOrder = ['dio_health', 'http_client_health', 'dns_tls'];
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.diagTitle),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'API: ${AppConfig.normalizedApiBaseUrl}',
                  style: AppTypography.title,
                ),
                const SizedBox(height: 4),
                Text(
                  'adapter=${http_adapter.controlHttpAdapterKind} '
                  'installed=${http_adapter.controlNativeHttpAdapterInstalled} '
                  'alpnAdvertised=${http_adapter.kControlClientAlpnProtocols.join(",")} '
                  '$diagnosticPlatformSummary()',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
                const SizedBox(height: 8),
                Text(
                  AppStrings.diagDisclaimer,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
                if (_banner != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _banner!,
                    style: AppTypography.bodySmall.copyWith(color: AppColors.danger),
                  ),
                ],
                if (_lastByKind.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(AppStrings.diagCompareTitle, style: AppTypography.bodySmall),
                  const SizedBox(height: 4),
                  for (final kind in compareOrder)
                    if (_lastByKind.containsKey(kind))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: SelectableText(
                          _lastByKind[kind]!.comparisonLine,
                          style: AppTypography.caption.copyWith(
                            fontFamily: 'monospace',
                            height: 1.3,
                          ),
                        ),
                      ),
                ],
                const SizedBox(height: 12),
                TextField(
                  controller: _filterCtrl,
                  decoration: const InputDecoration(
                    labelText: AppStrings.diagSearch,
                    prefixIcon: Icon(Icons.search),
                    isDense: true,
                  ),
                  onChanged: (v) => setState(() => _filter = v),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton(
                      onPressed: _busy ? null : () => setState(() {}),
                      child: const Text(AppStrings.diagRefresh),
                    ),
                    OutlinedButton(
                      onPressed: _busy ? null : _copy,
                      child: const Text(AppStrings.diagCopy),
                    ),
                    OutlinedButton(
                      onPressed: _busy ? null : _share,
                      child: const Text(AppStrings.diagShare),
                    ),
                    OutlinedButton(
                      onPressed: _busy
                          ? null
                          : () {
                              DiagnosticLog.instance.clear();
                              setState(() {
                                _lastByKind.clear();
                                _banner = AppStrings.diagCleared;
                              });
                            },
                      child: const Text(AppStrings.diagClear),
                    ),
                    FilledButton(
                      onPressed: _busy ? null : _probeDio,
                      child: const Text(AppStrings.diagProbeDio),
                    ),
                    FilledButton(
                      onPressed: _busy ? null : _probeHttpClient,
                      child: const Text(AppStrings.diagProbeHttpClient),
                    ),
                    FilledButton(
                      onPressed: _busy ? null : _probeDnsTls,
                      child: const Text(AppStrings.diagProbeDnsTls),
                    ),
                    FilledButton.tonal(
                      onPressed: _busy ? null : _retryLogin,
                      child: const Text(AppStrings.diagRetryLogin),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: lines.isEmpty
                ? const Center(child: Text(AppStrings.diagEmpty))
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: lines.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: SelectableText(
                          lines[index],
                          style: AppTypography.caption.copyWith(
                            fontFamily: 'monospace',
                            height: 1.35,
                          ),
                        ),
                      );
                    },
                  ),
          ),
          if (_busy) const LinearProgressIndicator(minHeight: 2),
        ],
      ),
    );
  }
}

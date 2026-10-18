import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

class AsyncPageBody<T> extends StatelessWidget {
  const AsyncPageBody({
    super.key,
    required this.asyncValue,
    required this.dataBuilder,
    this.onRefresh,
    this.isEmpty,
    this.emptyMessage = 'Ma\'lumot topilmadi',
    this.padding,
  });

  final AsyncValue<T> asyncValue;
  final Widget Function(T data) dataBuilder;
  final Future<void> Function()? onRefresh;
  final bool Function(T data)? isEmpty;
  final String emptyMessage;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return asyncValue.when(
      skipLoadingOnReload: true,
      skipLoadingOnRefresh: true,
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => NetworkErrorPanel(
        message: ApiException.formatError(error),
        onRetry: onRefresh,
      ),
      data: (data) {
        if (isEmpty != null && isEmpty!(data)) {
          return _EmptyState(
            message: emptyMessage,
            onRefresh: onRefresh,
          );
        }
        final body = dataBuilder(data);
        if (onRefresh == null) {
          return padding != null
              ? Padding(padding: padding!, child: body)
              : body;
        }
        return RefreshIndicator(
          onRefresh: onRefresh!,
          child: padding != null
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: padding,
                  children: [body],
                )
              : body is ScrollView
                  ? body
                  : ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [body],
                    ),
        );
      },
    );
  }
}

/// Full-screen network/API error with retry (used by list pages).
class NetworkErrorPanel extends StatefulWidget {
  const NetworkErrorPanel({
    super.key,
    required this.message,
    this.onRetry,
  });

  final String message;
  final Future<void> Function()? onRetry;

  @override
  State<NetworkErrorPanel> createState() => _NetworkErrorPanelState();
}

class _NetworkErrorPanelState extends State<NetworkErrorPanel> {
  bool _busy = false;

  Future<void> _retry() async {
    final fn = widget.onRetry;
    if (fn == null || _busy) return;
    setState(() => _busy = true);
    try {
      await fn();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final content = Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.dangerSoft,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.wifi_off_rounded,
                  color: AppColors.danger,
                  size: 24,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                AppStrings.connectionProblem,
                textAlign: TextAlign.center,
                style: AppTypography.title,
              ),
              const SizedBox(height: 8),
              Text(
                widget.message,
                textAlign: TextAlign.center,
                style: AppTypography.bodySmall,
              ),
              if (widget.onRetry != null) ...[
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _busy ? null : _retry,
                    child: _busy
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.onPrimary,
                            ),
                          )
                        : const Text(AppStrings.retry),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  AppStrings.pullToRefreshHint,
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );

    if (widget.onRetry == null) return content;

    return RefreshIndicator(
      onRefresh: _retry,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(
            height: MediaQuery.sizeOf(context).height * 0.55,
            child: content,
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.message,
    this.onRefresh,
  });

  final String message;
  final Future<void> Function()? onRefresh;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return RefreshIndicator(
          onRefresh: onRefresh ?? () async {},
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              SizedBox(
                height: constraints.maxHeight > 0 ? constraints.maxHeight : 200,
                child: Center(
                  child: Text(
                    message,
                    style: AppTypography.body.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

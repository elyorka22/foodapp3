import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => _ErrorState(message: ApiException.formatError(error)),
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

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: AppColors.danger, size: 40),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTypography.body.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
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
                    style: AppTypography.body.copyWith(color: AppColors.textMuted),
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

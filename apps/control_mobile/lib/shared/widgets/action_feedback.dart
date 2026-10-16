import 'package:flutter/material.dart';
import '../../core/network/api_exception.dart';
import '../../core/theme/app_colors.dart';

void showActionSnackBar(
  BuildContext context,
  String message, {
  bool error = false,
}) {
  final messenger = ScaffoldMessenger.maybeOf(context);
  if (messenger == null) return;
  messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? AppColors.danger : AppColors.sidebar,
      ),
    );
}

void showActionError(BuildContext context, Object error) {
  showActionSnackBar(
    context,
    ApiException.formatError(error),
    error: true,
  );
}

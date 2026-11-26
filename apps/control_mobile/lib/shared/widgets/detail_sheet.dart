import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

/// Pins [footer] to the bottom of [showDetailSheet] while [child] scrolls.
///
/// [token] changes when the footer must refresh (loading, delete shown).
class DetailSheetFooter extends StatefulWidget {
  const DetailSheetFooter({
    super.key,
    required this.token,
    required this.footer,
    required this.child,
  });

  final Object token;
  final Widget footer;
  final Widget child;

  @override
  State<DetailSheetFooter> createState() => _DetailSheetFooterState();
}

class _DetailSheetFooterState extends State<DetailSheetFooter> {
  @override
  void initState() {
    super.initState();
    _push();
  }

  @override
  void didUpdateWidget(DetailSheetFooter oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.token != widget.token) _push();
  }

  void _push() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.findAncestorStateOfType<_DetailSheetState>()?.setFooter(
            widget.footer,
          );
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class _DetailSheet extends StatefulWidget {
  const _DetailSheet({
    required this.title,
    required this.builder,
    required this.initialChildSize,
    required this.maxChildSize,
  });

  final String title;
  final WidgetBuilder builder;
  final double initialChildSize;
  final double maxChildSize;

  @override
  State<_DetailSheet> createState() => _DetailSheetState();
}

class _DetailSheetState extends State<_DetailSheet> {
  Widget? _footer;

  void setFooter(Widget footer) {
    setState(() => _footer = footer);
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: widget.initialChildSize,
      minChildSize: 0.42,
      maxChildSize: widget.maxChildSize,
      builder: (context, scrollController) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Center(
              child: Container(
                width: 32,
                height: 3,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                4,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(widget.title, style: AppTypography.title),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.close, size: 20),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.lg,
                  AppSpacing.md,
                ),
                child: widget.builder(context),
              ),
            ),
            if (_footer != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.sm,
                  AppSpacing.lg,
                  AppSpacing.md,
                ),
                child: _footer,
              ),
          ],
        );
      },
    );
  }
}

Future<T?> showDetailSheet<T>({
  required BuildContext context,
  required String title,
  required WidgetBuilder builder,
  double initialChildSize = 0.78,
  double maxChildSize = 0.96,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: AppColors.surface,
    barrierColor: Colors.black.withOpacity(0.4),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(AppSpacing.sheetRadius),
      ),
    ),
    builder: (ctx) {
      return _DetailSheet(
        title: title,
        builder: builder,
        initialChildSize: initialChildSize,
        maxChildSize: maxChildSize,
      );
    },
  );
}

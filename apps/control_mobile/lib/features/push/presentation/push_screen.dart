import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../data/push_repository.dart';

class PushScreen extends ConsumerStatefulWidget {
  const PushScreen({super.key});

  @override
  ConsumerState<PushScreen> createState() => _PushScreenState();
}

class _PushScreenState extends ConsumerState<PushScreen> {
  final _title = TextEditingController();
  final _body = TextEditingController();
  String _audience = 'CUSTOMERS';
  bool _busy = false;

  static const _audiences = ['CUSTOMERS', 'COURIERS', 'STAFF', 'ALL'];

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final title = _title.text.trim();
    final body = _body.text.trim();
    if (title.isEmpty || body.isEmpty) {
      showActionSnackBar(context, 'Sarlavha va matn majburiy', error: true);
      return;
    }
    setState(() => _busy = true);
    try {
      await ref.read(pushRepositoryProvider).sendPush(
            audience: _audience,
            title: title,
            body: body,
          );
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.pushSent);
      _title.clear();
      _body.clear();
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Text(AppStrings.pushTitle, style: AppTypography.display),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _audience,
          decoration:
              const InputDecoration(labelText: AppStrings.pushAudience),
          items: [
            for (final a in _audiences)
              DropdownMenuItem(value: a, child: Text(a)),
          ],
          onChanged:
              _busy ? null : (v) => setState(() => _audience = v ?? _audience),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _title,
          maxLength: 120,
          decoration:
              const InputDecoration(labelText: AppStrings.pushMessageTitle),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _body,
          maxLength: 500,
          maxLines: 4,
          decoration:
              const InputDecoration(labelText: AppStrings.pushMessageBody),
        ),
        const SizedBox(height: 16),
        MutationButton(
          label: AppStrings.pushSend,
          icon: Icons.send_outlined,
          loading: _busy,
          onPressed: _send,
        ),
      ],
    );
  }
}

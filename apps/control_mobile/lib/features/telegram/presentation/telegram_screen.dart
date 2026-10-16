import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/action_feedback.dart';
import '../../../shared/widgets/async_page_body.dart';
import '../../../shared/widgets/mutation_button.dart';
import '../data/telegram_repository.dart';

final telegramProvider =
    FutureProvider.autoDispose<TelegramBotSettings>((ref) {
  return ref.watch(telegramRepositoryProvider).fetchAdmin();
});

class TelegramScreen extends ConsumerStatefulWidget {
  const TelegramScreen({super.key});

  @override
  ConsumerState<TelegramScreen> createState() => _TelegramScreenState();
}

class _TelegramScreenState extends ConsumerState<TelegramScreen> {
  final _welcome = TextEditingController();
  final _siteUrl = TextEditingController();
  bool _hydrated = false;
  bool _busy = false;

  @override
  void dispose() {
    _welcome.dispose();
    _siteUrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      await ref.read(telegramRepositoryProvider).updateAdmin(
            welcomeMessage: _welcome.text.trim(),
            siteUrl: _siteUrl.text.trim(),
          );
      ref.invalidate(telegramProvider);
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.saved);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _registerWebhook() async {
    setState(() => _busy = true);
    try {
      await ref.read(telegramRepositoryProvider).registerWebhook();
      if (!mounted) return;
      showActionSnackBar(context, AppStrings.actionDone);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(telegramProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Text(AppStrings.navTelegram, style: AppTypography.display),
        ),
        Expanded(
          child: AsyncPageBody<TelegramBotSettings>(
            asyncValue: async,
            onRefresh: () {
              _hydrated = false;
              return ref.refresh(telegramProvider.future);
            },
            padding: const EdgeInsets.all(AppSpacing.lg),
            dataBuilder: (settings) {
              if (!_hydrated) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (!mounted) return;
                  setState(() {
                    _welcome.text = settings.welcomeMessage;
                    _siteUrl.text = settings.siteUrl;
                    _hydrated = true;
                  });
                });
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _welcome,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      labelText: AppStrings.telegramWelcome,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _siteUrl,
                    decoration: const InputDecoration(
                      labelText: AppStrings.telegramSiteUrl,
                    ),
                  ),
                  const SizedBox(height: 16),
                  MutationButton(
                    label: AppStrings.save,
                    loading: _busy,
                    onPressed: _save,
                  ),
                  const SizedBox(height: 8),
                  MutationButton(
                    label: AppStrings.registerWebhook,
                    filled: false,
                    loading: _busy,
                    onPressed: _registerWebhook,
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

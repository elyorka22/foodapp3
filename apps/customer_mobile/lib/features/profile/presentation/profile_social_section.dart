import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_spacing.dart';

class ProfileSocialLinks {
  const ProfileSocialLinks({
    this.instagramUrl = '',
    this.youtubeUrl = '',
  });

  final String instagramUrl;
  final String youtubeUrl;
}

class ProfileSocialSection extends StatelessWidget {
  const ProfileSocialSection({super.key, required this.links});

  final ProfileSocialLinks links;

  @override
  Widget build(BuildContext context) {
    final items = <_SocialItem>[
      if (links.instagramUrl.trim().isNotEmpty)
        _SocialItem(
          label: AppStrings.instagram,
          url: links.instagramUrl,
          icon: Icons.camera_alt_outlined,
          color: const Color(0xFFE1306C),
        ),
      if (links.youtubeUrl.trim().isNotEmpty)
        _SocialItem(
          label: AppStrings.youtube,
          url: links.youtubeUrl,
          icon: Icons.play_circle_outline,
          color: const Color(0xFFFF0000),
        ),
    ];

    if (items.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.lg),
      child: Row(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0) const SizedBox(width: 10),
            Expanded(
              child: Material(
                color: const Color(0xFFE7F6EC),
                borderRadius: BorderRadius.circular(16),
                child: InkWell(
                  onTap: () => _openUrl(context, items[i].url),
                  borderRadius: BorderRadius.circular(16),
                  child: SizedBox(
                    height: 56,
                    child: Icon(
                      items[i].icon,
                      size: 26,
                      color: items[i].color,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SocialItem {
  const _SocialItem({
    required this.label,
    required this.url,
    required this.icon,
    required this.color,
  });

  final String label;
  final String url;
  final IconData icon;
  final Color color;
}

Future<void> _openUrl(BuildContext context, String rawUrl) async {
  final trimmed = rawUrl.trim();
  if (trimmed.isEmpty) return;

  final uri = Uri.tryParse(trimmed);
  if (uri == null || !uri.hasScheme) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text(AppStrings.errorGeneric)),
    );
    return;
  }

  final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!launched && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(trimmed)),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import 'profile_banner_tile.dart';

const _instagramIcon = Icon(
  Icons.camera_alt_outlined,
  size: 40,
  color: Color(0xFFE1306C),
);
const _telegramSocialIcon = Icon(
  Icons.telegram,
  size: 44,
  color: Color(0xFF229ED9),
);
const _youtubeIcon = Icon(
  Icons.play_circle_outline,
  size: 40,
  color: Color(0xFFFF0000),
);

class ProfileSocialLinks {
  const ProfileSocialLinks({
    this.instagramUrl = '',
    this.telegramUrl = '',
    this.youtubeUrl = '',
  });

  final String instagramUrl;
  final String telegramUrl;
  final String youtubeUrl;
}

class ProfileSocialSection extends StatelessWidget {
  const ProfileSocialSection({super.key, required this.links});

  final ProfileSocialLinks links;

  @override
  Widget build(BuildContext context) {
    final tiles = [
      if (links.instagramUrl.trim().isNotEmpty)
        _SocialTileConfig(
          title: AppStrings.instagram,
          url: links.instagramUrl,
          icon: _instagramIcon,
        ),
      if (links.telegramUrl.trim().isNotEmpty)
        _SocialTileConfig(
          title: AppStrings.telegram,
          url: links.telegramUrl,
          icon: _telegramSocialIcon,
        ),
      if (links.youtubeUrl.trim().isNotEmpty)
        _SocialTileConfig(
          title: AppStrings.youtube,
          url: links.youtubeUrl,
          icon: _youtubeIcon,
        ),
    ];

    if (tiles.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: AppSpacing.xl),
        Text(
          AppStrings.profileSocialTitle,
          textAlign: TextAlign.center,
          style: AppTypography.subtitle.copyWith(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: AppSpacing.md,
          crossAxisSpacing: AppSpacing.md,
          childAspectRatio: 0.92,
          children: tiles
              .map(
                (tile) => SizedBox(
                  height: 148,
                  child: ProfileBannerTile(
                    title: tile.title,
                    subtitle: AppStrings.profileSocialFollow,
                    onTap: () => _openUrl(context, tile.url),
                    bottomRight: tile.icon,
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

class _SocialTileConfig {
  const _SocialTileConfig({
    required this.title,
    required this.url,
    required this.icon,
  });

  final String title;
  final String url;
  final Widget icon;
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

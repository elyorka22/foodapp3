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

  bool get hasAny =>
      instagramUrl.trim().isNotEmpty ||
      telegramUrl.trim().isNotEmpty ||
      youtubeUrl.trim().isNotEmpty;
}

class ProfileSocialSection extends StatelessWidget {
  const ProfileSocialSection({super.key, required this.links});

  final ProfileSocialLinks links;

  @override
  Widget build(BuildContext context) {
    if (!links.hasAny) return const SizedBox.shrink();

    final tiles = <Widget>[];
    if (links.instagramUrl.trim().isNotEmpty) {
      tiles.add(
        ProfileBannerTile(
          title: AppStrings.instagram,
          subtitle: AppStrings.profileSocialFollow,
          onTap: () => _openUrl(context, links.instagramUrl),
          bottomRight: _instagramIcon,
        ),
      );
    }
    if (links.telegramUrl.trim().isNotEmpty) {
      tiles.add(
        ProfileBannerTile(
          title: AppStrings.telegram,
          subtitle: AppStrings.profileSocialFollow,
          onTap: () => _openUrl(context, links.telegramUrl),
          bottomRight: _telegramSocialIcon,
        ),
      );
    }
    if (links.youtubeUrl.trim().isNotEmpty) {
      tiles.add(
        ProfileBannerTile(
          title: AppStrings.youtube,
          subtitle: AppStrings.profileSocialFollow,
          onTap: () => _openUrl(context, links.youtubeUrl),
          bottomRight: _youtubeIcon,
        ),
      );
    }

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
                (child) => SizedBox(height: 148, child: child),
              )
              .toList(),
        ),
      ],
    );
  }
}

Future<void> _openUrl(BuildContext context, String rawUrl) async {
  final trimmed = rawUrl.trim();
  if (trimmed.isEmpty) return;

  final uri = Uri.tryParse(trimmed);
  if (uri == null || !uri.hasScheme) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings.errorGeneric)),
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

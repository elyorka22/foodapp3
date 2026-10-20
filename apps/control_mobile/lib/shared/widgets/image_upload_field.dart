import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/network/upload_repository.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/home_service_image.dart';
import '../../core/utils/media_url.dart';
import 'action_feedback.dart';
import 'image_framing_controls.dart';

/// Gallery upload + URL field.
///
/// Framing preview/sliders are optional and meant only for home banners
/// ([enableFraming] + [framing] / [onFramingChanged]).
class ImageUploadField extends ConsumerStatefulWidget {
  const ImageUploadField({
    super.key,
    required this.imageUrlController,
    this.enabled = true,
    this.refererPath = '/admin/banners',
    this.enableFraming = false,
    this.framing = const ImageFramingValues(),
    this.onFramingChanged,
    this.showSimplePreview = true,
  });

  final TextEditingController imageUrlController;
  final bool enabled;
  final String refererPath;

  /// When true, shows home-banner-sized preview + position sliders.
  final bool enableFraming;
  final ImageFramingValues framing;
  final ValueChanged<ImageFramingValues>? onFramingChanged;

  /// Square thumbnail under the URL field (when framing is off).
  final bool showSimplePreview;

  @override
  ConsumerState<ImageUploadField> createState() => _ImageUploadFieldState();
}

class _ImageUploadFieldState extends ConsumerState<ImageUploadField> {
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    widget.imageUrlController.addListener(_onUrlChanged);
  }

  @override
  void dispose() {
    widget.imageUrlController.removeListener(_onUrlChanged);
    super.dispose();
  }

  void _onUrlChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _pickAndUpload() async {
    if (!widget.enabled || _uploading) return;
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        imageQuality: 80,
        requestFullMetadata: false,
      );
      if (file == null) return;

      setState(() => _uploading = true);
      final bytes = await file.readAsBytes();
      if (bytes.isEmpty) {
        showActionSnackBar(context, 'Rasm bo‘sh', error: true);
        return;
      }
      if (bytes.length > 8 * 1024 * 1024) {
        showActionSnackBar(
          context,
          'Rasm juda katta (max ~8 MB). Boshqa rasm tanlang.',
          error: true,
        );
        return;
      }
      final name = file.name.isNotEmpty ? file.name : 'image.jpg';
      final result = await ref.read(uploadRepositoryProvider).uploadImage(
            bytes: bytes,
            filename: name,
            refererPath: widget.refererPath,
          );
      if (!mounted) return;
      if (result.url.isEmpty) {
        showActionSnackBar(context, 'Yuklash muvaffaqiyatsiz', error: true);
        return;
      }
      widget.imageUrlController.text = result.url;
      showActionSnackBar(context, AppStrings.actionDone);
    } catch (e) {
      if (mounted) showActionError(context, e);
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  void _clear() {
    widget.imageUrlController.clear();
    widget.onFramingChanged?.call(const ImageFramingValues());
  }

  @override
  Widget build(BuildContext context) {
    final locked = !widget.enabled || _uploading;
    final url = widget.imageUrlController.text.trim();
    final hasImage = url.isNotEmpty;
    final showFraming = widget.enableFraming && widget.onFramingChanged != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: FilledButton.icon(
                onPressed: locked ? null : _pickAndUpload,
                icon: _uploading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.add_photo_alternate_outlined),
                label: Text(
                  _uploading
                      ? AppStrings.bannerUploading
                      : (hasImage
                          ? AppStrings.bannerChangeImage
                          : AppStrings.bannerPickImage),
                ),
              ),
            ),
            if (hasImage) ...[
              const SizedBox(width: 8),
              IconButton.filledTonal(
                tooltip: AppStrings.bannerRemoveImage,
                onPressed: locked ? null : _clear,
                icon: const Icon(Icons.delete_outline),
                style: IconButton.styleFrom(
                  foregroundColor: AppColors.danger,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: widget.imageUrlController,
          enabled: !locked,
          decoration: const InputDecoration(
            labelText: AppStrings.bannerImageUrl,
            hintText: 'https://…',
          ),
        ),
        if (showFraming) ...[
          const SizedBox(height: 12),
          ImageFramingControls(
            imageUrl: url,
            values: widget.framing,
            enabled: !locked,
            onChanged: widget.onFramingChanged!,
          ),
        ] else if (hasImage && widget.showSimplePreview) ...[
          const SizedBox(height: 12),
          _SimpleImagePreview(url: url),
        ],
      ],
    );
  }
}

class _SimpleImagePreview extends StatelessWidget {
  const _SimpleImagePreview({required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    final asset = bundledHomeServiceAssetPath(url);
    final remote = resolveMediaUrl(url);
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: AspectRatio(
        aspectRatio: 1,
        child: ColoredBox(
          color: AppColors.surfaceMuted,
          child: asset != null
              ? Image.asset(
                  asset,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Center(
                    child: Icon(
                      Icons.broken_image_outlined,
                      color: AppColors.textMuted,
                    ),
                  ),
                )
              : Image.network(
                  remote.isNotEmpty ? remote : url,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Center(
                    child: Icon(
                      Icons.broken_image_outlined,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}

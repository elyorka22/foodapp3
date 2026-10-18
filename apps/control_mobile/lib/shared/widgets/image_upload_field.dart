import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/network/upload_repository.dart';
import '../../core/theme/app_colors.dart';
import 'action_feedback.dart';
import 'image_framing_controls.dart';

/// Gallery upload + optional URL + framing sliders for banners / categories.
class ImageUploadField extends ConsumerStatefulWidget {
  const ImageUploadField({
    super.key,
    required this.imageUrlController,
    required this.framing,
    required this.onFramingChanged,
    this.enabled = true,
    this.aspectRatio = 2,
    this.refererPath = '/admin/banners',
  });

  final TextEditingController imageUrlController;
  final ImageFramingValues framing;
  final ValueChanged<ImageFramingValues> onFramingChanged;
  final bool enabled;
  final double aspectRatio;
  final String refererPath;

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
      // Keep under nginx client_max_body_size (10M) with headroom.
      if (bytes.length > 8 * 1024 * 1024) {
        showActionSnackBar(
          context,
          'Rasm juda katta (max ~8 MB). Boshqa rasm tanlang.',
          error: true,
        );
        return;
      }
      final name = file.name.isNotEmpty ? file.name : 'banner.jpg';
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
    widget.onFramingChanged(const ImageFramingValues());
  }

  @override
  Widget build(BuildContext context) {
    final locked = !widget.enabled || _uploading;
    final hasImage = widget.imageUrlController.text.trim().isNotEmpty;

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
        const SizedBox(height: 12),
        ImageFramingControls(
          imageUrl: widget.imageUrlController.text.trim(),
          values: widget.framing,
          aspectRatio: widget.aspectRatio,
          enabled: !locked,
          onChanged: widget.onFramingChanged,
        ),
      ],
    );
  }
}

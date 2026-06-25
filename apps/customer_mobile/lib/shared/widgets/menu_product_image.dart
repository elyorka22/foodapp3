import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/utils/menu_product_image_style.dart';

class MenuProductImage extends StatefulWidget {
  const MenuProductImage({super.key, required this.imageUrl});

  final String imageUrl;

  @override
  State<MenuProductImage> createState() => _MenuProductImageState();
}

class _MenuProductImageState extends State<MenuProductImage> {
  BoxFit _fit = BoxFit.cover;
  ImageStream? _stream;
  ImageStreamListener? _listener;

  @override
  void initState() {
    super.initState();
    _resolveFit();
  }

  @override
  void didUpdateWidget(MenuProductImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageUrl != widget.imageUrl) {
      setState(() => _fit = BoxFit.cover);
      _resolveFit();
    }
  }

  void _resolveFit() {
    _detachListener();
    final provider = CachedNetworkImageProvider(widget.imageUrl);
    _stream = provider.resolve(const ImageConfiguration());
    _listener = ImageStreamListener((info, _) {
      if (!mounted) return;
      final nextFit = menuProductImageFit(
        info.image.width.toDouble(),
        info.image.height.toDouble(),
      );
      if (nextFit != _fit) {
        setState(() => _fit = nextFit);
      }
    });
    _stream!.addListener(_listener!);
  }

  void _detachListener() {
    if (_stream != null && _listener != null) {
      _stream!.removeListener(_listener!);
    }
    _stream = null;
    _listener = null;
  }

  @override
  void dispose() {
    _detachListener();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.white,
      child: CachedNetworkImage(
        imageUrl: widget.imageUrl,
        fit: _fit,
        width: double.infinity,
        height: double.infinity,
      ),
    );
  }
}

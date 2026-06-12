import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/image_url.dart';
import '../../../shared/models/category_model.dart';
import '../../../shared/models/product_model.dart';
import '../../../shared/widgets/food_app_button.dart';
import '../../restaurant/data/restaurant_repository.dart';
import '../data/categories_repository.dart';
import '../data/products_repository.dart';
import '../data/upload_repository.dart';

class ProductFormArgs {
  const ProductFormArgs({
    required this.businessId,
    this.existing,
  });

  final String businessId;
  final ProductModel? existing;
}

class ProductFormScreen extends ConsumerStatefulWidget {
  const ProductFormScreen({super.key, required this.args});

  final ProductFormArgs args;

  @override
  ConsumerState<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends ConsumerState<ProductFormScreen> {
  final _name = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _picker = ImagePicker();

  bool _loading = false;
  bool _initialized = false;
  bool _isStore = false;
  bool _isAvailable = true;
  String? _categoryId;
  String? _imageUrl;
  String? _localImagePath;
  List<CategoryModel> _categories = [];

  bool get _isEdit => widget.args.existing != null;

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final existing = widget.args.existing;
    final restaurant = await ref
        .read(restaurantRepositoryProvider)
        .fetchRestaurant(widget.args.businessId);
    final categories = await ref
        .read(categoriesRepositoryProvider)
        .fetchForBusiness(widget.args.businessId);

    _isStore = restaurant.isStore;
    _categories = categories;

    if (existing != null) {
      _name.text = existing.name;
      _description.text = existing.description ?? '';
      _price.text = existing.price.toString();
      _isAvailable = existing.isAvailable;
      _categoryId = existing.categoryId;
      _imageUrl = existing.imageUrl;
    }

    if (mounted) setState(() => _initialized = true);
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_load);
  }

  Future<void> _pickImage() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
      maxWidth: 1600,
    );
    if (file == null) return;
    setState(() {
      _localImagePath = file.path;
      _imageUrl = null;
    });
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final price = num.tryParse(_price.text.trim());
    if (name.isEmpty || price == null) return;
    if (_categoryId == null || _categoryId!.isEmpty) {
      _showError(_isStore ? AppStrings.selectStoreCategory : AppStrings.selectDishCategory);
      return;
    }

    setState(() => _loading = true);
    try {
      final repo = ref.read(productsRepositoryProvider);
      final product = ProductModel(
        id: widget.args.existing?.id,
        name: name,
        price: price,
        description: _description.text.trim(),
        isAvailable: _isAvailable,
        dishCategoryId: _isStore ? null : _categoryId,
        productCategoryId: _isStore ? _categoryId : null,
      );

      ProductModel saved;
      if (_isEdit) {
        saved = await repo.updateProduct(product, isStore: _isStore);
      } else {
        saved = await repo.createProduct(
          product,
          widget.args.businessId,
          isStore: _isStore,
        );
      }

      final imagePath = _localImagePath;
      if (imagePath != null && saved.id != null) {
        final url = await ref.read(uploadRepositoryProvider).uploadImage(imagePath);
        await repo.addProductImage(saved.id!, url);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.saved)),
      );
      context.pop(true);
    } catch (e) {
      if (mounted) _showError(ApiException.formatError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final title = _isEdit ? AppStrings.editProduct : AppStrings.addProduct;

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: !_initialized
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    _isStore ? AppStrings.storeCategory : AppStrings.dishCategory,
                    style: AppTypography.subtitle,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (_categories.isEmpty)
                    Text(
                      _isStore
                          ? AppStrings.noStoreCategoriesHint
                          : AppStrings.noDishCategoriesHint,
                      style: AppTypography.caption.copyWith(color: AppColors.danger),
                    )
                  else
                    DropdownButtonFormField<String>(
                      value: _categoryId,
                      decoration: InputDecoration(
                        labelText: _isStore
                            ? AppStrings.selectStoreCategory
                            : AppStrings.selectDishCategory,
                      ),
                      items: _categories
                          .map(
                            (c) => DropdownMenuItem(
                              value: c.id,
                              child: Text(c.name),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => setState(() => _categoryId = value),
                    ),
                  const SizedBox(height: AppSpacing.lg),
                  TextField(
                    controller: _name,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(labelText: AppStrings.productName),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _description,
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      labelText: AppStrings.productDescription,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _price,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(labelText: AppStrings.productPrice),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(AppStrings.productImage, style: AppTypography.subtitle),
                  const SizedBox(height: AppSpacing.sm),
                  _ImagePickerTile(
                    imageUrl: _imageUrl,
                    localPath: _localImagePath,
                    onPick: _pickImage,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text(AppStrings.available),
                    value: _isAvailable,
                    onChanged: (v) => setState(() => _isAvailable = v),
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  FoodAppButton(
                    label: AppStrings.save,
                    isLoading: _loading,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
    );
  }
}

class _ImagePickerTile extends StatelessWidget {
  const _ImagePickerTile({
    required this.imageUrl,
    required this.localPath,
    required this.onPick,
  });

  final String? imageUrl;
  final String? localPath;
  final VoidCallback onPick;

  @override
  Widget build(BuildContext context) {
    final resolved = localPath ?? resolveImageUrl(imageUrl);

    return InkWell(
      onTap: onPick,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: AppColors.primarySoft,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        clipBehavior: Clip.antiAlias,
        child: resolved == null
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add_photo_alternate_outlined, size: 32),
                    const SizedBox(height: 8),
                    Text(AppStrings.pickProductImage, style: AppTypography.caption),
                  ],
                ),
              )
            : localPath != null
                ? Image.file(File(localPath!), fit: BoxFit.cover, width: double.infinity)
                : CachedNetworkImage(
                    imageUrl: resolved,
                    fit: BoxFit.cover,
                    width: double.infinity,
                  ),
      ),
    );
  }
}

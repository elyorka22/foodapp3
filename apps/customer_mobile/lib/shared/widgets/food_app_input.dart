import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class FoodAppInput extends StatefulWidget {
  const FoodAppInput({
    super.key,
    this.label,
    required this.controller,
    this.hint,
    this.obscureText = false,
    this.keyboardType,
    this.onSubmitted,
  });

  final String? label;
  final TextEditingController controller;
  final String? hint;
  final bool obscureText;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onSubmitted;

  @override
  State<FoodAppInput> createState() => _FoodAppInputState();
}

class _FoodAppInputState extends State<FoodAppInput> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    final isPassword = widget.obscureText;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: widget.controller,
          obscureText: isPassword ? _obscured : false,
          keyboardType: widget.keyboardType,
          onSubmitted: widget.onSubmitted,
          style: AppTypography.body,
          cursorColor: AppColors.primary,
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: AppTypography.body.copyWith(color: AppColors.textMuted),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      _obscured ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () => setState(() => _obscured = !_obscured),
                  )
                : null,
          ),
        ),
      ],
    );
  }
}

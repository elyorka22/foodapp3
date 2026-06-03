import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';

class FoodAppInput extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          onSubmitted: onSubmitted,
          decoration: InputDecoration(hintText: hint ?? AppStrings.phone),
        ),
      ],
    );
  }
}

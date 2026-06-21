import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/phone_util.dart';

/// Uzbekistan phone field: fixed +998 prefix and exactly 9 local digits.
class UzPhoneField extends StatelessWidget {
  const UzPhoneField({
    super.key,
    required this.controller,
    this.hint,
    this.label,
    this.onChanged,
  });

  final TextEditingController controller;
  final String? hint;
  final String? label;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: AppTypography.bodySmall),
          const SizedBox(height: 6),
        ],
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE4E4E7)),
              ),
              child: Text(
                uzPhonePrefix,
                style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: controller,
                keyboardType: TextInputType.phone,
                onChanged: onChanged,
                inputFormatters: const [_UzPhoneDisplayFormatter()],
                style: AppTypography.body,
                decoration: InputDecoration(
                  hintText: hint,
                  hintStyle: AppTypography.body.copyWith(color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _UzPhoneDisplayFormatter extends TextInputFormatter {
  const _UzPhoneDisplayFormatter();
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = extractUzLocalDigits(newValue.text);
    final formatted = formatUzLocalDigits(digits);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

/// Sets controller text from a stored full phone value.
void setUzPhoneController(TextEditingController controller, String? phone) {
  if (phone == null || phone.trim().isEmpty) return;
  controller.text = formatUzLocalDigits(extractUzLocalDigits(phone));
}

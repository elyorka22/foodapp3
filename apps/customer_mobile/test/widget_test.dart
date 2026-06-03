import 'package:flutter_test/flutter_test.dart';
import 'package:customer_mobile/core/theme/app_colors.dart';

void main() {
  test('brand primary matches web design token', () {
    expect(AppColors.primary.toARGB32(), 0xFFFF6B00);
  });
}

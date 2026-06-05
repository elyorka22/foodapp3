import 'package:courier_mobile/core/utils/format_sum.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('formatSum includes so\'m suffix', () {
    expect(formatSum(1000), contains("so'm"));
  });
}

import 'package:control_mobile/features/business_types/data/business_types_repository.dart';
import 'package:control_mobile/features/shell/control_nav_items.dart';
import 'package:control_mobile/features/shell/control_vertical_scope.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('buildControlNavSections inserts marketplace types after restaurants', () {
    final sections = buildControlNavSections(const [
      ControlBusinessType(
        id: '1',
        name: 'Restoran',
        isActive: true,
        slug: 'restaurant',
        menuMode: 'GLOBAL_DISH',
        sortOrder: 0,
      ),
      ControlBusinessType(
        id: '2',
        name: 'Gullar',
        isActive: true,
        slug: 'flowers',
        menuMode: 'OWN_CATEGORIES',
        sortOrder: 1,
      ),
      ControlBusinessType(
        id: '3',
        name: 'Hidden',
        isActive: false,
        slug: 'hidden',
        menuMode: 'OWN_CATEGORIES',
        sortOrder: 2,
      ),
    ]);

    expect(sections.map((s) => s.label).toList(), contains('Restoranlar'));
    expect(sections.map((s) => s.label).toList(), contains('Gullar'));
    expect(sections.map((s) => s.label).toList(), isNot(contains('Hidden')));
    expect(isMarketplaceBusinessType(const ControlBusinessType(
      id: '2',
      name: 'Gullar',
      isActive: true,
      slug: 'flowers',
      menuMode: 'OWN_CATEGORIES',
    )), isTrue);
    expect(isMarketplaceBusinessType(const ControlBusinessType(
      id: '1',
      name: 'Restoran',
      isActive: true,
      slug: 'restaurant',
      menuMode: 'GLOBAL_DISH',
    )), isFalse);

    final flowers = sections.firstWhere((s) => s.label == 'Gullar');
    expect(flowers.entries.length, 5);
    expect(flowers.entries.first.scope.slug, 'flowers');
    expect(flowers.entries.first.scope.id, '2');
    expect(
      flowers.entries.first.scope.restaurantQuery(),
      {'vertical': 'store'},
    );
    expect(
      flowers.entries
          .where((e) => e.branchIndex == ControlBranches.catalog)
          .length,
      2,
    );
  });
}

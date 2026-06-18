import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/storage_providers.dart';
import '../models/city_model.dart';
import 'cities_provider.dart';

const _selectedCitySlugKey = 'selected_city_slug';

final selectedCitySlugProvider =
    NotifierProvider<SelectedCitySlugNotifier, String?>(SelectedCitySlugNotifier.new);

class SelectedCitySlugNotifier extends Notifier<String?> {
  @override
  String? build() {
    return ref.read(sharedPreferencesProvider).getString(_selectedCitySlugKey);
  }

  Future<void> selectSlug(String slug) async {
    await ref.read(sharedPreferencesProvider).setString(_selectedCitySlugKey, slug);
    state = slug;
  }
}

final selectedCityProvider = Provider<CityModel?>((ref) {
  final cities = ref.watch(citiesProvider).valueOrNull;
  if (cities == null || cities.isEmpty) return null;

  final storedSlug = ref.watch(selectedCitySlugProvider);
  if (storedSlug != null) {
    for (final city in cities) {
      if (city.slug == storedSlug) return city;
    }
  }

  for (final city in cities) {
    if (city.isDefault) return city;
  }
  return cities.first;
});

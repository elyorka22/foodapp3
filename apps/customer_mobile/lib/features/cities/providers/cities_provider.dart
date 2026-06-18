import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/cities_repository.dart';
import '../models/city_model.dart';

final citiesProvider = FutureProvider.autoDispose<List<CityModel>>((ref) {
  return ref.watch(citiesRepositoryProvider).fetchCities();
});

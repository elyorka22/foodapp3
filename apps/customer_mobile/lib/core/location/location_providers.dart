import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/storage_providers.dart';
import 'location_service.dart';
import 'location_storage.dart';

final locationStorageProvider = Provider<LocationStorage>((ref) {
  return LocationStorage(ref.watch(sharedPreferencesProvider));
});

final locationServiceProvider = Provider<LocationService>((ref) {
  return LocationService(ref.watch(locationStorageProvider));
});

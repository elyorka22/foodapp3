import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/storage_providers.dart';

const _keySound = 'courier_alert_sound';
const _keyVibration = 'courier_alert_vibration';

final alertPreferencesProvider =
    NotifierProvider<AlertPreferencesNotifier, AlertPreferences>(AlertPreferencesNotifier.new);

class AlertPreferences {
  const AlertPreferences({
    this.soundEnabled = true,
    this.vibrationEnabled = true,
  });

  final bool soundEnabled;
  final bool vibrationEnabled;

  AlertPreferences copyWith({bool? soundEnabled, bool? vibrationEnabled}) {
    return AlertPreferences(
      soundEnabled: soundEnabled ?? this.soundEnabled,
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
    );
  }
}

class AlertPreferencesNotifier extends Notifier<AlertPreferences> {
  @override
  AlertPreferences build() {
    final prefs = ref.read(sharedPreferencesProvider);
    return AlertPreferences(
      soundEnabled: prefs.getBool(_keySound) ?? true,
      vibrationEnabled: prefs.getBool(_keyVibration) ?? true,
    );
  }

  Future<void> setSoundEnabled(bool value) async {
    await ref.read(sharedPreferencesProvider).setBool(_keySound, value);
    state = state.copyWith(soundEnabled: value);
  }

  Future<void> setVibrationEnabled(bool value) async {
    await ref.read(sharedPreferencesProvider).setBool(_keyVibration, value);
    state = state.copyWith(vibrationEnabled: value);
  }
}

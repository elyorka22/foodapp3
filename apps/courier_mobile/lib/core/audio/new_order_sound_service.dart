import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';

/// Alert sound + haptic pattern when a new pool job appears.
class NewOrderSoundService {
  NewOrderSoundService._();
  static final NewOrderSoundService instance = NewOrderSoundService._();

  final AudioPlayer _player = AudioPlayer();
  bool _playing = false;

  Future<void> play({
    bool soundEnabled = true,
    bool vibrationEnabled = true,
  }) async {
    if (_playing) return;
    _playing = true;
    try {
      if (vibrationEnabled) {
        await _vibratePattern();
      }
      if (soundEnabled) {
        await _player.stop();
        await _player.play(AssetSource('sounds/new_order.wav'));
      }
    } catch (_) {
      if (soundEnabled) {
        await SystemSound.play(SystemSoundType.alert);
      }
    } finally {
      await Future<void>.delayed(const Duration(milliseconds: 800));
      _playing = false;
    }
  }

  Future<void> _vibratePattern() async {
    await HapticFeedback.heavyImpact();
    await Future<void>.delayed(const Duration(milliseconds: 120));
    await HapticFeedback.mediumImpact();
    await Future<void>.delayed(const Duration(milliseconds: 120));
    await HapticFeedback.heavyImpact();
  }

  void dispose() {
    _player.dispose();
  }
}

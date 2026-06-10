import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';

/// Plays a short alert when a new pool order appears.
class NewOrderSoundService {
  NewOrderSoundService._();
  static final NewOrderSoundService instance = NewOrderSoundService._();

  final AudioPlayer _player = AudioPlayer();
  bool _playing = false;

  Future<void> play() async {
    if (_playing) return;
    _playing = true;
    try {
      await HapticFeedback.heavyImpact();
      await _player.stop();
      await _player.play(AssetSource('sounds/new_order.wav'));
    } catch (_) {
      await SystemSound.play(SystemSoundType.alert);
    } finally {
      _playing = false;
    }
  }

  void dispose() {
    _player.dispose();
  }
}

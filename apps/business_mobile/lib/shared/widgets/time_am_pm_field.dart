import 'package:flutter/material.dart';
import '../utils/time_format.dart';

/// Tap to pick time in 12-hour AM/PM format; stores 24h HH:mm internally.
class TimeAmPmField extends StatelessWidget {
  const TimeAmPmField({
    super.key,
    required this.labelText,
    required this.value24,
    required this.onChanged,
    this.hintText,
  });

  final String labelText;
  final String value24;
  final ValueChanged<String> onChanged;
  final String? hintText;

  Future<void> _pick(BuildContext context) async {
    final initial = parseTimeOfDay(value24) ?? const TimeOfDay(hour: 9, minute: 0);
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: false),
          child: child!,
        );
      },
    );
    if (picked != null) {
      onChanged(timeOfDayTo24h(picked));
    }
  }

  @override
  Widget build(BuildContext context) {
    final display = formatTime12h(value24);

    return InkWell(
      onTap: () => _pick(context),
      borderRadius: BorderRadius.circular(12),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText ?? '9:00 AM',
          suffixIcon: const Icon(Icons.access_time),
        ),
        child: Text(display),
      ),
    );
  }
}

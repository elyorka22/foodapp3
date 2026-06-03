/// Resolved delivery coordinates for checkout.
class DeliveryLocation {
  const DeliveryLocation({
    required this.latitude,
    required this.longitude,
    required this.source,
    this.address,
    this.accuracyMeters,
  });

  final double latitude;
  final double longitude;
  final LocationSource source;
  final String? address;
  final double? accuracyMeters;

  bool get isValid =>
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;
}

enum LocationSource {
  gps,
  cached,
  profile,
  manual,
}

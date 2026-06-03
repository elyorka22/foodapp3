import 'delivery_location.dart';

/// Why GPS resolution failed (checkout).
enum LocationFailure {
  permissionDenied,
  permissionPermanentlyDenied,
  serviceDisabled,
  timeout,
  unavailable,
}

class CheckoutLocationResult {
  const CheckoutLocationResult({
    this.location,
    this.failure,
  });

  final DeliveryLocation? location;
  final LocationFailure? failure;
}

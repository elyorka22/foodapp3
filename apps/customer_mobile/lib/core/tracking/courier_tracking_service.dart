/// Live courier location on map — future phase after order assignment API is exposed to customers.
abstract class CourierTrackingService {
  Future<void> startTracking({required String orderId, required String trackingToken});
  Stream<CourierLocationUpdate> get locationStream;
  Future<void> stopTracking();
}

class CourierLocationUpdate {
  const CourierLocationUpdate({
    required this.latitude,
    required this.longitude,
    this.courierName,
    this.updatedAt,
  });

  final double latitude;
  final double longitude;
  final String? courierName;
  final DateTime? updatedAt;
}

class CourierTrackingServiceStub implements CourierTrackingService {
  @override
  Stream<CourierLocationUpdate> get locationStream => const Stream.empty();

  @override
  Future<void> startTracking({
    required String orderId,
    required String trackingToken,
  }) async {}

  @override
  Future<void> stopTracking() async {}
}

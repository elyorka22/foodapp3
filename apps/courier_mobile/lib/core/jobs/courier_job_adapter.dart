import '../../shared/models/courier_order_model.dart';
import 'job_service_type.dart';
import 'job_stop.dart';
import 'job_workflow.dart';

extension CourierJobAdapter on CourierOrderModel {
  JobServiceType get serviceType => JobWorkflow.serviceTypeFor(this);

  List<JobStop> get stops {
    return switch (serviceType) {
      JobServiceType.food => [
          JobStop(
            role: JobStopRole.pickup,
            title: restaurantName ?? '—',
            subtitle: merchantTypeLabel.isNotEmpty ? merchantTypeLabel : null,
            lat: restaurantLat,
            lng: restaurantLng,
          ),
          JobStop(
            role: JobStopRole.dropoff,
            title: customerName ?? customerPhone ?? '—',
            subtitle: customerAddress,
            lat: customerLat,
            lng: customerLng,
            phone: customerPhone,
          ),
        ],
      JobServiceType.taxi => [
          JobStop(
            role: JobStopRole.pickup,
            title: customerName ?? customerPhone ?? '—',
            subtitle: customerAddress,
            lat: customerLat,
            lng: customerLng,
            phone: customerPhone,
          ),
          JobStop(
            role: JobStopRole.dropoff,
            title: customerAddress ?? '—',
            lat: customerLat,
            lng: customerLng,
          ),
        ],
      JobServiceType.cargo => [
          JobStop(
            role: JobStopRole.pickup,
            title: restaurantName ?? customerAddress ?? '—',
            lat: restaurantLat ?? customerLat,
            lng: restaurantLng ?? customerLng,
          ),
          JobStop(
            role: JobStopRole.dropoff,
            title: customerAddress ?? '—',
            lat: customerLat,
            lng: customerLng,
            phone: customerPhone,
          ),
        ],
    };
  }
}

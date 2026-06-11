import '../../shared/models/courier_order_model.dart';
import '../l10n/app_strings.dart';
import 'job_service_type.dart';

class JobWorkflowStep {
  const JobWorkflowStep({
    required this.id,
    required this.label,
    required this.isComplete,
    required this.isCurrent,
  });

  final String id;
  final String label;
  final bool isComplete;
  final bool isCurrent;
}

/// Status-driven workflow per service type. Food uses existing order statuses.
abstract final class JobWorkflow {
  static JobServiceType serviceTypeFor(CourierOrderModel order) {
    // Future: read order.serviceType or sourceApp from API.
    return JobServiceType.food;
  }

  static List<JobWorkflowStep> stepsFor(CourierOrderModel order) {
    return switch (serviceTypeFor(order)) {
      JobServiceType.food => _foodSteps(order),
      JobServiceType.taxi => _taxiSteps(order),
      JobServiceType.cargo => _cargoSteps(order),
    };
  }

  static String phaseLabel(CourierOrderModel order) {
    if (order.needsCourierAcceptance) return AppStrings.phaseNewAssignment;
    return switch (order.status) {
      'COURIER_ASSIGNED' => AppStrings.phaseToPickup,
      'ARRIVED_AT_RESTAURANT' => AppStrings.phaseAtPickup,
      'PICKED_UP' || 'DELIVERING' => AppStrings.phaseToDropoff,
      'DELIVERED' => AppStrings.phaseCompleted,
      _ => AppStrings.phaseInProgress,
    };
  }

  static String actionLabel(CourierOrderModel order) {
    if (order.needsCourierAcceptance) return AppStrings.accept;
    return switch (order.status) {
      'COURIER_ASSIGNED' => AppStrings.arrivedAtPickup,
      'ARRIVED_AT_RESTAURANT' => AppStrings.pickedUp,
      'PICKED_UP' => AppStrings.startDelivering,
      'DELIVERING' => AppStrings.delivered,
      _ => AppStrings.openOrder,
    };
  }

  static List<JobWorkflowStep> _foodSteps(CourierOrderModel order) {
    const flow = [
      ('assign', AppStrings.stepAssigned),
      ('pickup', AppStrings.stepPickup),
      ('transit', AppStrings.stepTransit),
      ('dropoff', AppStrings.stepDropoff),
    ];
    final status = order.status;
    int activeIndex = 0;
    if (order.needsCourierAcceptance) {
      activeIndex = 0;
    } else if (status == 'COURIER_ASSIGNED') {
      activeIndex = 1;
    } else if (status == 'ARRIVED_AT_RESTAURANT') {
      activeIndex = 2;
    } else if (status == 'PICKED_UP' || status == 'DELIVERING') {
      activeIndex = 3;
    } else if (status == 'DELIVERED') {
      activeIndex = 4;
    }

    return [
      for (var i = 0; i < flow.length; i++)
        JobWorkflowStep(
          id: flow[i].$1,
          label: flow[i].$2,
          isComplete: i < activeIndex,
          isCurrent: i == activeIndex,
        ),
    ];
  }

  static List<JobWorkflowStep> _taxiSteps(CourierOrderModel order) {
    return _foodSteps(order);
  }

  static List<JobWorkflowStep> _cargoSteps(CourierOrderModel order) {
    return _foodSteps(order);
  }
}

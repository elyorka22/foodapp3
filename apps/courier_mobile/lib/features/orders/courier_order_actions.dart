import '../../core/l10n/app_strings.dart';
import '../../shared/models/courier_order_model.dart';

String actionLabelForOrder(CourierOrderModel order, {required bool isAvailable}) {
  if (isAvailable) return AppStrings.accept;

  if (order.needsCourierAcceptance) return AppStrings.accept;
  switch (order.status) {
    case 'COURIER_ASSIGNED':
      return AppStrings.arrivedAtRestaurant;
    case 'ARRIVED_AT_RESTAURANT':
      return AppStrings.pickedUp;
    case 'PICKED_UP':
      return AppStrings.startDelivering;
    case 'DELIVERING':
      return AppStrings.delivered;
    default:
      return AppStrings.openOrder;
  }
}

String? nextStatusForOrder(CourierOrderModel order) {
  if (order.needsCourierAcceptance) return null;
  switch (order.status) {
    case 'COURIER_ASSIGNED':
      return 'ARRIVED_AT_RESTAURANT';
    case 'ARRIVED_AT_RESTAURANT':
      return 'PICKED_UP_THEN_DELIVERING';
    case 'PICKED_UP':
      return 'DELIVERING';
    case 'DELIVERING':
      return 'DELIVERED';
    default:
      return null;
  }
}

bool shouldAcceptOrder(CourierOrderModel order, {required bool isAvailable}) {
  return isAvailable || order.needsCourierAcceptance;
}

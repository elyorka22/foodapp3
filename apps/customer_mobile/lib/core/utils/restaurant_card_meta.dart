import '../../shared/models/business_model.dart';
import '../../shared/models/restaurant_model.dart';

int restaurantPrepMinutes(RestaurantModel r) {
  return r.deliveryMinutes ?? r.avgPrepMinutes ?? 30;
}

String restaurantDeliveryLabel(RestaurantModel r) {
  return deliveryMinutesLabel(restaurantPrepMinutes(r));
}

String deliveryMinutesLabel(int base) {
  final low = (base - 5).clamp(15, 999);
  final high = base + 5;
  return '$low – $high daq';
}

int businessPrepMinutes(BusinessModel b) {
  return b.deliveryMinutes ?? 30;
}

String businessDeliveryLabel(BusinessModel b) {
  return deliveryMinutesLabel(businessPrepMinutes(b));
}

String restaurantCategoryLabel(RestaurantModel r) {
  final cats = r.categories ?? [];
  return cats.map((c) => c.name.trim()).where((n) => n.isNotEmpty).join(', ');
}

String? restaurantRatingLabel(RestaurantModel r) {
  final rating = r.averageRating;
  if (rating == null) return null;
  final value = rating.toStringAsFixed(1);
  final count = r.reviewCount ?? 0;
  return '★ $value ($count)';
}

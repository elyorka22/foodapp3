class CheckoutState {
  const CheckoutState({
    this.phone = '',
    this.promoCode = '',
    this.promoDiscount = 0,
    this.promoMessage = '',
    this.lat,
    this.lng,
    this.deliveryFee,
    this.billableDistanceKm,
    this.deliveryError,
    this.error,
    this.validatingPromo = false,
    this.sendingLocation = false,
    this.deliveryLoading = false,
    this.placingOrder = false,
  });

  final String phone;
  final String promoCode;
  final num promoDiscount;
  final String promoMessage;
  final double? lat;
  final double? lng;
  final num? deliveryFee;
  final num? billableDistanceKm;
  final String? deliveryError;
  final String? error;
  final bool validatingPromo;
  final bool sendingLocation;
  final bool deliveryLoading;
  final bool placingOrder;

  bool get deliveryCalculating => sendingLocation || deliveryLoading;

  bool get deliveryQuoted =>
      deliveryFee != null && !deliveryCalculating && deliveryError == null;

  CheckoutState copyWith({
    String? phone,
    String? promoCode,
    num? promoDiscount,
    String? promoMessage,
    double? lat,
    double? lng,
    num? deliveryFee,
    num? billableDistanceKm,
    String? deliveryError,
    String? error,
    bool? validatingPromo,
    bool? sendingLocation,
    bool? deliveryLoading,
    bool? placingOrder,
    bool clearDelivery = false,
    bool clearError = false,
  }) {
    return CheckoutState(
      phone: phone ?? this.phone,
      promoCode: promoCode ?? this.promoCode,
      promoDiscount: promoDiscount ?? this.promoDiscount,
      promoMessage: promoMessage ?? this.promoMessage,
      lat: clearDelivery ? null : (lat ?? this.lat),
      lng: clearDelivery ? null : (lng ?? this.lng),
      deliveryFee: clearDelivery ? null : (deliveryFee ?? this.deliveryFee),
      billableDistanceKm:
          clearDelivery ? null : (billableDistanceKm ?? this.billableDistanceKm),
      deliveryError: clearDelivery ? null : (deliveryError ?? this.deliveryError),
      error: clearError ? null : (error ?? this.error),
      validatingPromo: validatingPromo ?? this.validatingPromo,
      sendingLocation: sendingLocation ?? this.sendingLocation,
      deliveryLoading: deliveryLoading ?? this.deliveryLoading,
      placingOrder: placingOrder ?? this.placingOrder,
    );
  }
}

class CartItemModel {
  const CartItemModel({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.businessId,
    required this.businessName,
  });

  final String productId;
  final String name;
  final num price;
  final int quantity;
  final String businessId;
  final String businessName;

  num get lineTotal => price * quantity;

  CartItemModel copyWith({int? quantity}) {
    return CartItemModel(
      productId: productId,
      name: name,
      price: price,
      quantity: quantity ?? this.quantity,
      businessId: businessId,
      businessName: businessName,
    );
  }
}

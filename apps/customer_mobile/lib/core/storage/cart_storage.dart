import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import '../../shared/models/cart_item_model.dart';

const _cartItemsKey = 'foodapp_cart_items';
const _cartBusinessIdKey = 'foodapp_cart_business_id';

class CartStorage {
  CartStorage(this._prefs);

  final SharedPreferences _prefs;

  ({List<CartItemModel> items, String? businessId}) load() {
    final businessId = _prefs.getString(_cartBusinessIdKey);
    final raw = _prefs.getString(_cartItemsKey);
    if (raw == null || raw.isEmpty) {
      return (items: <CartItemModel>[], businessId: businessId);
    }
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      final items = list
          .whereType<Map>()
          .map((e) => _itemFromJson(Map<String, dynamic>.from(e)))
          .toList();
      return (items: items, businessId: businessId);
    } catch (_) {
      return (items: <CartItemModel>[], businessId: null);
    }
  }

  Future<void> save(List<CartItemModel> items, String? businessId) async {
    if (items.isEmpty) {
      await _prefs.remove(_cartItemsKey);
      await _prefs.remove(_cartBusinessIdKey);
      return;
    }
    final encoded = jsonEncode(items.map(_itemToJson).toList());
    await _prefs.setString(_cartItemsKey, encoded);
    if (businessId != null) {
      await _prefs.setString(_cartBusinessIdKey, businessId);
    }
  }

  Map<String, dynamic> _itemToJson(CartItemModel i) => {
        'productId': i.productId,
        'name': i.name,
        'price': i.price,
        'quantity': i.quantity,
        'businessId': i.businessId,
        'businessName': i.businessName,
      };

  CartItemModel _itemFromJson(Map<String, dynamic> json) => CartItemModel(
        productId: json['productId'] as String,
        name: json['name'] as String,
        price: json['price'] as num,
        quantity: (json['quantity'] as num).toInt(),
        businessId: json['businessId'] as String,
        businessName: json['businessName'] as String,
      );
}

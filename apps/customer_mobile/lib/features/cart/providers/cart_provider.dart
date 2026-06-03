import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/storage/cart_storage.dart';
import '../../../core/storage/storage_providers.dart';
import '../../../shared/models/cart_item_model.dart';

final cartStorageProvider = Provider<CartStorage>((ref) {
  return CartStorage(ref.watch(sharedPreferencesProvider));
});

final cartProvider = NotifierProvider<CartNotifier, List<CartItemModel>>(CartNotifier.new);

class CartNotifier extends Notifier<List<CartItemModel>> {
  String? _businessId;

  @override
  List<CartItemModel> build() {
    final saved = ref.read(cartStorageProvider).load();
    _businessId = saved.businessId;
    return saved.items;
  }

  Future<void> _persist() async {
    await ref.read(cartStorageProvider).save(state, _businessId);
  }

  String? get businessId => _businessId;

  void addItem({
    required String productId,
    required String name,
    required num price,
    required String businessId,
    required String businessName,
    int qty = 1,
  }) {
    if (_businessId != null && _businessId != businessId) {
      state = [];
    }
    _businessId = businessId;

    final existing = state.where((i) => i.productId == productId).firstOrNull;
    if (existing != null) {
      state = [
        for (final item in state)
          if (item.productId == productId)
            item.copyWith(quantity: item.quantity + qty)
          else
            item,
      ];
    } else {
      state = [
        ...state,
        CartItemModel(
          productId: productId,
          name: name,
          price: price,
          quantity: qty,
          businessId: businessId,
          businessName: businessName,
        ),
      ];
    }
    _persist();
  }

  void decrement(String productId) {
    final item = state.where((i) => i.productId == productId).firstOrNull;
    if (item == null) return;
    if (item.quantity <= 1) {
      remove(productId);
      return;
    }
    state = [
      for (final i in state)
        if (i.productId == productId) i.copyWith(quantity: i.quantity - 1) else i,
    ];
    _persist();
  }

  void remove(String productId) {
    state = state.where((i) => i.productId != productId).toList();
    if (state.isEmpty) _businessId = null;
    _persist();
  }

  void clear() {
    state = [];
    _businessId = null;
    _persist();
  }

  num get total => state.fold<num>(0, (s, i) => s + i.lineTotal);

  int get itemCount => state.fold(0, (s, i) => s + i.quantity);
}

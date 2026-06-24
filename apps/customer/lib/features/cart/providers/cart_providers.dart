import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../menu/domain/menu_models.dart';
import '../domain/cart_models.dart';

class CartController extends Notifier<Cart> {
  @override
  Cart build() => const Cart();

  void addItem({
    required String branchId,
    required MenuProduct product,
    required List<ModifierOption> modifierOptions,
    int quantity = 1,
    String? notes,
  }) {
    if (state.branchId != null && state.branchId != branchId) {
      state = Cart(branchId: branchId, lines: const <CartLine>[]);
    }
    final lineId = DateTime.now().microsecondsSinceEpoch.toString();
    state = state.copyWith(
      branchId: branchId,
      lines: <CartLine>[
        ...state.lines,
        CartLine(
          lineId: lineId,
          product: product,
          quantity: quantity,
          modifierOptions: modifierOptions,
          notes: notes,
        ),
      ],
    );
  }

  void removeLine(String lineId) {
    state = state.copyWith(
      lines: state.lines.where((line) => line.lineId != lineId).toList(growable: false),
    );
  }

  void updateQuantity(String lineId, int quantity) {
    if (quantity <= 0) {
      removeLine(lineId);
      return;
    }
    state = state.copyWith(
      lines: state.lines
          .map((line) => line.lineId == lineId ? line.copyWith(quantity: quantity) : line)
          .toList(growable: false),
    );
  }

  void clear() {
    state = const Cart();
  }
}

final NotifierProvider<CartController, Cart> cartControllerProvider =
    NotifierProvider<CartController, Cart>(CartController.new);

import '../../menu/domain/menu_models.dart';

class CartLine {
  CartLine({
    required this.lineId,
    required this.product,
    required this.quantity,
    required this.modifierOptions,
    this.notes,
  });

  final String lineId;
  final MenuProduct product;
  final int quantity;
  final List<ModifierOption> modifierOptions;
  final String? notes;

  double get modifiersDelta =>
      modifierOptions.fold<double>(0, (sum, m) => sum + m.priceDelta);

  double get unitPrice => product.price + modifiersDelta;

  double get lineTotal => unitPrice * quantity;

  CartLine copyWith({int? quantity, String? notes}) => CartLine(
        lineId: lineId,
        product: product,
        quantity: quantity ?? this.quantity,
        modifierOptions: modifierOptions,
        notes: notes ?? this.notes,
      );
}

class Cart {
  const Cart({this.branchId, this.lines = const <CartLine>[]});

  final String? branchId;
  final List<CartLine> lines;

  bool get isEmpty => lines.isEmpty;

  int get itemCount => lines.fold<int>(0, (sum, line) => sum + line.quantity);

  double get subtotal => lines.fold<double>(0, (sum, line) => sum + line.lineTotal);

  Cart copyWith({String? branchId, List<CartLine>? lines}) =>
      Cart(branchId: branchId ?? this.branchId, lines: lines ?? this.lines);
}

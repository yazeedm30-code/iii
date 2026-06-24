class OrderEvent {
  OrderEvent({required this.toStatus, this.fromStatus, this.note, this.createdAt});

  factory OrderEvent.fromJson(Map<String, dynamic> json) => OrderEvent(
        toStatus: json['toStatus'] as String,
        fromStatus: json['fromStatus'] as String?,
        note: json['note'] as String?,
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      );

  final String toStatus;
  final String? fromStatus;
  final String? note;
  final DateTime? createdAt;
}

class OrderLineItem {
  OrderLineItem({
    required this.id,
    required this.quantity,
    required this.unitPrice,
    required this.lineTotal,
    required this.snapshot,
    this.notes,
  });

  factory OrderLineItem.fromJson(Map<String, dynamic> json) => OrderLineItem(
        id: json['id'] as String,
        quantity: (json['quantity'] as num).toInt(),
        unitPrice: double.parse(json['unitPrice'].toString()),
        lineTotal: double.parse(json['lineTotal'].toString()),
        notes: json['notes'] as String?,
        snapshot: Map<String, dynamic>.from(json['snapshot'] as Map),
      );

  final String id;
  final int quantity;
  final double unitPrice;
  final double lineTotal;
  final String? notes;
  final Map<String, dynamic> snapshot;

  String get nameAr => snapshot['nameAr']?.toString() ?? snapshot['name']?.toString() ?? '';
  String? get imageUrl => snapshot['imageUrl'] as String?;
  List<dynamic> get modifiers => (snapshot['modifiers'] as List<dynamic>?) ?? const <dynamic>[];
}

class CustomerOrder {
  CustomerOrder({
    required this.id,
    required this.number,
    required this.status,
    required this.fulfillment,
    required this.subtotal,
    required this.taxAmount,
    required this.discountAmount,
    required this.totalAmount,
    required this.currency,
    required this.items,
    required this.events,
    required this.placedAt,
    this.scheduledFor,
    this.pickupCode,
    this.customerArrivedAt,
    this.acceptedAt,
    this.readyAt,
    this.handedOverAt,
    this.cancelledAt,
    this.notes,
  });

  factory CustomerOrder.fromJson(Map<String, dynamic> json) => CustomerOrder(
        id: json['id'] as String,
        number: json['number'] as String,
        status: json['status'] as String,
        fulfillment: json['fulfillment'] as String,
        subtotal: double.parse(json['subtotal'].toString()),
        taxAmount: double.parse(json['taxAmount'].toString()),
        discountAmount: double.parse(json['discountAmount'].toString()),
        totalAmount: double.parse(json['totalAmount'].toString()),
        currency: json['currency'] as String? ?? 'SAR',
        pickupCode: json['pickupCode'] as String?,
        notes: json['notes'] as String?,
        placedAt: DateTime.tryParse(json['placedAt']?.toString() ?? '') ?? DateTime.now(),
        scheduledFor: DateTime.tryParse(json['scheduledFor']?.toString() ?? ''),
        acceptedAt: DateTime.tryParse(json['acceptedAt']?.toString() ?? ''),
        readyAt: DateTime.tryParse(json['readyAt']?.toString() ?? ''),
        customerArrivedAt: DateTime.tryParse(json['customerArrivedAt']?.toString() ?? ''),
        handedOverAt: DateTime.tryParse(json['handedOverAt']?.toString() ?? ''),
        cancelledAt: DateTime.tryParse(json['cancelledAt']?.toString() ?? ''),
        items: ((json['items'] as List<dynamic>?) ?? const <dynamic>[])
            .map((item) => OrderLineItem.fromJson(item as Map<String, dynamic>))
            .toList(growable: false),
        events: ((json['events'] as List<dynamic>?) ?? const <dynamic>[])
            .map((e) => OrderEvent.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
      );

  final String id;
  final String number;
  final String status;
  final String fulfillment;
  final double subtotal;
  final double taxAmount;
  final double discountAmount;
  final double totalAmount;
  final String currency;
  final String? pickupCode;
  final String? notes;
  final DateTime placedAt;
  final DateTime? scheduledFor;
  final DateTime? acceptedAt;
  final DateTime? readyAt;
  final DateTime? customerArrivedAt;
  final DateTime? handedOverAt;
  final DateTime? cancelledAt;
  final List<OrderLineItem> items;
  final List<OrderEvent> events;
}

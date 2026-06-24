class LoyaltyTier {
  LoyaltyTier({required this.id, required this.name, required this.nameAr, required this.threshold});

  factory LoyaltyTier.fromJson(Map<String, dynamic> json) => LoyaltyTier(
        id: json['id'] as String,
        name: json['name'] as String,
        nameAr: json['nameAr'] as String,
        threshold: (json['threshold'] as num).toInt(),
      );

  final String id;
  final String name;
  final String nameAr;
  final int threshold;
}

class LoyaltyTransaction {
  LoyaltyTransaction({
    required this.id,
    required this.kind,
    required this.points,
    required this.balanceAfter,
    required this.createdAt,
    this.reference,
  });

  factory LoyaltyTransaction.fromJson(Map<String, dynamic> json) => LoyaltyTransaction(
        id: json['id'] as String,
        kind: json['kind'] as String,
        points: (json['points'] as num).toInt(),
        balanceAfter: (json['balanceAfter'] as num).toInt(),
        reference: json['reference'] as String?,
        createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      );

  final String id;
  final String kind;
  final int points;
  final int balanceAfter;
  final String? reference;
  final DateTime createdAt;
}

class LoyaltyOverview {
  LoyaltyOverview({
    required this.pointsBalance,
    required this.lifetimePoints,
    required this.pointsToNextTier,
    required this.recentTransactions,
    this.currentTier,
    this.nextTier,
  });

  factory LoyaltyOverview.fromJson(Map<String, dynamic> json) => LoyaltyOverview(
        pointsBalance: (json['pointsBalance'] as num? ?? 0).toInt(),
        lifetimePoints: (json['lifetimePoints'] as num? ?? 0).toInt(),
        pointsToNextTier: (json['pointsToNextTier'] as num? ?? 0).toInt(),
        currentTier: json['currentTier'] == null
            ? null
            : LoyaltyTier.fromJson(json['currentTier'] as Map<String, dynamic>),
        nextTier: json['nextTier'] == null
            ? null
            : LoyaltyTier.fromJson(json['nextTier'] as Map<String, dynamic>),
        recentTransactions: ((json['recentTransactions'] as List<dynamic>?) ?? const <dynamic>[])
            .map((t) => LoyaltyTransaction.fromJson(t as Map<String, dynamic>))
            .toList(growable: false),
      );

  final int pointsBalance;
  final int lifetimePoints;
  final int pointsToNextTier;
  final LoyaltyTier? currentTier;
  final LoyaltyTier? nextTier;
  final List<LoyaltyTransaction> recentTransactions;
}

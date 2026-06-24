class Branch {
  Branch({
    required this.id,
    required this.merchantId,
    required this.merchantName,
    required this.name,
    required this.nameAr,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.supportsDriveThru,
    required this.supportsPickup,
    required this.averagePrepMin,
    this.distanceMeters,
  });

  factory Branch.fromJson(Map<String, dynamic> json) => Branch(
        id: json['id'] as String,
        merchantId: json['merchantId'] as String,
        merchantName: json['merchantName'] as String? ?? '',
        name: json['name'] as String,
        nameAr: json['nameAr'] as String,
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        status: json['status'] as String,
        supportsDriveThru: json['supportsDriveThru'] == true,
        supportsPickup: json['supportsPickup'] == true,
        averagePrepMin: (json['averagePrepMin'] as num? ?? 5).toInt(),
        distanceMeters:
            json['distanceMeters'] == null ? null : (json['distanceMeters'] as num).toInt(),
      );

  final String id;
  final String merchantId;
  final String merchantName;
  final String name;
  final String nameAr;
  final double latitude;
  final double longitude;
  final String status;
  final bool supportsDriveThru;
  final bool supportsPickup;
  final int averagePrepMin;
  final int? distanceMeters;
}

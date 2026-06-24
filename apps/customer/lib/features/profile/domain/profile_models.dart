class CustomerProfile {
  CustomerProfile({
    required this.id,
    required this.firstName,
    required this.referralCode,
    required this.pointsBalance,
    required this.lifetimePoints,
    required this.gender,
    required this.marketingOptIn,
    this.lastName,
    this.displayName,
    this.avatarUrl,
  });

  factory CustomerProfile.fromJson(Map<String, dynamic> json) => CustomerProfile(
        id: json['id'] as String,
        firstName: json['firstName'] as String,
        lastName: json['lastName'] as String?,
        displayName: json['displayName'] as String?,
        gender: json['gender'] as String? ?? 'UNSPECIFIED',
        avatarUrl: json['avatarUrl'] as String?,
        pointsBalance: (json['pointsBalance'] as num? ?? 0).toInt(),
        lifetimePoints: (json['lifetimePoints'] as num? ?? 0).toInt(),
        referralCode: json['referralCode'] as String? ?? '',
        marketingOptIn: json['marketingOptIn'] == true,
      );

  final String id;
  final String firstName;
  final String? lastName;
  final String? displayName;
  final String gender;
  final String? avatarUrl;
  final int pointsBalance;
  final int lifetimePoints;
  final String referralCode;
  final bool marketingOptIn;
}

class Vehicle {
  Vehicle({
    required this.id,
    required this.make,
    required this.color,
    required this.plateNumber,
    required this.isDefault,
    this.model,
    this.plateLetters,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) => Vehicle(
        id: json['id'] as String,
        make: json['make'] as String,
        model: json['model'] as String?,
        color: json['color'] as String,
        plateNumber: json['plateNumber'] as String,
        plateLetters: json['plateLetters'] as String?,
        isDefault: json['isDefault'] == true,
      );

  final String id;
  final String make;
  final String? model;
  final String color;
  final String plateNumber;
  final String? plateLetters;
  final bool isDefault;
}

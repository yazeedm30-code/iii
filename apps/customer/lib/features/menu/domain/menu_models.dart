class MenuPayload {
  MenuPayload({required this.branchId, required this.categories});

  factory MenuPayload.fromJson(Map<String, dynamic> json) => MenuPayload(
        branchId: json['branchId'] as String,
        categories: (json['categories'] as List<dynamic>)
            .map((c) => MenuCategory.fromJson(c as Map<String, dynamic>))
            .toList(growable: false),
      );

  final String branchId;
  final List<MenuCategory> categories;
}

class MenuCategory {
  MenuCategory({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.products,
    this.imageUrl,
  });

  factory MenuCategory.fromJson(Map<String, dynamic> json) => MenuCategory(
        id: json['id'] as String,
        name: json['name'] as String,
        nameAr: json['nameAr'] as String,
        imageUrl: json['imageUrl'] as String?,
        products: (json['products'] as List<dynamic>)
            .map((p) => MenuProduct.fromJson(p as Map<String, dynamic>))
            .toList(growable: false),
      );

  final String id;
  final String name;
  final String nameAr;
  final String? imageUrl;
  final List<MenuProduct> products;
}

class MenuProduct {
  MenuProduct({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.price,
    required this.isAvailable,
    this.description,
    this.descriptionAr,
    this.imageUrl,
    this.calories,
    this.modifierGroups = const <ModifierGroup>[],
  });

  factory MenuProduct.fromJson(Map<String, dynamic> json) => MenuProduct(
        id: json['id'] as String,
        name: json['name'] as String,
        nameAr: json['nameAr'] as String,
        description: json['description'] as String?,
        descriptionAr: json['descriptionAr'] as String?,
        imageUrl: json['imageUrl'] as String?,
        price: (json['price'] as num).toDouble(),
        isAvailable: json['isAvailable'] != false,
        calories: json['calories'] == null ? null : (json['calories'] as num).toInt(),
        modifierGroups: ((json['modifierGroups'] as List<dynamic>?) ?? const <dynamic>[])
            .map((g) => ModifierGroup.fromJson(g as Map<String, dynamic>))
            .toList(growable: false),
      );

  final String id;
  final String name;
  final String nameAr;
  final String? description;
  final String? descriptionAr;
  final String? imageUrl;
  final double price;
  final bool isAvailable;
  final int? calories;
  final List<ModifierGroup> modifierGroups;
}

class ModifierGroup {
  ModifierGroup({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.minSelections,
    required this.maxSelections,
    required this.isRequired,
    required this.options,
  });

  factory ModifierGroup.fromJson(Map<String, dynamic> json) => ModifierGroup(
        id: json['id'] as String,
        name: json['name'] as String,
        nameAr: json['nameAr'] as String,
        minSelections: (json['minSelections'] as num).toInt(),
        maxSelections: (json['maxSelections'] as num).toInt(),
        isRequired: json['isRequired'] == true,
        options: (json['options'] as List<dynamic>)
            .map((o) => ModifierOption.fromJson(o as Map<String, dynamic>))
            .toList(growable: false),
      );

  final String id;
  final String name;
  final String nameAr;
  final int minSelections;
  final int maxSelections;
  final bool isRequired;
  final List<ModifierOption> options;
}

class ModifierOption {
  ModifierOption({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.priceDelta,
    required this.isDefault,
  });

  factory ModifierOption.fromJson(Map<String, dynamic> json) => ModifierOption(
        id: json['id'] as String,
        name: json['name'] as String,
        nameAr: json['nameAr'] as String,
        priceDelta: (json['priceDelta'] as num).toDouble(),
        isDefault: json['isDefault'] == true,
      );

  final String id;
  final String name;
  final String nameAr;
  final double priceDelta;
  final bool isDefault;
}

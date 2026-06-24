import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/menu_api.dart';
import '../domain/menu_models.dart';

final Provider<MenuApi> menuApiProvider =
    Provider<MenuApi>((ref) => MenuApi(ref.watch(apiClientProvider)));

final FutureProviderFamily<MenuPayload, String> branchMenuProvider =
    FutureProvider.family<MenuPayload, String>((ref, branchId) {
  return ref.watch(menuApiProvider).getMenu(branchId);
});

class ProductLookup {
  const ProductLookup({required this.branchId, required this.productId});
  final String branchId;
  final String productId;
}

final FutureProviderFamily<MenuProduct, ProductLookup> productProvider =
    FutureProvider.family<MenuProduct, ProductLookup>((ref, lookup) {
  return ref.watch(menuApiProvider).getProduct(lookup.branchId, lookup.productId);
});

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/branches_api.dart';
import '../domain/branch.dart';

class NearbyQuery {
  const NearbyQuery({this.latitude, this.longitude});
  final double? latitude;
  final double? longitude;
}

final Provider<BranchesApi> branchesApiProvider =
    Provider<BranchesApi>((ref) => BranchesApi(ref.watch(apiClientProvider)));

final FutureProviderFamily<List<Branch>, NearbyQuery> branchesProvider =
    FutureProvider.family<List<Branch>, NearbyQuery>((ref, query) {
  return ref.watch(branchesApiProvider).list(
        latitude: query.latitude,
        longitude: query.longitude,
      );
});

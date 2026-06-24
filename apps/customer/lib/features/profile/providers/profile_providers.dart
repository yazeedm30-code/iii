import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/profile_api.dart';
import '../domain/profile_models.dart';

final Provider<ProfileApi> profileApiProvider =
    Provider<ProfileApi>((ref) => ProfileApi(ref.watch(apiClientProvider)));

final FutureProvider<CustomerProfile> customerProfileProvider =
    FutureProvider<CustomerProfile>((ref) => ref.watch(profileApiProvider).getProfile());

final FutureProvider<List<Vehicle>> customerVehiclesProvider =
    FutureProvider<List<Vehicle>>((ref) => ref.watch(profileApiProvider).listVehicles());

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/loyalty_api.dart';
import '../domain/loyalty_models.dart';

final Provider<LoyaltyApi> loyaltyApiProvider =
    Provider<LoyaltyApi>((ref) => LoyaltyApi(ref.watch(apiClientProvider)));

final FutureProvider<LoyaltyOverview> loyaltyOverviewProvider =
    FutureProvider<LoyaltyOverview>((ref) => ref.watch(loyaltyApiProvider).overview());

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/async_value_view.dart';
import '../domain/loyalty_models.dart';
import '../providers/loyalty_providers.dart';

class LoyaltyScreen extends ConsumerWidget {
  const LoyaltyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overview = ref.watch(loyaltyOverviewProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('الولاء والمكافآت')),
      body: AsyncValueView<LoyaltyOverview>(
        value: overview,
        onRetry: () => ref.invalidate(loyaltyOverviewProvider),
        data: (data) {
          final next = data.nextTier;
          final progress = next == null || next.threshold == 0
              ? 1.0
              : (data.lifetimePoints / next.threshold).clamp(0.0, 1.0);
          return ListView(
            padding: const EdgeInsets.all(16),
            children: <Widget>[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text('نقاطك الحالية'),
                      const SizedBox(height: 8),
                      Text(
                        '${data.pointsBalance}',
                        style: Theme.of(context).textTheme.displaySmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(value: progress, minHeight: 8),
                      const SizedBox(height: 8),
                      if (next != null)
                        Text(
                          '${data.pointsToNextTier} نقطة للوصول إلى ${next.nameAr}',
                        )
                      else
                        const Text('وصلت للمستوى الأعلى!'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (data.currentTier != null)
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.workspace_premium),
                    title: Text('مستواك الحالي: ${data.currentTier!.nameAr}'),
                    subtitle: Text('${data.lifetimePoints} نقطة مدى الحياة'),
                  ),
                ),
              const SizedBox(height: 16),
              if (data.recentTransactions.isNotEmpty) ...<Widget>[
                Text('آخر المعاملات',
                    style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 8),
                for (final tx in data.recentTransactions)
                  Card(
                    child: ListTile(
                      leading: Icon(
                        tx.points >= 0 ? Icons.add : Icons.remove,
                        color: tx.points >= 0 ? Colors.green : Colors.redAccent,
                      ),
                      title: Text(_labelFor(tx.kind)),
                      subtitle: Text(tx.createdAt.toLocal().toString().substring(0, 19)),
                      trailing: Text(
                        '${tx.points > 0 ? '+' : ''}${tx.points}',
                        style: TextStyle(
                          color: tx.points >= 0 ? Colors.green : Colors.redAccent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
              ],
            ],
          );
        },
      ),
    );
  }

  String _labelFor(String kind) {
    switch (kind) {
      case 'EARN':
        return 'نقاط مكتسبة';
      case 'REDEEM':
        return 'استبدال نقاط';
      case 'REFERRAL_BONUS':
        return 'مكافأة إحالة';
      case 'EXPIRE':
        return 'انتهاء صلاحية';
      default:
        return kind;
    }
  }
}

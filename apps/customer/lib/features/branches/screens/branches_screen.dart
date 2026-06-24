import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/widgets/async_value_view.dart';
import '../domain/branch.dart';
import '../providers/branches_providers.dart';

class BranchesScreen extends ConsumerWidget {
  const BranchesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    const query = NearbyQuery(latitude: 24.7136, longitude: 46.6753);
    final branches = ref.watch(branchesProvider(query));

    return Scaffold(
      appBar: AppBar(
        title: const Text('الفروع القريبة'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(branchesProvider(query)),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(branchesProvider(query));
          await ref.read(branchesProvider(query).future);
        },
        child: AsyncValueView<List<Branch>>(
          value: branches,
          onRetry: () => ref.invalidate(branchesProvider(query)),
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('لا توجد فروع متاحة حالياً'));
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final branch = items[i];
                return _BranchCard(
                  branch: branch,
                  onTap: () => context.push('/branches/${branch.id}/menu'),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _BranchCard extends StatelessWidget {
  const _BranchCard({required this.branch, required this.onTap});

  final Branch branch;
  final VoidCallback onTap;

  String get _distanceLabel {
    final d = branch.distanceMeters;
    if (d == null) return '';
    if (d < 1000) return '$d م';
    return '${(d / 1000).toStringAsFixed(1)} كم';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: <Widget>[
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.local_cafe, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(branch.merchantName, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text(branch.nameAr),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 8,
                      children: <Widget>[
                        if (_distanceLabel.isNotEmpty)
                          Text(
                            'يبعد $_distanceLabel',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        Text('· انتظار ${branch.averagePrepMin} د',
                            style: Theme.of(context).textTheme.bodySmall),
                        if (branch.supportsDriveThru)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('من السيارة',
                                style: TextStyle(fontSize: 11, color: Colors.green)),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_left),
            ],
          ),
        ),
      ),
    );
  }
}

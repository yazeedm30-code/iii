import 'package:flutter/material.dart';

class LoyaltyScreen extends StatelessWidget {
  const LoyaltyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الولاء والمكافآت')),
      body: ListView(
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
                  Text('850',
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          )),
                  const SizedBox(height: 8),
                  const LinearProgressIndicator(value: 0.65, minHeight: 8),
                  const SizedBox(height: 8),
                  const Text('150 نقطة للوصول إلى مستوى ذهبي'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              leading: const Icon(Icons.qr_code_2),
              title: const Text('كوبون ترحيبي 10%'),
              subtitle: const Text('ينتهي خلال 7 أيام'),
            ),
          ),
        ],
      ),
    );
  }
}

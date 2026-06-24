import 'package:flutter/material.dart';

class OrderTrackingScreen extends StatelessWidget {
  const OrderTrackingScreen({super.key, required this.orderId});

  final String orderId;

  static const List<String> _steps = <String>[
    'تم استلام الطلب',
    'تم قبول الطلب',
    'جاري التحضير',
    'جاهز للاستلام',
    'تم التسليم',
  ];

  @override
  Widget build(BuildContext context) {
    const int currentStep = 2;
    return Scaffold(
      appBar: AppBar(title: Text('تتبع الطلب #$orderId')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text('رمز الاستلام'),
                  const SizedBox(height: 8),
                  Text(
                    '4821',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          letterSpacing: 8,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                children: List<Widget>.generate(_steps.length, (i) {
                  final bool done = i <= currentStep;
                  return ListTile(
                    leading: Icon(
                      done ? Icons.check_circle : Icons.radio_button_unchecked,
                      color: done ? Theme.of(context).colorScheme.primary : null,
                    ),
                    title: Text(_steps[i]),
                  );
                }),
              ),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.directions_car_filled_outlined),
            label: const Text('وصلت للموقع'),
          ),
        ],
      ),
    );
  }
}

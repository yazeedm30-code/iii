import 'package:flutter/material.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('استكمال الحساب')),
      body: const Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            TextField(decoration: InputDecoration(labelText: 'الاسم الأول')),
            SizedBox(height: 16),
            TextField(decoration: InputDecoration(labelText: 'الاسم الأخير')),
            SizedBox(height: 16),
            TextField(decoration: InputDecoration(labelText: 'رمز الإحالة (اختياري)')),
          ],
        ),
      ),
    );
  }
}

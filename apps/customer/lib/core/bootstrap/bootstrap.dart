import 'package:flutter/widgets.dart';

Future<void> bootstrap() async {
  // Initialize Firebase, Sentry, etc. here as integrations come online.
  WidgetsBinding.instance.deferFirstFrame();
  WidgetsBinding.instance.allowFirstFrame();
}

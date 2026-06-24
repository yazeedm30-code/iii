String formatCurrency(double value, {String currency = 'SAR'}) {
  final symbol = currency == 'SAR' ? 'ر.س' : currency;
  return '${value.toStringAsFixed(2)} $symbol';
}

String formatPrice(double value) => value.toStringAsFixed(value.truncateToDouble() == value ? 0 : 2);

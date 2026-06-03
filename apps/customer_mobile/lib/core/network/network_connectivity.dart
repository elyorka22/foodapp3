import 'package:connectivity_plus/connectivity_plus.dart';

/// Returns false when device reports no network interface.
Future<bool> hasNetworkConnection() async {
  final results = await Connectivity().checkConnectivity();
  if (results.isEmpty) return false;
  return !results.every((r) => r == ConnectivityResult.none);
}

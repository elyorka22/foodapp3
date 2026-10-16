import 'package:dio/dio.dart';

/// No-op on platforms without `dart:io` (e.g. web).
void configureNativeHttpClient(Dio dio) {}

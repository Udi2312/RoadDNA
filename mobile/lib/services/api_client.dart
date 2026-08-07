import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:roaddna_mobile/models/payloads.dart';
import 'package:roaddna_mobile/services/settings.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  Uri _uri(String path) {
    final base = AppSettings.instance.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    return Uri.parse('$base$path');
  }

  Future<Map<String, dynamic>> postSensorEvent(SensorEventPayload payload) async {
    final res = await http
        .post(
          _uri('/api/v1/sensor-events'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload.toJson()),
        )
        .timeout(const Duration(seconds: 12));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('sensor-events ${res.statusCode}: ${res.body}');
    }
    if (res.body.isEmpty) {
      return {'ok': true, 'event_id': 'unknown'};
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> postCitizenReport(
    CitizenReportPayload payload,
  ) async {
    final res = await http
        .post(
          _uri('/api/v1/citizen-reports'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload.toJson()),
        )
        .timeout(const Duration(seconds: 20));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('citizen-reports ${res.statusCode}: ${res.body}');
    }
    if (res.body.isEmpty) {
      return {'ok': true, 'report_id': 'unknown'};
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}

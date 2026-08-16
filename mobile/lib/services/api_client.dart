import 'dart:convert';
import 'dart:math';
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

  Map<String, dynamic> _eventJson(SensorEventPayload payload) {
    final mag = sqrt(
      payload.accelX * payload.accelX +
          payload.accelY * payload.accelY +
          payload.accelZ * payload.accelZ,
    );
    return {
      ...payload.toJson(),
      'accel_magnitude': mag,
    };
  }

  /// Backend expects `{ "events": [ ... ] }` (batch, max 50).
  Future<Map<String, dynamic>> postSensorEvent(SensorEventPayload payload) async {
    return postSensorEvents([payload]);
  }

  Future<Map<String, dynamic>> postSensorEvents(
    List<SensorEventPayload> payloads,
  ) async {
    final res = await http
        .post(
          _uri('/sensor-events'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'events': payloads.map(_eventJson).toList(),
          }),
        )
        .timeout(const Duration(seconds: 12));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('sensor-events ${res.statusCode}: ${res.body}');
    }
    if (res.body.isEmpty) {
      return {'success': true};
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> postCitizenReport(
    CitizenReportPayload payload,
  ) async {
    final body = Map<String, dynamic>.from(payload.toJson())
      ..removeWhere((_, v) => v == null);

    final res = await http
        .post(
          _uri('/citizen-reports'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 20));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('citizen-reports ${res.statusCode}: ${res.body}');
    }
    if (res.body.isEmpty) {
      return {'success': true};
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}

import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:roaddna_mobile/models/payloads.dart';
import 'package:roaddna_mobile/services/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineQueue {
  OfflineQueue._();
  static final OfflineQueue instance = OfflineQueue._();

  static const _key = 'sensor_event_queue';
  final List<SensorEventPayload> _queue = [];
  final List<String> history = [];

  List<SensorEventPayload> get pending => List.unmodifiable(_queue);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_key) ?? [];
    _queue
      ..clear()
      ..addAll(
        raw.map(
          (s) => SensorEventPayload.fromJson(
            jsonDecode(s) as Map<String, dynamic>,
          ),
        ),
      );
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _key,
      _queue.map((e) => jsonEncode(e.toJson())).toList(),
    );
  }

  Future<void> enqueue(SensorEventPayload event) async {
    _queue.add(event);
    await _persist();
  }

  Future<int> flush() async {
    final connectivity = await Connectivity().checkConnectivity();
    final offline = connectivity.every((c) => c == ConnectivityResult.none);
    if (offline || _queue.isEmpty) return 0;

    var sent = 0;
    final remaining = <SensorEventPayload>[];
    for (final event in List<SensorEventPayload>.from(_queue)) {
      try {
        await ApiClient.instance.postSensorEvent(event);
        sent += 1;
        history.insert(
          0,
          '${event.timestamp} · spike sent (${event.latitude.toStringAsFixed(4)}, ${event.longitude.toStringAsFixed(4)})',
        );
        if (history.length > 50) history.removeLast();
      } catch (_) {
        remaining.add(event);
      }
    }
    _queue
      ..clear()
      ..addAll(remaining);
    await _persist();
    return sent;
  }
}

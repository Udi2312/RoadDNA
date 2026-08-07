import 'dart:async';
import 'dart:math';
import 'package:geolocator/geolocator.dart';
import 'package:roaddna_mobile/models/payloads.dart';
import 'package:roaddna_mobile/services/offline_queue.dart';
import 'package:roaddna_mobile/services/settings.dart';
import 'package:sensors_plus/sensors_plus.dart';

/// Local spike detector: only enqueue suspicious vertical accel events.
class SensorMonitor {
  SensorMonitor._();
  static final SensorMonitor instance = SensorMonitor._();

  static const spikeThresholdMs2 = 16.0;
  static const cooldown = Duration(seconds: 3);

  StreamSubscription<AccelerometerEvent>? _accelSub;
  StreamSubscription<GyroscopeEvent>? _gyroSub;
  Timer? _gpsTimer;

  AccelerometerEvent? _lastAccel;
  GyroscopeEvent? _lastGyro;
  Position? _lastPosition;
  DateTime? _lastSpikeAt;

  bool running = false;
  int spikesDetected = 0;
  String status = 'Idle';

  final _listeners = <void Function()>[];

  void addListener(void Function() fn) => _listeners.add(fn);
  void removeListener(void Function() fn) => _listeners.remove(fn);
  void _notify() {
    for (final fn in List.of(_listeners)) {
      fn();
    }
  }

  Future<bool> ensurePermissions() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      status = 'Location permission denied';
      _notify();
      return false;
    }
    final enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) {
      status = 'GPS disabled';
      _notify();
      return false;
    }
    return true;
  }

  Future<void> start() async {
    if (running) return;
    final ok = await ensurePermissions();
    if (!ok) return;

    running = true;
    status = 'Monitoring';
    spikesDetected = 0;
    _notify();

    _accelSub = accelerometerEventStream().listen((event) {
      _lastAccel = event;
      _maybeDetectSpike();
    });

    _gyroSub = gyroscopeEventStream().listen((event) {
      _lastGyro = event;
    });

    _gpsTimer = Timer.periodic(const Duration(seconds: 2), (_) async {
      try {
        _lastPosition = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
          ),
        );
        _notify();
      } catch (_) {
        // keep last known position
      }
    });
  }

  Future<void> stop() async {
    running = false;
    status = 'Stopped';
    await _accelSub?.cancel();
    await _gyroSub?.cancel();
    _gpsTimer?.cancel();
    _accelSub = null;
    _gyroSub = null;
    _gpsTimer = null;
    _notify();
    await OfflineQueue.instance.flush();
  }

  void _maybeDetectSpike() {
    final accel = _lastAccel;
    if (accel == null) return;

    // Magnitude of acceleration; large deviation from ~9.8 suggests a jolt.
    final mag = sqrt(
      accel.x * accel.x + accel.y * accel.y + accel.z * accel.z,
    );
    if (mag < spikeThresholdMs2) return;

    final now = DateTime.now().toUtc();
    if (_lastSpikeAt != null && now.difference(_lastSpikeAt!) < cooldown) {
      return;
    }
    _lastSpikeAt = now;

    final pos = _lastPosition;
    final gyro = _lastGyro;
    final speedMs = pos?.speed ?? 0;
    final event = SensorEventPayload(
      deviceId: AppSettings.instance.deviceId,
      timestamp: now.toIso8601String(),
      latitude: pos?.latitude ?? 0,
      longitude: pos?.longitude ?? 0,
      speedKmh: speedMs * 3.6,
      accelX: accel.x,
      accelY: accel.y,
      accelZ: accel.z,
      gyroX: gyro?.x ?? 0,
      gyroY: gyro?.y ?? 0,
      gyroZ: gyro?.z ?? 0,
    );

    spikesDetected += 1;
    status = 'Spike queued (#$spikesDetected)';
    OfflineQueue.instance.enqueue(event).then((_) {
      OfflineQueue.instance.flush();
      _notify();
    });
    _notify();
  }
}

import 'package:flutter_test/flutter_test.dart';
import 'package:roaddna_mobile/models/payloads.dart';

void main() {
  test('SensorEventPayload matches API contract keys', () {
    final payload = SensorEventPayload(
      deviceId: 'dev_0033',
      timestamp: '2026-08-06T09:15:40Z',
      latitude: 28.6139,
      longitude: 77.2090,
      speedKmh: 34.5,
      accelX: -0.42,
      accelY: 0.18,
      accelZ: -21.3,
      gyroX: 0.06,
      gyroY: -0.12,
      gyroZ: 0.02,
    );

    final json = payload.toJson();
    expect(json.keys, containsAll([
      'device_id',
      'timestamp',
      'latitude',
      'longitude',
      'speed_kmh',
      'accel_x',
      'accel_y',
      'accel_z',
      'gyro_x',
      'gyro_y',
      'gyro_z',
    ]));
  });
}

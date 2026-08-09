import 'package:flutter_test/flutter_test.dart';
import 'package:roaddna_mobile/models/payloads.dart';
// CitizenReportPayload is in the same library as SensorEventPayload.

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

  test('CitizenReportPayload uses photo_url', () {
    final json = CitizenReportPayload(
      deviceId: 'dev_0001',
      latitude: 28.6139,
      longitude: 77.2090,
      description: 'Large pothole',
      photoUrl: 'https://example.com/photo.jpg',
    ).toJson();
    expect(json.containsKey('photo_url'), isTrue);
    expect(json.containsKey('photo_base64'), isFalse);
  });
}

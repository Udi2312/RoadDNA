class SensorEventPayload {
  SensorEventPayload({
    required this.deviceId,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    required this.speedKmh,
    required this.accelX,
    required this.accelY,
    required this.accelZ,
    required this.gyroX,
    required this.gyroY,
    required this.gyroZ,
  });

  final String deviceId;
  final String timestamp;
  final double latitude;
  final double longitude;
  final double speedKmh;
  final double accelX;
  final double accelY;
  final double accelZ;
  final double gyroX;
  final double gyroY;
  final double gyroZ;

  Map<String, dynamic> toJson() => {
        'device_id': deviceId,
        'timestamp': timestamp,
        'latitude': latitude,
        'longitude': longitude,
        'speed_kmh': speedKmh,
        'accel_x': accelX,
        'accel_y': accelY,
        'accel_z': accelZ,
        'gyro_x': gyroX,
        'gyro_y': gyroY,
        'gyro_z': gyroZ,
      };

  factory SensorEventPayload.fromJson(Map<String, dynamic> json) {
    return SensorEventPayload(
      deviceId: json['device_id'] as String,
      timestamp: json['timestamp'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      speedKmh: (json['speed_kmh'] as num).toDouble(),
      accelX: (json['accel_x'] as num).toDouble(),
      accelY: (json['accel_y'] as num).toDouble(),
      accelZ: (json['accel_z'] as num).toDouble(),
      gyroX: (json['gyro_x'] as num).toDouble(),
      gyroY: (json['gyro_y'] as num).toDouble(),
      gyroZ: (json['gyro_z'] as num).toDouble(),
    );
  }
}

class CitizenReportPayload {
  CitizenReportPayload({
    required this.deviceId,
    required this.latitude,
    required this.longitude,
    required this.description,
    this.photoUrl,
  });

  final String deviceId;
  final double latitude;
  final double longitude;
  final String description;
  final String? photoUrl;

  Map<String, dynamic> toJson() => {
        'device_id': deviceId,
        'latitude': latitude,
        'longitude': longitude,
        'description': description,
        'photo_url': photoUrl,
      };
}

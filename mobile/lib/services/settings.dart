import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class AppSettings {
  AppSettings._();
  static final AppSettings instance = AppSettings._();

  static const defaultBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api/v1',
  );

  late SharedPreferences _prefs;
  late String deviceId;
  late String apiBaseUrl;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    deviceId = _prefs.getString('device_id') ?? 'dev_${const Uuid().v4().substring(0, 8)}';
    apiBaseUrl = _prefs.getString('api_base_url') ?? defaultBaseUrl;
    await _prefs.setString('device_id', deviceId);
  }

  Future<void> setApiBaseUrl(String url) async {
    apiBaseUrl = url;
    await _prefs.setString('api_base_url', url);
  }
}

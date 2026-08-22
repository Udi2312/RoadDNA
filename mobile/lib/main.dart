import 'package:flutter/material.dart';
import 'package:roaddna_mobile/app.dart';
import 'package:roaddna_mobile/services/offline_queue.dart';
import 'package:roaddna_mobile/services/settings.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppSettings.instance.load();
  await OfflineQueue.instance.load();
  runApp(const RoadDnaApp());
}

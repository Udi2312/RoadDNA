import 'package:flutter/material.dart';
import 'package:roaddna_mobile/screens/home_screen.dart';
import 'package:roaddna_mobile/screens/monitor_screen.dart';
import 'package:roaddna_mobile/screens/report_screen.dart';
import 'package:roaddna_mobile/screens/history_screen.dart';
import 'package:roaddna_mobile/theme.dart';

class RoadDnaApp extends StatelessWidget {
  const RoadDnaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RoadDNA',
      debugShowCheckedModeBanner: false,
      theme: RoadDnaTheme.light,
      darkTheme: RoadDnaTheme.dark,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
      routes: {
        MonitorScreen.route: (_) => const MonitorScreen(),
        ReportScreen.route: (_) => const ReportScreen(),
        HistoryScreen.route: (_) => const HistoryScreen(),
      },
    );
  }
}

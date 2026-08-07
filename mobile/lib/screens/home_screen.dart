import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:roaddna_mobile/screens/history_screen.dart';
import 'package:roaddna_mobile/screens/monitor_screen.dart';
import 'package:roaddna_mobile/screens/report_screen.dart';
import 'package:roaddna_mobile/services/offline_queue.dart';
import 'package:roaddna_mobile/services/settings.dart';
import 'package:roaddna_mobile/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool? gpsEnabled;
  String? positionLabel;

  @override
  void initState() {
    super.initState();
    _refreshStatus();
  }

  Future<void> _refreshStatus() async {
    final enabled = await Geolocator.isLocationServiceEnabled();
    String? label;
    try {
      final pos = await Geolocator.getLastKnownPosition();
      if (pos != null) {
        label =
            '${pos.latitude.toStringAsFixed(4)}, ${pos.longitude.toStringAsFixed(4)}';
      }
    } catch (_) {}
    if (!mounted) return;
    setState(() {
      gpsEnabled = enabled;
      positionLabel = label;
    });
  }

  @override
  Widget build(BuildContext context) {
    final pending = OfflineQueue.instance.pending.length;
    return Scaffold(
      appBar: AppBar(
        title: const Text('RoadDNA'),
        actions: [
          IconButton(
            tooltip: 'API settings',
            onPressed: _editApiBase,
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Citizen sensing',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Monitor roads passively, queue spikes offline, and sync when online.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 20),
          _StatusCard(
            title: 'Device',
            value: AppSettings.instance.deviceId,
            icon: Icons.smartphone,
          ),
          _StatusCard(
            title: 'GPS',
            value: gpsEnabled == null
                ? 'Checking…'
                : gpsEnabled!
                    ? (positionLabel ?? 'Enabled')
                    : 'Disabled',
            icon: Icons.gps_fixed,
            tone: gpsEnabled == true ? Colors.green : Colors.orange,
          ),
          _StatusCard(
            title: 'Offline queue',
            value: '$pending event${pending == 1 ? '' : 's'} pending',
            icon: Icons.cloud_upload_outlined,
          ),
          _StatusCard(
            title: 'API',
            value: AppSettings.instance.apiBaseUrl,
            icon: Icons.link,
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: () =>
                Navigator.of(context).pushNamed(MonitorScreen.route),
            icon: const Icon(Icons.play_arrow_rounded),
            label: const Text('Start monitoring'),
            style: FilledButton.styleFrom(
              backgroundColor: RoadDnaTheme.accent,
              minimumSize: const Size.fromHeight(48),
            ),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () =>
                Navigator.of(context).pushNamed(ReportScreen.route),
            icon: const Icon(Icons.photo_camera_outlined),
            label: const Text('Manual report'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(48),
            ),
          ),
          const SizedBox(height: 10),
          TextButton.icon(
            onPressed: () =>
                Navigator.of(context).pushNamed(HistoryScreen.route),
            icon: const Icon(Icons.history),
            label: const Text('History & sync'),
          ),
        ],
      ),
    );
  }

  Future<void> _editApiBase() async {
    final controller =
        TextEditingController(text: AppSettings.instance.apiBaseUrl);
    final next = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('API base URL'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'http://10.0.2.2:3001',
            helperText:
                'Android emulator → 10.0.2.2:3001\nPhysical device → your LAN IP',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (next != null && next.isNotEmpty) {
      await AppSettings.instance.setApiBaseUrl(next);
      setState(() {});
    }
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({
    required this.title,
    required this.value,
    required this.icon,
    this.tone,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color? tone;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon, color: tone ?? RoadDnaTheme.accent),
        title: Text(title),
        subtitle: Text(value),
      ),
    );
  }
}

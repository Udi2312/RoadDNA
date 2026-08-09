import 'package:flutter/material.dart';
import 'package:roaddna_mobile/services/offline_queue.dart';
import 'package:roaddna_mobile/services/sensor_monitor.dart';
import 'package:roaddna_mobile/theme.dart';

class MonitorScreen extends StatefulWidget {
  const MonitorScreen({super.key});
  static const route = '/monitor';

  @override
  State<MonitorScreen> createState() => _MonitorScreenState();
}

class _MonitorScreenState extends State<MonitorScreen> {
  final monitor = SensorMonitor.instance;

  @override
  void initState() {
    super.initState();
    monitor.addListener(_onUpdate);
  }

  @override
  void dispose() {
    monitor.removeListener(_onUpdate);
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final pending = OfflineQueue.instance.pending.length;
    return Scaffold(
      appBar: AppBar(title: const Text('Trip monitoring')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Icon(
                      monitor.running
                          ? Icons.sensors
                          : Icons.sensors_off_outlined,
                      size: 48,
                      color: monitor.running
                          ? RoadDnaTheme.accent
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      monitor.status,
                      style: Theme.of(context).textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Spikes detected: ${monitor.spikesDetected}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    Text(
                      'Queued offline: $pending',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Only local spikes above ${SensorMonitor.spikeThresholdMs2.toStringAsFixed(0)} m/s² are packaged into the API contract JSON and queued. Sync runs automatically when the network is available.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const Spacer(),
            if (!monitor.running)
              FilledButton(
                onPressed: () async {
                  await monitor.start();
                },
                style: FilledButton.styleFrom(
                  backgroundColor: RoadDnaTheme.accent,
                  minimumSize: const Size.fromHeight(52),
                ),
                child: const Text('Start monitoring'),
              )
            else
              FilledButton(
                onPressed: () async {
                  await monitor.stop();
                },
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.red.shade700,
                  minimumSize: const Size.fromHeight(52),
                ),
                child: const Text('Stop monitoring'),
              ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: () async {
                final sent = await OfflineQueue.instance.flush();
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Synced $sent event(s)')),
                );
                setState(() {});
              },
              child: const Text('Sync queue now'),
            ),
          ],
        ),
      ),
    );
  }
}

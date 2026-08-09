import 'package:flutter/material.dart';
import 'package:roaddna_mobile/services/offline_queue.dart';
import 'package:roaddna_mobile/theme.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  static const route = '/history';

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  bool _syncing = false;

  Future<void> _sync() async {
    setState(() => _syncing = true);
    final sent = await OfflineQueue.instance.flush();
    if (!mounted) return;
    setState(() => _syncing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Synced $sent event(s)')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pending = OfflineQueue.instance.pending;
    final history = OfflineQueue.instance.history;

    return Scaffold(
      appBar: AppBar(
        title: const Text('History & sync'),
        actions: [
          IconButton(
            onPressed: _syncing ? null : _sync,
            icon: _syncing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.sync),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Pending offline events',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          if (pending.isEmpty)
            const Card(
              child: ListTile(
                leading: Icon(Icons.check_circle_outline, color: RoadDnaTheme.accent),
                title: Text('Queue empty'),
                subtitle: Text('All captured spikes are synced or none yet.'),
              ),
            )
          else
            ...pending.map(
              (e) => Card(
                child: ListTile(
                  title: Text(e.timestamp),
                  subtitle: Text(
                    '${e.latitude.toStringAsFixed(4)}, ${e.longitude.toStringAsFixed(4)} · ${e.speedKmh.toStringAsFixed(1)} km/h',
                  ),
                ),
              ),
            ),
          const SizedBox(height: 20),
          Text(
            'Recently synced',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          if (history.isEmpty)
            const Text('No synced events yet.')
          else
            ...history.map(
              (line) => ListTile(
                dense: true,
                leading: const Icon(Icons.cloud_done_outlined, size: 18),
                title: Text(line, style: const TextStyle(fontSize: 13)),
              ),
            ),
        ],
      ),
    );
  }
}

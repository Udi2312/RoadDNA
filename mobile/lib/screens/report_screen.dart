import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:roaddna_mobile/models/payloads.dart';
import 'package:roaddna_mobile/services/api_client.dart';
import 'package:roaddna_mobile/services/settings.dart';
import 'package:roaddna_mobile/theme.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});
  static const route = '/report';

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final _desc = TextEditingController();
  Uint8List? _photoBytes;
  double? _lat;
  double? _lng;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadLocation();
  }

  @override
  void dispose() {
    _desc.dispose();
    super.dispose();
  }

  Future<void> _loadLocation() async {
    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return;
    }
    final pos = await Geolocator.getCurrentPosition();
    if (!mounted) return;
    setState(() {
      _lat = pos.latitude;
      _lng = pos.longitude;
    });
  }

  Future<void> _pickPhoto() async {
    final file = await ImagePicker().pickImage(
      source: ImageSource.camera,
      imageQuality: 70,
      maxWidth: 1280,
    );
    if (file == null) return;
    final bytes = await file.readAsBytes();
    setState(() => _photoBytes = bytes);
  }

  Future<void> _submit() async {
    if (_lat == null || _lng == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Waiting for GPS location')),
      );
      return;
    }
    if (_desc.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add a short description')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final payload = CitizenReportPayload(
        deviceId: AppSettings.instance.deviceId,
        latitude: _lat!,
        longitude: _lng!,
        description: _desc.text.trim(),
        // Phase 1/2 contract expects photo_url; data URI used until upload service exists.
        photoUrl: _photoBytes == null
            ? null
            : 'data:image/jpeg;base64,${base64Encode(_photoBytes!)}',
      );
      final res = await ApiClient.instance.postCitizenReport(payload);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Report submitted (${res['report_id'] ?? 'ok'})'),
        ),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submit failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manual report')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _desc,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
              hintText: 'Large pothole near hostel gate',
            ),
          ),
          const SizedBox(height: 12),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.place_outlined),
            title: const Text('Location'),
            subtitle: Text(
              _lat == null
                  ? 'Acquiring GPS…'
                  : '${_lat!.toStringAsFixed(5)}, ${_lng!.toStringAsFixed(5)}',
            ),
            trailing: IconButton(
              onPressed: _loadLocation,
              icon: const Icon(Icons.refresh),
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _pickPhoto,
            icon: const Icon(Icons.photo_camera_outlined),
            label: Text(_photoBytes == null ? 'Add photo' : 'Retake photo'),
          ),
          if (_photoBytes != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.memory(_photoBytes!, height: 180, fit: BoxFit.cover),
            ),
          ],
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            style: FilledButton.styleFrom(
              backgroundColor: RoadDnaTheme.accent,
              minimumSize: const Size.fromHeight(48),
            ),
            child: Text(_submitting ? 'Submitting…' : 'Submit report'),
          ),
        ],
      ),
    );
  }
}

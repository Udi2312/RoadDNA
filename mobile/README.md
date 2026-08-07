# RoadDNA Mobile

Flutter citizen app for RoadDNA.

## Setup

1. Install [Flutter](https://docs.flutter.dev/get-started/install).
2. From this folder:

```bash
flutter create . --project-name roaddna_mobile
flutter pub get
```

3. Ensure Android permissions from [`android/PERMISSIONS.md`](android/PERMISSIONS.md) are present (cleartext traffic enabled for local HTTP APIs).
4. Run:

```bash
flutter run
```

## Configuration

- Default API: `http://10.0.2.2:3001` (Android emulator → host machine).
- Change via Home → settings gear.
- Device id is generated once and stored locally.

## Integration endpoints

Matches [`../docs/api-contract.md`](../docs/api-contract.md):

- `POST /api/v1/sensor-events`
- `POST /api/v1/citizen-reports`

Offline spike events are persisted until sync succeeds.

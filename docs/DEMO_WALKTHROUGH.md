## Demo walkthrough — RoadDNA (Udit)

Campus-scale demo using mock clusters derived from `sample-data/sample_sensor_events.csv`.

### Dashboard (5 minutes)

1. `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Sign in: `admin@roaddna.local` / `password`
4. **Overview** — confirm 5 stat cards, mini map, queue preview, charts load (skeletons first).
5. **Live Map** — zoom/pan; filter Severe; click a red cluster → Open detail.
6. **Cluster detail** — verify severity, report count, history list.
7. **Repair Queue** — assign engineer, click In progress, then Fixed; filter by status.
8. **Analytics** — check reports/day, severity pie, area health bars, worst areas table.
9. Toggle OS dark mode — palette should follow `prefers-color-scheme`.

### Mobile (when Flutter SDK available)

1. `cd mobile && flutter create . --project-name roaddna_mobile && flutter pub get && flutter run`
2. Confirm GPS / device cards on Home.
3. Start monitoring → shake/bump device → spike queued.
4. Kill network (airplane mode) → another spike stays in offline queue.
5. Re-enable network → Sync queue now.
6. Manual report with photo + description.

### Integration swap

1. Backend running on `:3001` with contract endpoints.
2. Frontend: `NEXT_PUBLIC_USE_MOCKS=false`
3. Mobile: set API base URL to host (emulator `http://10.0.2.2:3001`).
4. Re-run map/queue — data should come from live API.

## Demo walkthrough — RoadDNA Phase 1 & 2

1. `cd frontend && npm run dev`
2. Login: `admin@roaddna.gov` / `AdminPassword123!`
3. **Heatmap** (`/map`) — viewport bbox fetch, severity colors (0–100 scale)
4. **Clusters** — filter by status, open a row
5. **Cluster detail** — events timeline, **Create work order**
6. **Work Orders** — move cards open → assigned → in_progress → completed
7. **Citizen Reports** — photo modal + linked cluster badge
8. Live API: set `NEXT_PUBLIC_USE_MOCKS=false` and `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`

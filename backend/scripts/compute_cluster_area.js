// scripts/compute_cluster_area.js
require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in environment (.env)');
    process.exit(2);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const sql = `
  WITH first_cluster AS (
    SELECT cluster_id FROM pothole_clusters LIMIT 1
), pts AS (
  SELECT se.location::geometry AS geom
  FROM cluster_events ce
  JOIN sensor_events se ON ce.event_id = se.event_id
  WHERE ce.cluster_id = (SELECT cluster_id FROM first_cluster)
)
SELECT
  (SELECT cluster_id FROM first_cluster) AS cluster_id,
  MIN(ST_X(geom)) AS min_lng,
  MIN(ST_Y(geom)) AS min_lat,
  MAX(ST_X(geom)) AS max_lng,
  MAX(ST_Y(geom)) AS max_lat,
  ST_AsText(ST_Envelope(ST_Collect(geom))) AS bbox_wkt,
  ST_Area(ST_Transform(ST_Envelope(ST_Collect(geom)), 3857)) AS area_m2,
  COUNT(*) AS points
FROM pts;
`;

  try {
    const res = await pool.query(sql);
    if (!res.rows || res.rows.length === 0) {
      console.log('No cluster or no points found for the first cluster.');
    } else {
        const row = res.rows[0];
        const points = Number(row.points || 0);
        if (points === 0) {
          // Fallback to citizen_reports linked to the cluster
          const fallbackSql = `
  WITH first_cluster AS (
    SELECT cluster_id FROM pothole_clusters LIMIT 1
  ), pts AS (
    SELECT location::geometry AS geom
    FROM citizen_reports
    WHERE linked_cluster_id = (SELECT cluster_id FROM first_cluster)
  )
  SELECT
    (SELECT cluster_id FROM first_cluster) AS cluster_id,
    MIN(ST_X(geom)) AS min_lng,
    MIN(ST_Y(geom)) AS min_lat,
    MAX(ST_X(geom)) AS max_lng,
    MAX(ST_Y(geom)) AS max_lat,
    ST_AsText(ST_Envelope(ST_Collect(geom))) AS bbox_wkt,
    ST_Area(ST_Transform(ST_Envelope(ST_Collect(geom)), 3857)) AS area_m2,
    COUNT(*) AS points
  FROM pts;
  `;
          const fr = await pool.query(fallbackSql);
          if (!fr.rows || fr.rows.length === 0) {
            console.log('No citizen reports found for the first cluster.');
          } else {
            console.log(JSON.stringify(fr.rows[0], null, 2));
          }
        } else {
          console.log(JSON.stringify(row, null, 2));
        }
    }
  } catch (err) {
    console.error('Query failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

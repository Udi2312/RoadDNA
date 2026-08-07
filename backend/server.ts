// ─── Entry point — boots the server ───

import { createApp } from "./src/app";
import { config } from "./src/config";
import { logger } from "./src/config/logger";
import { testConnection } from "./src/config/database";

async function main() {
  // Verify database is reachable before accepting traffic
  await testConnection();

  const app = createApp();

  app.listen(config.port, () => {
    logger.info(
      `🚀 RoadDNA backend running on http://localhost:${config.port}`
    );
  });
}

main().catch((err) => {
  logger.fatal({ err }, "❌ Failed to start server");
  process.exit(1);
});
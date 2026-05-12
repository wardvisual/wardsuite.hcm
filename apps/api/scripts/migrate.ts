import 'dotenv/config';
import { createMigrationRunner } from '../src/core/database/migrations';

const command = process.argv[2] ?? 'run';

async function main() {
  const runner = createMigrationRunner();

  if (command === 'status') {
    await runner.status();
  } else if (command === 'run') {
    await runner.run();
  } else {
    console.error(`Unknown command: ${command}. Use "run" or "status".`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});

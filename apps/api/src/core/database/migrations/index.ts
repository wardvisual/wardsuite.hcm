import { MigrationRunner } from './runner';
import { migration001 } from './001_create_users_collection';
import { migration002 } from './002_create_attendance_collection';
import { migration003 } from './003_create_daily_summary_collection';

export function createMigrationRunner(): MigrationRunner {
  const runner = new MigrationRunner();
  runner.register(migration001);
  runner.register(migration002);
  runner.register(migration003);
  return runner;
}

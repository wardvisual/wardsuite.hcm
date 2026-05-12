import { MigrationRunner } from './runner';
import { migration001 } from './001_create_users_collection';
import { migration002 } from './002_create_attendance_collection';
import { migration003 } from './003_create_daily_summary_collection';
import { migration004 } from './004_create_attendance_history_collection';
import { migration005 } from './005_create_weekly_summary_collection';

export function createMigrationRunner(): MigrationRunner {
  const runner = new MigrationRunner();
  runner.register(migration001);
  runner.register(migration002);
  runner.register(migration003);
  runner.register(migration004);
  runner.register(migration005);
  return runner;
}

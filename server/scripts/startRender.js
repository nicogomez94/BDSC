import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const truthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

const skipMigrations = truthy(process.env.SKIP_DB_MIGRATIONS);
const allowStartWithoutDb = truthy(process.env.ALLOW_START_WITHOUT_DB);

const runPrismaMigrate = () =>
  new Promise((resolve, reject) => {
    const prismaBin = path.join(
      projectRoot,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
    );

    const child = spawn(prismaBin, ['migrate', 'deploy'], {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`prisma migrate deploy exited with code ${code}`));
    });
  });

const start = async () => {
  if (skipMigrations) {
    console.log('[startup] SKIP_DB_MIGRATIONS=true, skipping prisma migrate deploy.');
  } else {
    console.log('[startup] Running prisma migrate deploy...');
    try {
      await runPrismaMigrate();
      console.log('[startup] Prisma migrations applied successfully.');
    } catch (error) {
      if (!allowStartWithoutDb) {
        console.error('[startup] Prisma migration failed. Set ALLOW_START_WITHOUT_DB=true to continue without DB.');
        throw error;
      }

      console.warn('[startup] Prisma migration failed, continuing because ALLOW_START_WITHOUT_DB=true.');
      console.warn(`[startup] ${error.message}`);
    }
  }

  await import('../src/index.js');
};

start().catch((error) => {
  console.error('[startup] Fatal error while booting service:', error);
  process.exit(1);
});

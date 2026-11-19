// Vice City Cover Studio — program entry (Node 22, standard library only).
//
// The grader runs this file twice in a fresh container with no network:
// a read-only copy of this repository and a writable output directory.
// It copies app/ and screenshots/ into the output directory, then writes
// dossier.json exactly as the vendored make.fun library builds it from
// those files, so the dossier the scorer rebuilds matches byte for byte.
// The run is deterministic: same input files always produce same bytes.
import { buildDossier } from './vendor/makefun-app.ts';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) total += countFiles(join(dir, entry.name));
    else total += 1;
  }
  return total;
}

function main(): void {
  const appDir = join(REPO_ROOT, 'app');
  const shotsDir = join(REPO_ROOT, 'screenshots');
  if (!existsSync(appDir) || !lstatSync(appDir).isDirectory()) {
    throw new Error('app/ is missing from the repository');
  }
  if (!existsSync(shotsDir) || !lstatSync(shotsDir).isDirectory()) {
    throw new Error('screenshots/ is missing from the repository');
  }

  // Never wipe the repository itself if the output directory is mis-set.
  const resolvedOut = join(OUTPUT_DIR, '.');
  if (resolvedOut === REPO_ROOT || resolvedOut.startsWith(REPO_ROOT + '/')) {
    throw new Error(`refusing to use ${OUTPUT_DIR} as the output directory: it is inside the repository`);
  }
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  cpSync(appDir, join(OUTPUT_DIR, 'app'), { recursive: true });
  cpSync(shotsDir, join(OUTPUT_DIR, 'screenshots'), { recursive: true });

  const dossier = buildDossier(OUTPUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);

  const appFiles = countFiles(join(OUTPUT_DIR, 'app'));
  const shotFiles = readdirSync(join(OUTPUT_DIR, 'screenshots')).length;
  console.log(
    `vice-city-cover-studio: ${appFiles} app files, ${shotFiles} screenshots, dossier.json ${dossier.length} bytes -> ${OUTPUT_DIR}`,
  );
}

main();

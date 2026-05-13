import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

function projectDir(slug) {
  return path.join(dataDir, 'projects', slug);
}

function runsDir(slug) {
  return path.join(projectDir(slug), 'runs');
}

export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
}

export async function ensureProjectStorage(slug, projectConfig) {
  const dir = projectDir(slug);
  await mkdir(runsDir(slug), { recursive: true });
  await writeFile(path.join(dir, 'project.json'), JSON.stringify(projectConfig, null, 2));
  return dir;
}

export async function saveRun(slug, run) {
  await mkdir(runsDir(slug), { recursive: true });
  const timestamp = run.collectedAt.replace(/[:.]/g, '-');
  const filePath = path.join(runsDir(slug), `${timestamp}.json`);
  await writeFile(filePath, JSON.stringify(run, null, 2));
  return filePath;
}

export async function listRuns(slug) {
  try {
    const items = await readdir(runsDir(slug));
    return items.filter((name) => name.endsWith('.json')).sort();
  } catch {
    return [];
  }
}

export async function readRun(slug, fileName) {
  const filePath = path.join(runsDir(slug), fileName);
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function readLatestRuns(slug, count = 2) {
  const runs = await listRuns(slug);
  const selected = runs.slice(-count);
  return Promise.all(selected.map((fileName) => readRun(slug, fileName)));
}

export async function readProjectConfig(slug) {
  const filePath = path.join(projectDir(slug), 'project.json');
  return JSON.parse(await readFile(filePath, 'utf8'));
}

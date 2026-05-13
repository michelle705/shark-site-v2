import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDemoConfig } from './collector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsDir = path.join(__dirname, '..', 'projects');

export async function loadProjectConfig(projectName) {
  if (!projectName || projectName === 'demo') {
    return getDemoConfig();
  }

  const filePath = path.join(projectsDir, `${projectName}.json`);
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function listProjectNames() {
  const entries = await readdir(projectsDir);
  return entries
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/i, ''))
    .sort();
}

export async function saveProjectConfig(projectName, projectConfig) {
  const filePath = path.join(projectsDir, `${projectName}.json`);
  await writeFile(filePath, JSON.stringify(projectConfig, null, 2));
  return filePath;
}

export async function addKeywordToProject(projectName, keywordConfig) {
  const project = await loadProjectConfig(projectName);
  const keywords = Array.isArray(project.keywords) ? project.keywords : [];
  const normalizedKeyword = String(keywordConfig.keyword || '').trim();
  const normalizedLocation = String(keywordConfig.location || '').trim();
  const normalizedDevice = String(keywordConfig.device || 'desktop').trim().toLowerCase() || 'desktop';

  if (!normalizedKeyword || !normalizedLocation) {
    throw new Error('keyword and location are required');
  }

  const exists = keywords.some((entry) =>
    String(entry.keyword || '').trim().toLowerCase() === normalizedKeyword.toLowerCase() &&
    String(entry.location || '').trim().toLowerCase() === normalizedLocation.toLowerCase() &&
    String(entry.device || 'desktop').trim().toLowerCase() === normalizedDevice,
  );

  if (exists) {
    return {
      project,
      added: false,
      keywordConfig: {
        keyword: normalizedKeyword,
        location: normalizedLocation,
        device: normalizedDevice,
      },
    };
  }

  const nextProject = {
    ...project,
    keywords: [
      ...keywords,
      {
        keyword: normalizedKeyword,
        location: normalizedLocation,
        device: normalizedDevice,
      },
    ],
  };

  await saveProjectConfig(projectName, nextProject);

  return {
    project: nextProject,
    added: true,
    keywordConfig: {
      keyword: normalizedKeyword,
      location: normalizedLocation,
      device: normalizedDevice,
    },
  };
}

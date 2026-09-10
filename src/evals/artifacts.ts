import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export async function saveArtifact(id: string, value: unknown) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid artifact ID.');
  await mkdir('artifacts/trials', { recursive: true });
  const file = resolve('artifacts/trials', `${id}.json`);
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
  return file;
}

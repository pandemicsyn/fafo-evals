import { readFile } from 'node:fs/promises';
import { recordings } from '../src/evals/recordings.ts';
const id = process.argv[2] ?? 'convincing-no-write';
if (id === 'judge-disagreement' || id === 'search-outage') {
  console.log(await readFile(new URL(`../examples/${id}.json`, import.meta.url), 'utf8'));
} else if (id === '--list')
  console.table([
    ...recordings().map(({ id, provenance }) => ({ id, provenance })),
    { id: 'judge-disagreement', provenance: 'captured live judge' },
    { id: 'search-outage', provenance: 'captured live application' },
  ]);
else {
  const example = recordings().find((e) => e.id === id);
  if (!example) {
    console.error('Unknown example. Use npm run examples -- --list');
    process.exitCode = 1;
  } else {
    console.log(
      'SYNTHETIC TEACHING EXAMPLE — constructed evidence, no model call or benchmark measurement.',
    );
    console.log(JSON.stringify(example, null, 2));
    console.log(
      '\nDid the task succeed? Which evidence would convince you? Continue: npm run lesson -- 1',
    );
  }
}

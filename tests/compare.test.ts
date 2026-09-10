import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
it('compares retained failures and rejects unmatched case sets', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'fafo-comparison-'));
  const script = fileURLToPath(new URL('../scripts/compare.ts', import.meta.url));
  const write = (id: string, cases: string[], status: string) => {
    const directory = join(cwd, 'artifacts/runs', id);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, 'run.json'),
      JSON.stringify({
        runId: id,
        startedAt: id,
        cases,
        repetitions: 1,
        planned: cases.length,
        health: {
          model: 'synthetic-test',
          ready: true,
          policyVersion: 'test',
          credentialsConfigured: true,
        },
      }),
    );
    writeFileSync(
      join(directory, 'vitest-results.json'),
      JSON.stringify({
        testResults: [{ assertionResults: [{ fullName: 'case trial 1', status, duration: 10 }] }],
      }),
    );
  };
  const run = () =>
    spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), script], {
      cwd,
      encoding: 'utf8',
    });
  try {
    write('a', ['case'], 'failed');
    write('b', ['case'], 'passed');
    const comparison = run();
    expect(comparison.status).toBe(0);
    expect(comparison.stdout).toContain('failed');
    expect(comparison.stdout).toContain('passed');
    write('b', ['different-case'], 'passed');
    expect(run().status).toBe(1);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

it('shows missing assertions on either side and skips unrelated interrupted archives', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'fafo-incomplete-comparison-'));
  const script = fileURLToPath(new URL('../scripts/compare.ts', import.meta.url));
  const write = (id: string, names: string[]) => {
    const directory = join(cwd, 'artifacts/runs', id);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, 'run.json'),
      JSON.stringify({
        runId: id,
        startedAt: id,
        cases: ['case'],
        repetitions: 1,
        planned: 1,
        health: { model: 'test', ready: true, policyVersion: 'test', credentialsConfigured: true },
      }),
    );
    writeFileSync(
      join(directory, 'vitest-results.json'),
      JSON.stringify({
        testResults: [
          {
            assertionResults: names.map((fullName) => ({
              fullName,
              status: 'passed',
              duration: 10,
            })),
          },
        ],
      }),
    );
  };
  const run = (...ids: string[]) =>
    spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), script, ...ids], {
      cwd,
      encoding: 'utf8',
    });
  try {
    mkdirSync(join(cwd, 'artifacts/runs/interrupted'), { recursive: true });
    write('a', []);
    write('b', ['case trial 1']);
    const missingA = run();
    expect(missingA.status).toBe(1);
    expect(missingA.stdout).toContain('case trial 1');
    expect(missingA.stdout).toContain('missing');
    expect(missingA.stdout).toContain('A=1, B=0');
    expect(missingA.stderr).toContain('Skipped unreadable archive');
    expect(run('b', 'a').stdout).toContain('A=0, B=1');
    write('a', ['case trial 1']);
    expect(run('a', 'b').status).toBe(0);
    expect(run().status).toBe(0);
    write('a', []);
    write('b', []);
    expect(run().stderr).toContain('Neither run contains assertion evidence');
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

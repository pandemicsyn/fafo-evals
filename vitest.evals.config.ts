import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/evals/**/*.eval.ts'],
    reporters: ['vitest-evals/reporter', 'json'],
    outputFile: { json: 'artifacts/vitest-results.json' },
    testTimeout: 150_000,
    fileParallelism: false,
    retry: 0,
  },
});

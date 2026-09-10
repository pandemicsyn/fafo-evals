import { defineConfig } from 'vitest/config';
import evals from './vitest.evals.config.ts';
import { loadEnv } from './src/config.ts';

loadEnv();

export default defineConfig({
  test: {
    ...evals.test,
    include: ['examples/article-example.ts'],
    outputFile: { json: 'artifacts/article-results.json' },
  },
});

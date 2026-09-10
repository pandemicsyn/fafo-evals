import { createJudge } from 'vitest-evals';
import {
  openRouterJudgeHarness,
  parseVerdict,
  rubric,
  RUBRIC_VERSION,
  type JudgePair,
} from './judge.ts';
export const ReproductionJudge = createJudge<string, JudgePair>({
  name: 'reproduction-fidelity',
  judgeHarness: openRouterJudgeHarness(),
  assess: async ({ output, runJudge }) => {
    if (!runJudge) throw new Error('Judge harness is required.');
    const verdict = parseVerdict(
      await runJudge({
        system: rubric,
        prompt: JSON.stringify(output),
        responseFormat: { type: 'json' },
      }),
      output,
    );
    return {
      score: verdict.verdict === 'pass' ? 1 : 0,
      metadata: { ...verdict, rubricVersion: RUBRIC_VERSION },
    };
  },
});

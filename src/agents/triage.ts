'use agent';
import { useInitialData, useModel, useResponseFinish, useTool } from '@flue/runtime';
import * as v from 'valibot';
import { IssueInput } from '../tracker.ts';
import { trackerFor } from '../trials.ts';
import { modelId } from '../config.ts';
import { policy, POLICY_VERSION } from '../policy.ts';

export function Triage() {
  const model = modelId(process.env.TRIAGE_MODEL);
  useModel(`openrouter/${model}`, { thinkingLevel: 'low' });
  const initial = useInitialData<{ trialId: string } | undefined>();
  // The server binds the trial ID. Tool arguments cannot choose another trial's tracker.
  const tracker = () => {
    if (!initial) throw new Error('Missing server-bound trial context.');
    return trackerFor(initial.trialId);
  };
  useTool({
    name: 'search_issues',
    description:
      'Search for candidate issues. Broad matches require reading details to determine duplicates.',
    input: v.object({ query: v.string() }),
    run: ({ data }) => ({ output: tracker().search(data.query) }),
  });
  useTool({
    name: 'get_issue',
    description: 'Read authoritative details of a candidate issue.',
    input: v.object({ id: v.string() }),
    run: ({ data }) => ({ output: tracker().get(data.id) }),
  });
  useTool({
    name: 'create_issue',
    description:
      'Create one open issue with a complete reproduction report. Returns the stored issue.',
    input: IssueInput,
    run: ({ data }) => ({ output: tracker().create(data) }),
  });
  useTool({
    name: 'add_comment',
    description: 'Attach this report to an existing duplicate issue. Returns the stored comment.',
    input: v.object({ issueId: v.string(), body: v.string() }),
    run: ({ data }) => ({ output: tracker().comment(data.issueId, data.body) }),
  });
  useResponseFinish(({ response }) => ({
    usage: response.usage,
    model,
    policyVersion: POLICY_VERSION,
  }));
  return policy;
}
Triage.initialData = v.object({ trialId: v.string() });
// Keep automatic recovery from obscuring a failed attempt; the eval suite owns explicit repetitions.
Triage.durability = { maxAttempts: 1, timeoutMs: 120_000 };

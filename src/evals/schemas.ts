import * as v from 'valibot';
import { SnapshotSchema } from '../tracker.ts';
const count = v.pipe(v.number(), v.integer(), v.minValue(0));
export const RunIdSchema = v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_-]+$/));
export const HealthSchema = v.object({
  ready: v.literal(true),
  model: v.string(),
  policyVersion: v.string(),
  credentialsConfigured: v.boolean(),
});
export const AllocationSchema = v.object({ id: RunIdSchema, snapshot: SnapshotSchema });
export const RunSchema = v.pipe(
  v.object({
    runId: RunIdSchema,
    planned: count,
    cases: v.pipe(v.array(v.string()), v.minLength(1)),
    repetitions: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),
    health: HealthSchema,
    startedAt: v.string(),
  }),
  v.check((run) => run.planned === run.cases.length * run.repetitions, 'Run plan count mismatch.'),
);
export const TrialSummarySchema = v.object({
  experimentId: v.nullable(v.string()),
  execution: v.picklist(['completed', 'error']),
});
const AssertionSchema = v.object({
  fullName: v.string(),
  status: v.picklist(['passed', 'failed', 'pending', 'skipped', 'todo', 'disabled']),
  duration: v.optional(v.nullable(v.number()), null),
});
export const ReportSchema = v.object({
  testResults: v.array(v.object({ assertionResults: v.array(AssertionSchema) })),
});
export type Run = v.InferOutput<typeof RunSchema>;
export type Report = v.InferOutput<typeof ReportSchema>;

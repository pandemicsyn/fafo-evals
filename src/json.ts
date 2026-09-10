import * as v from 'valibot';
import type { JsonValue } from 'vitest-evals/harness';

// JSON is untrusted at both file and HTTP boundaries. Callers must validate its shape
// before accessing fields; annotating a parsed value as an interface would skip that check.
export function parseJson(text: string): unknown {
  return JSON.parse(text);
}
export const JsonValueSchema: v.GenericSchema<JsonValue> = v.lazy(() =>
  v.union([
    v.null(),
    v.boolean(),
    v.pipe(v.number(), v.finite()),
    v.string(),
    v.array(JsonValueSchema),
    v.record(v.string(), JsonValueSchema),
  ]),
);
// Match what the artifact file stores, including JSON's omission of undefined fields.
// Validate the serialized value instead of casting SDK metadata to JsonValue.
export function toJsonValue(value: unknown): JsonValue {
  const text = JSON.stringify(value);
  if (text === undefined) throw new Error('Artifact has no JSON representation.');
  return v.parse(JsonValueSchema, parseJson(text));
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

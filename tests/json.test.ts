import { it, expect } from 'vitest';
import * as v from 'valibot';
import { parseJson, toJsonValue, errorMessage } from '../src/json.ts';
import { AllocationSchema, ReportSchema, RunIdSchema } from '../src/evals/schemas.ts';

it('rejects malformed boundary data rather than asserting a TypeScript shape', () => {
  expect(() => v.parse(AllocationSchema, parseJson('{"id":"trial"}'))).toThrow();
  expect(() =>
    v.parse(
      ReportSchema,
      parseJson('{"testResults":[{"assertionResults":[{"fullName":"a","status":"green"}]}]}'),
    ),
  ).toThrow();
  expect(() => v.parse(RunIdSchema, '../another-run')).toThrow();
});
it('normalizes optional SDK metadata into the JSON representation actually saved', () => {
  expect(toJsonValue({ usage: undefined, nested: [undefined, { tokens: 3 }] })).toEqual({
    nested: [null, { tokens: 3 }],
  });
  expect(() => toJsonValue(undefined)).toThrow('no JSON representation');
  expect(errorMessage('a non-Error failure')).toBe('a non-Error failure');
});

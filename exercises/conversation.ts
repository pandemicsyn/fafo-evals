import { gradeOutcome, type TriageOutput } from '../src/evals/grades.ts';
import type { Expected } from '../src/evals/cases.ts';

// LESSON 6 — A correct ending can hide a bad first turn.
// Setup: reports are incomplete on EVERY turn before the last. The final expectation tells
// you whether the last turn supplied enough facts to create, or still requires clarification.
// The starter checks only the ending, so an issue created too early can slip through.
// Your task: require observed turns, grade each earlier snapshot as clarification/no-write
// against the ORIGINAL before state, then check the final outcome. Reuse gradeOutcome.
// Success: accept delayed creation and continued clarification, including seeded trackers;
// reject early issues/comments, damaged existing records, absent observations, and bad endings.
// Run `npm run lesson -- 6`. Its initial failure is intentional. Edit this function only.
// These structural checks don't prove that a clarification question is relevant; read it too.
export function learnerConversation(output: TriageOutput, expected: Expected): boolean {
  return gradeOutcome(output, expected).every((grade) => grade.status === 'pass');
}

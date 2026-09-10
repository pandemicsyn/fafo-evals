import { Tracker, type Snapshot } from '../src/tracker.ts';

// LESSON 9 — Fix the environment before blaming the model.
// Setup: callers use this factory to allocate a store, then ask it for a tracker by trial ID.
// The starter returns one shared tracker. Trial B therefore inherits trial A's writes.
// Your task: keep one tracker per ID inside each store. The same ID must retain its state
// across conversation turns; a different ID must start from its own copy of the supplied seed.
// Success: writes and close() affect only their trial, seeds stay unchanged, and separate
// stores remain independent. Returning a fresh tracker on EVERY call loses conversation state.
// Run `npm run lesson -- 9`. The initial failure is intentional; edit this factory only.
// This is a planted exercise defect. The application's src/trials.ts already isolates trials.
export function learnerTrialStore(seed: Snapshot): (trialId: string) => Tracker {
  const shared = new Tracker(seed);
  return (_trialId) => shared;
}

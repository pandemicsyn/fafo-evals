import { randomUUID } from 'node:crypto';
import { fixtures, type Fixture } from './fixtures.ts';
import { Tracker, type Fault } from './tracker.ts';

// Explicit registry keyed by server-created conversation ID, never a current-trial global.
const trials = new Map<string, { tracker: Tracker; expires: number }>();
export function allocateTrial(fixture: Fixture, fault: Fault = 'none') {
  sweep();
  const id = `eval-${randomUUID()}`;
  trials.set(id, { tracker: new Tracker(fixtures[fixture], fault), expires: Date.now() + 180_000 });
  return id;
}
export function trackerFor(id: string) {
  const trial = trials.get(id);
  if (!trial || trial.expires < Date.now()) {
    closeTrial(id);
    throw new Error('Unknown or expired trial. Allocate a fresh trial before sending a report.');
  }
  return trial.tracker;
}
export function closeTrial(id: string) {
  trials.get(id)?.tracker.close();
  trials.delete(id);
}
function sweep() {
  for (const [id, trial] of trials) if (trial.expires < Date.now()) closeTrial(id);
}

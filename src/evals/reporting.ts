export function summarizeRun(planned: number, trials: { execution: string }[], statuses: string[]) {
  const completed = trials.filter((t) => t.execution === 'completed').length;
  const passed = statuses.filter((s) => s === 'passed').length;
  const failed = statuses.filter((s) => s === 'failed').length;
  return {
    planned,
    attempted: passed + failed,
    completed,
    passed,
    failed,
    executionErrors: trials.filter((t) => t.execution === 'error').length,
    skipped: statuses.filter((s) => ['pending', 'skipped', 'todo', 'disabled'].includes(s)).length,
    missingArtifacts: Math.max(0, planned - trials.length),
    // Quality among completed trials and completion across planned trials answer different questions.
    // Reporting both prevents infrastructure failures from disappearing behind a flattering pass rate.
    completedTrialPassRate: completed ? passed / completed : null,
    executionReliability: planned ? completed / planned : null,
  };
}

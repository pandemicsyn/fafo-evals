import { readFile } from 'node:fs/promises';
import { recordings, calibrationExamples } from '../src/evals/recordings.ts';
import { learnerGrader } from '../exercises/grader.ts';
import { learnerTrajectory } from '../exercises/trajectory.ts';
import { learnerConversation } from '../exercises/conversation.ts';
import { learnerTrialStore } from '../exercises/isolation.ts';
import { checkTrajectory, checkConversation, checkIsolation } from '../src/evals/challenges.ts';
const lesson = Number(process.argv[2] ?? 1);
if (!Number.isInteger(lesson) || lesson < 1 || lesson > 10) throw new Error('Choose lesson 1–10.');
const guide = await readFile(
  new URL('../skills/learn-evals/references/lessons.md', import.meta.url),
  'utf8',
);
const sections = guide.split(/(?=^## \d+ —)/m);
// This command prints the selected lesson's task and completion criteria. Lessons 3, 5, 6, 9
// automatically check learner code; the other lessons require inspecting evidence or doing
// the follow-up activity in the guide. A successful command does not mean a completed lesson.
console.log(sections.find((section) => section.startsWith(`## ${lesson} —`)));
if (lesson === 3) {
  const results = recordings()
    // This challenge checks structural outcomes. Missing reproduction facts belong to lesson 7;
    // excluding that example here does not mean its issue is semantically correct.
    .filter((r) => r.id !== 'missing-trigger')
    .map((r) => {
      const expected = r.id === 'correct-paraphrase';
      const actual = learnerGrader(r.output);
      return {
        example: r.id,
        provenance: r.provenance,
        expected,
        actual,
        graderCorrect: expected === actual,
      };
    });
  console.table(results);
  if (results.some((r) => !r.graderCorrect)) {
    console.log('Intentional challenge failure: repair exercises/grader.ts and rerun.');
    process.exitCode = 1;
  }
}
// LESSON 7: label these fixed pairs yourself before running the judge. Author labels are
// intentionally omitted from the display; success means explaining agreements and disagreements.
if (lesson === 7)
  console.log(
    JSON.stringify(
      calibrationExamples
        .filter((e) => e.split === 'calibration')
        .map(({ id, report, issue }) => ({ id, report, issue })),
      null,
      2,
    ),
  );
// LESSON 8: this is a supplied illustration, not five actual model runs. Predict what it says
// about dependability, then use the guide's live command to collect your own repeated trials.
if (lesson === 8)
  console.log(
    'SYNTHETIC variation demo: [pass, fail, pass, pass, fail]. Three of five trials passed; one success does not establish repeatability. These are not model measurements.',
  );
if ([5, 6, 9].includes(lesson)) {
  const challenge = {
    5: { file: 'trajectory.ts', run: () => checkTrajectory(learnerTrajectory) },
    6: { file: 'conversation.ts', run: () => checkConversation(learnerConversation) },
    9: { file: 'isolation.ts', run: () => checkIsolation(learnerTrialStore) },
  }[lesson]!;
  const results = challenge.run();
  console.log('SYNTHETIC exercise checks — no model calls.');
  console.table(results);
  if (results.some((result) => !result.passed)) {
    console.log(
      `Challenge not yet solved: edit exercises/${challenge.file} and rerun. Initial failure is intentional.`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      'All supplied checks passed. Explain the failure your change catches, then add a novel counterexample.',
    );
  }
}

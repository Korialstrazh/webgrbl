import { describe, expect, it } from 'vitest';
import type { GcodeLine } from '../toolpath/interfaces/GcodeLine';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { getAnsweredProgramLineCount } from './get.answered.program.line.count';
import { getJobInterruptionSummary } from './get.job.interruption.summary';
import type { JobResumeState } from './interfaces/JobResumeState';

const CUT_LAYER_KEY = '#ff0000';
const SCORE_LAYER_KEY = '#0000ff';
const LAYER_NAMES: Record<string, string> = { [CUT_LAYER_KEY]: 'Cut', [SCORE_LAYER_KEY]: 'Score' };

const LINES: GcodeLine[] = [
  { text: '; header', moveIndex: undefined },
  { text: 'G21', moveIndex: undefined },
  { text: 'G0 X1 Y1', moveIndex: 0 },
  { text: 'G1 X5 Y1 S100', moveIndex: 1 },
  { text: 'G1 X5 Y4', moveIndex: 2 },
  { text: 'M5', moveIndex: undefined },
  { text: '', moveIndex: undefined },
];

const newResume = (answeredLineCount: number): JobResumeState => ({
  lines: LINES,
  answeredLineCount,
  toolpathDocumentVersion: 1,
  profileId: 'profile',
  toolpath: newToolpath({
    moves: [
      newToolpathMove({ to: { x: 1, y: 1 }, layerKey: CUT_LAYER_KEY }),
      newToolpathMove({ to: { x: 5, y: 1 }, layerKey: CUT_LAYER_KEY }),
      newToolpathMove({ to: { x: 5, y: 4 }, layerKey: SCORE_LAYER_KEY }),
    ],
  }),
});

describe('getJobInterruptionSummary', () => {
  it('names the layer, the whole-number percent of the sent lines and the end of the last answered move', () => {
    // The comment line is never sent, so five lines are sent in all; the first answered lines include it.
    expect(getJobInterruptionSummary(newResume(4), LAYER_NAMES))
      .toEqual({ layerName: 'Cut', percent: 60, lastPoint: { x: 5, y: 1 } });
    expect(getJobInterruptionSummary(newResume(5), LAYER_NAMES))
      .toEqual({ layerName: 'Score', percent: 80, lastPoint: { x: 5, y: 4 } });
  });

  it('rounds the percent down', () => {
    const oneThirdResume: JobResumeState = { ...newResume(1), lines: LINES.slice(1, 4) };

    expect(getJobInterruptionSummary({ ...oneThirdResume, answeredLineCount: 2 }, LAYER_NAMES)?.percent).toBe(66);
  });

  it('falls back to the layer key for a layer with no name', () => {
    expect(getJobInterruptionSummary(newResume(5), {})?.layerName).toBe(SCORE_LAYER_KEY);
  });

  it('gives no summary while no move was answered', () => {
    expect(getJobInterruptionSummary(newResume(2), LAYER_NAMES)).toBeUndefined();
  });
});

describe('getAnsweredProgramLineCount', () => {
  it('counts skipped lines before the last answered sent line as passed', () => {
    expect(getAnsweredProgramLineCount(LINES, 0)).toBe(0);
    expect(getAnsweredProgramLineCount(LINES, 1)).toBe(2);
    expect(getAnsweredProgramLineCount(LINES, 5)).toBe(6);
  });
});

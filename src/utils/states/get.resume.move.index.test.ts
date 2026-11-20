import { describe, expect, it } from 'vitest';
import type { GcodeLine } from '../toolpath/interfaces/GcodeLine';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { getResumeMoveIndex } from './get.resume.move.index';
import type { JobResumeState } from './interfaces/JobResumeState';

const LINE_COUNT = 150;
const HEADER_LINE_COUNT = 3;
const AIR_LINE_INDEXES: readonly number[] = [99, 100];

/** Header lines without a move, then one move per line, except two air lines just at the backed-up place. */
const newLines = (): GcodeLine[] => Array.from({ length: LINE_COUNT }, (_: unknown, lineIndex: number): GcodeLine => {
  const isMoveLine: boolean = lineIndex >= HEADER_LINE_COUNT && !AIR_LINE_INDEXES.includes(lineIndex);

  return { text: `line ${lineIndex}`, moveIndex: isMoveLine ? lineIndex - HEADER_LINE_COUNT : undefined };
});

const newResume = (answeredLineCount: number, lines: GcodeLine[] = newLines()): JobResumeState => ({
  lines,
  answeredLineCount,
  toolpathDocumentVersion: 1,
  profileId: 'profile',
  toolpath: newToolpath(),
});

describe('getResumeMoveIndex', () => {
  it('backs up 20 lines from the last answered one and walks back over lines without a move', () => {
    // Line 100 and line 99 are air lines; line 98 carries move 95.
    expect(getResumeMoveIndex(newResume(120))).toBe(95);
  });

  it('takes the move of the backed-up line itself when it has one', () => {
    expect(getResumeMoveIndex(newResume(130))).toBe(107);
  });

  it('starts from the first move when fewer lines than the backup were answered', () => {
    expect(getResumeMoveIndex(newResume(10))).toBe(0);
  });

  it('starts from the first move when no line up to the backed-up one has a move', () => {
    expect(getResumeMoveIndex(newResume(22))).toBe(0);
  });

  it('stays within the lines when the answered count runs past them', () => {
    expect(getResumeMoveIndex(newResume(LINE_COUNT + 100))).toBe(LINE_COUNT - HEADER_LINE_COUNT - 1);
  });
});

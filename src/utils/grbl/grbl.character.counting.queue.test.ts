import { describe, expect, it } from 'vitest';
import { GrblCharacterCountingQueue } from './grbl.character.counting.queue';
import { GRBL_LINE_ORIGIN } from './grbl.constants';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

const SMALL_BUFFER_SIZE = 10;
const LARGE_BUFFER_SIZE = 100;
const FIRST_TEXT = 'G1X1';
const SECOND_TEXT = 'G1X22';
const EEPROM_TEXT = '$100=250';
const LONG_TEXT = 'G1X1111111111';
const LARGE_PROGRAM_LINE_COUNT = 200000;

function newQueuedLine(text: string, isEepromWrite = false): GrblQueuedLine {
  return { text, isEepromWrite, origin: GRBL_LINE_ORIGIN.PROGRAM, programLineNumber: undefined };
}

function getTexts(lines: GrblQueuedLine[]): string[] {
  return lines.map((line: GrblQueuedLine) => line.text);
}

describe(GrblCharacterCountingQueue.name, () => {
  it('sends lines while their total size including newlines fits the buffer', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(SMALL_BUFFER_SIZE);
    queue.enqueueLines([newQueuedLine(FIRST_TEXT), newQueuedLine(SECOND_TEXT)]);

    expect(getTexts(queue.takeSendableLines())).toEqual([FIRST_TEXT]);
    expect(queue.takeSendableLines()).toEqual([]);

    queue.acknowledgeOldestInFlightLine();

    expect(getTexts(queue.takeSendableLines())).toEqual([SECOND_TEXT]);
  });

  it('frees the oldest line on acknowledge', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(SMALL_BUFFER_SIZE);
    queue.enqueueLines([newQueuedLine(FIRST_TEXT)]);
    queue.takeSendableLines();

    expect(queue.hasInFlightLines()).toBe(true);
    expect(queue.acknowledgeOldestInFlightLine()?.text).toBe(FIRST_TEXT);
    expect(queue.hasInFlightLines()).toBe(false);
    expect(queue.acknowledgeOldestInFlightLine()).toBeUndefined();
  });

  it('holds an eeprom write until nothing is in flight and sends nothing after it until it is acknowledged', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(LARGE_BUFFER_SIZE);
    queue.enqueueLines([newQueuedLine(FIRST_TEXT), newQueuedLine(EEPROM_TEXT, true), newQueuedLine(SECOND_TEXT)]);

    expect(getTexts(queue.takeSendableLines())).toEqual([FIRST_TEXT]);

    queue.acknowledgeOldestInFlightLine();

    expect(getTexts(queue.takeSendableLines())).toEqual([EEPROM_TEXT]);
    expect(queue.takeSendableLines()).toEqual([]);

    queue.acknowledgeOldestInFlightLine();

    expect(getTexts(queue.takeSendableLines())).toEqual([SECOND_TEXT]);
  });

  it('getOldestInFlightLine returns the line the next acknowledgement frees', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(LARGE_BUFFER_SIZE);
    queue.enqueueLines([newQueuedLine(FIRST_TEXT), newQueuedLine(SECOND_TEXT)]);

    expect(queue.getOldestInFlightLine()).toBeUndefined();

    queue.takeSendableLines();

    expect(queue.getOldestInFlightLine()?.text).toBe(FIRST_TEXT);

    queue.acknowledgeOldestInFlightLine();

    expect(queue.getOldestInFlightLine()?.text).toBe(SECOND_TEXT);
  });

  it('clearAllLines drops pending and in-flight lines', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(SMALL_BUFFER_SIZE);
    queue.enqueueLines([newQueuedLine(FIRST_TEXT), newQueuedLine(SECOND_TEXT)]);
    queue.takeSendableLines();
    queue.clearAllLines();

    expect(queue.hasInFlightLines()).toBe(false);
    expect(queue.hasPendingLines()).toBe(false);
    expect(queue.takeSendableLines()).toEqual([]);
  });

  it('a line longer than the buffer is still sent when nothing is in flight', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(SMALL_BUFFER_SIZE);
    queue.enqueueLines([newQueuedLine(LONG_TEXT), newQueuedLine(FIRST_TEXT)]);

    expect(getTexts(queue.takeSendableLines())).toEqual([LONG_TEXT]);
    expect(queue.takeSendableLines()).toEqual([]);

    queue.acknowledgeOldestInFlightLine();

    expect(getTexts(queue.takeSendableLines())).toEqual([FIRST_TEXT]);
  });

  it('enqueues and drains a very large program in one call without overflowing the stack', () => {
    const queue: GrblCharacterCountingQueue = new GrblCharacterCountingQueue(SMALL_BUFFER_SIZE);
    const lines: GrblQueuedLine[] = [];

    for (let lineIndex = 0; lineIndex < LARGE_PROGRAM_LINE_COUNT; lineIndex++) {
      lines.push(newQueuedLine(FIRST_TEXT));
    }

    expect(() => queue.enqueueLines(lines)).not.toThrow();

    let acknowledgedCount = 0;

    while (queue.hasPendingLines() || queue.hasInFlightLines()) {
      queue.takeSendableLines();
      queue.acknowledgeOldestInFlightLine();
      acknowledgedCount++;
    }

    expect(acknowledgedCount).toBe(LARGE_PROGRAM_LINE_COUNT);
  });
});

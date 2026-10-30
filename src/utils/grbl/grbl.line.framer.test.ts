import { describe, expect, it } from 'vitest';
import { GrblLineFramer } from './grbl.line.framer';

const encoder: TextEncoder = new TextEncoder();
const OK_LINE = 'ok';
const STATUS_LINE = '<Idle|MPos:0.000,0.000,0.000>';
const UMLAUT_LINE = '[MSG:ä]';
const UMLAUT_SPLIT_INDEX = 6;

describe(GrblLineFramer.name, () => {
  it('joins a line split across two chunks', () => {
    const framer: GrblLineFramer = new GrblLineFramer();

    expect(framer.getCompleteLines(encoder.encode(OK_LINE.slice(0, 1)))).toEqual([]);
    expect(framer.getCompleteLines(encoder.encode('k\r\n'))).toEqual([OK_LINE]);
  });

  it('returns every line of a chunk carrying several lines', () => {
    const framer: GrblLineFramer = new GrblLineFramer();

    expect(framer.getCompleteLines(encoder.encode(`ok\r\n${STATUS_LINE}\r\n`))).toEqual([OK_LINE, STATUS_LINE]);
  });

  it('treats bare LF like CRLF', () => {
    const framer: GrblLineFramer = new GrblLineFramer();

    expect(framer.getCompleteLines(encoder.encode('ok\nok\r\n'))).toEqual([OK_LINE, OK_LINE]);
  });

  it('drops empty lines', () => {
    const framer: GrblLineFramer = new GrblLineFramer();

    expect(framer.getCompleteLines(encoder.encode('\r\n  \r\nok\r\n\r\n'))).toEqual([OK_LINE]);
  });

  it('keeps a multi-byte character split across chunks intact', () => {
    const framer: GrblLineFramer = new GrblLineFramer();
    const bytes: Uint8Array = encoder.encode(`${UMLAUT_LINE}\n`);

    expect(framer.getCompleteLines(bytes.slice(0, UMLAUT_SPLIT_INDEX))).toEqual([]);
    expect(framer.getCompleteLines(bytes.slice(UMLAUT_SPLIT_INDEX))).toEqual([UMLAUT_LINE]);
  });

  it('discards the unfinished line on reset', () => {
    const framer: GrblLineFramer = new GrblLineFramer();
    framer.getCompleteLines(encoder.encode(OK_LINE));

    framer.reset();

    expect(framer.getCompleteLines(encoder.encode('\r\n'))).toEqual([]);
  });
});

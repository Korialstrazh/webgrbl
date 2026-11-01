import {
  SVG_PATH_COMMAND_PATTERN,
  SVG_PATH_FLAG_PATTERN,
  SVG_PATH_FLAG_TRUE,
  SVG_PATH_NUMBER_PATTERN,
  SVG_PATH_SEPARATOR_PATTERN,
} from './svg.path.constants';

const isCommandLetter = (character: string | undefined): character is string =>
  Boolean(character && SVG_PATH_COMMAND_PATTERN.test(character));

/**
 * Reads the tokens of SVG path data one at a time: command letters, numbers (also written together, as in 1.5.5 or
 * 1e-3) and the single-digit flags of an arc.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class SvgPathDataReader {
  // Index of the next character to read.
  private position = 0;

  constructor(private readonly pathData: string) {}

  public readCommandLetter(): string | undefined {
    this.skipSeparators();

    const letter: string | undefined = this.pathData[this.position];

    if (!isCommandLetter(letter)) {
      return undefined;
    }

    this.position++;

    return letter;
  }

  public hasNumberNext(): boolean {
    this.skipSeparators();
    SVG_PATH_NUMBER_PATTERN.lastIndex = this.position;

    return SVG_PATH_NUMBER_PATTERN.test(this.pathData);
  }

  public readNumber(): number | undefined {
    return this.readToken(SVG_PATH_NUMBER_PATTERN, Number);
  }

  public readFlag(): number | undefined {
    return this.readToken(
      SVG_PATH_FLAG_PATTERN,
      (flagText: string): number => (flagText === SVG_PATH_FLAG_TRUE ? 1 : 0),
    );
  }

  private readToken(pattern: RegExp, getTokenValue: (tokenText: string) => number): number | undefined {
    this.skipSeparators();
    pattern.lastIndex = this.position;

    const match: RegExpExecArray | null = pattern.exec(this.pathData);

    if (!match) {
      return undefined;
    }

    this.position = pattern.lastIndex;

    return getTokenValue(match[0]);
  }

  private skipSeparators(): void {
    SVG_PATH_SEPARATOR_PATTERN.lastIndex = this.position;
    SVG_PATH_SEPARATOR_PATTERN.exec(this.pathData);
    this.position = Math.max(this.position, SVG_PATH_SEPARATOR_PATTERN.lastIndex);
  }
}

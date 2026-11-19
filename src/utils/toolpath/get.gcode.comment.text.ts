/**
 * Makes user text (a project, profile or layer name) safe to write inside a G-code comment. Line breaks and other
 * control characters become spaces, so the comment cannot end and start an executable line. The characters that close
 * a comment or start a new statement, and the printable GRBL realtime commands (`!`, `~` and `?`), become look-alikes.
 * Everything else is folded to printable ASCII: GRBL reads bytes 0x80 to 0xFF as realtime commands (feed and power
 * overrides) even inside a comment.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GCODE_COMMENT_BREAKING_CHARACTER_REPLACEMENTS,
  GCODE_COMMENT_CONTROL_REPLACEMENT,
  GCODE_COMMENT_REALTIME_CHARACTER_REPLACEMENTS,
  GCODE_COMMENT_UNKNOWN_CHARACTER,
} from './gcode.constants';

const CONTROL_OR_LINE_BREAK_PATTERN = /[\p{Cc}\p{Zl}\p{Zp}]/gu;
const COMBINING_MARK_PATTERN = /\p{M}/gu;
const NON_PRINTABLE_ASCII_PATTERN = /[^\x20-\x7E]/g;
const COMMENT_UNSAFE_CHARACTER_PATTERN = /[();!~?]/g;
// NFKD splits accented letters into a base letter plus a mark, and maps width variants to their plain form.
const COMPATIBILITY_DECOMPOSITION = 'NFKD';

const COMMENT_UNSAFE_CHARACTER_REPLACEMENTS: Readonly<Record<string, string>> = Object.freeze({
  ...GCODE_COMMENT_BREAKING_CHARACTER_REPLACEMENTS,
  ...GCODE_COMMENT_REALTIME_CHARACTER_REPLACEMENTS,
});

const getCommentUnsafeCharacterReplacement = (character: string): string =>
  COMMENT_UNSAFE_CHARACTER_REPLACEMENTS[character] ?? GCODE_COMMENT_CONTROL_REPLACEMENT;

export const getGcodeCommentText = (userText: string): string =>
  userText
    .replace(CONTROL_OR_LINE_BREAK_PATTERN, GCODE_COMMENT_CONTROL_REPLACEMENT)
    .normalize(COMPATIBILITY_DECOMPOSITION)
    .replace(COMBINING_MARK_PATTERN, '')
    .replace(NON_PRINTABLE_ASCII_PATTERN, GCODE_COMMENT_UNKNOWN_CHARACTER)
    .replace(COMMENT_UNSAFE_CHARACTER_PATTERN, getCommentUnsafeCharacterReplacement);

import { getGcodeCommentText } from './get.gcode.comment.text';

describe(getGcodeCommentText.name, () => {
  it('keeps plain printable ASCII text as it is', () => {
    expect(getGcodeCommentText('Coasters 12 x 3 - oak')).toBe('Coasters 12 x 3 - oak');
  });

  it('turns every line break and control character into a space', () => {
    expect(getGcodeCommentText('a\nb\rc\r\nd\te\u0000f\u0085g\u2028h\u2029i\u007Fj')).toBe('a b c  d e f g h i j');
  });

  it('replaces the characters that close a comment or start a statement', () => {
    expect(getGcodeCommentText('(a); b)')).toBe('[a], b]');
  });

  it('folds accented and wide letters to ASCII and marks the rest with a question mark', () => {
    expect(getGcodeCommentText('\u00C9t\u00E9 \uFF27\uFF11 \u041A \u00B5')).toBe('Ete G1 ? ?');
  });

  it('neutralises a wide bracket that folds to a comment-closing character', () => {
    expect(getGcodeCommentText('\uFF08x\uFF09\uFF1B')).toBe('[x],');
  });
});

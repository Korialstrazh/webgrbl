import { describe, expect, it } from 'vitest';
import { getIsJobCardCollapsed } from './get.is.job.card.collapsed';

describe(getIsJobCardCollapsed.name, () => {
  it('folds by default only while connected on a short screen', () => {
    expect(getIsJobCardCollapsed(undefined, true, true)).toBe(true);
    expect(getIsJobCardCollapsed(undefined, true, false)).toBe(false);
    expect(getIsJobCardCollapsed(undefined, false, true)).toBe(false);
    expect(getIsJobCardCollapsed(undefined, false, false)).toBe(false);
  });

  it('keeps the viewer\'s own choice whatever the connection and the screen', () => {
    expect(getIsJobCardCollapsed(false, true, true)).toBe(false);
    expect(getIsJobCardCollapsed(true, false, false)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { getUniqueProjectName } from './get.unique.project.name';

const PROJECT_NAME = 'sample \u00b7 Nov 10, 2026 14:05';
const SECOND_NAME = `${PROJECT_NAME} (2)`;

describe(getUniqueProjectName.name, () => {
  it('keeps a name no other project uses', () => {
    expect(getUniqueProjectName(PROJECT_NAME, ['Coasters'])).toBe(PROJECT_NAME);
  });

  it('adds (2) to a name another project uses', () => {
    expect(getUniqueProjectName(PROJECT_NAME, [PROJECT_NAME])).toBe(SECOND_NAME);
  });

  it('counts on past numbers already taken', () => {
    expect(getUniqueProjectName(PROJECT_NAME, [PROJECT_NAME, SECOND_NAME])).toBe(`${PROJECT_NAME} (3)`);
  });
});

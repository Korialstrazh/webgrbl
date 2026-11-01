import { describe, expect, it } from 'vitest';
import { getGcodeFileName } from './get.gcode.file.name';
import { PROJECT_FILE_FALLBACK_BASE_NAME } from '../project/project.constants';

describe(getGcodeFileName.name, () => {
  it('names the file after the project with the .gcode extension', () => {
    expect(getGcodeFileName('Coaster set')).toBe('Coaster set.gcode');
  });

  it('drops characters a file name cannot hold', () => {
    expect(getGcodeFileName('A/B: "c"?')).toBe('AB c.gcode');
  });

  it('falls back to the default base name for a blank name', () => {
    expect(getGcodeFileName('  ')).toBe(`${PROJECT_FILE_FALLBACK_BASE_NAME}.gcode`);
  });
});

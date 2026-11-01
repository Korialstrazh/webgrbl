import { describe, expect, it } from 'vitest';
import { getProjectFileName } from './get.project.file.name';
import { PROJECT_FILE_EXTENSION, PROJECT_FILE_FALLBACK_BASE_NAME } from './project.constants';

describe(getProjectFileName.name, () => {
  it('appends the project file extension to a plain name', () => {
    expect(getProjectFileName('Coasters')).toBe(`Coasters${PROJECT_FILE_EXTENSION}`);
  });

  it('leaves out every character a file system forbids', () => {
    expect(getProjectFileName('a\\b/c:d*e?f"g<h>i|j')).toBe(`abcdefghij${PROJECT_FILE_EXTENSION}`);
  });

  it('keeps spaces and letters outside ASCII', () => {
    const accentedName = 'Schilder f\u00FCr Caf\u00E9';

    expect(getProjectFileName(accentedName)).toBe(`${accentedName}${PROJECT_FILE_EXTENSION}`);
  });

  it('falls back to a fixed base name when no allowed character is left', () => {
    expect(getProjectFileName(' ?*/ ')).toBe(`${PROJECT_FILE_FALLBACK_BASE_NAME}${PROJECT_FILE_EXTENSION}`);
  });
});

import { describe, expect, it } from 'vitest';
import { getDefaultProjectName } from './get.default.project.name';
import { getProjectDisplayName } from './get.project.display.name';

const LANGUAGE = 'en';
const OBJECT_NAME = 'sample';
const CREATED_AT = '2026-11-09T10:00:00.000Z';
const OWN_NAME = 'Coasters';
const NOVEMBER_MONTH_INDEX = 10;
const IMPORT_YEAR = 2026;
const IMPORT_DAY = 10;
const JUST_AFTER_MIDNIGHT_MINUTES = 30;

describe(getProjectDisplayName.name, () => {
  it('names a default-named project after its first object and creation day', () => {
    const shownName: string = getProjectDisplayName(
      { name: getDefaultProjectName(), firstObjectName: OBJECT_NAME, createdAt: CREATED_AT },
      LANGUAGE,
    );

    expect(shownName).toBe('sample · Nov 9, 2026');
  });

  it('names the local day of the first import, not the creation day of a cleared project', () => {
    const importedAt: string = new Date(
      IMPORT_YEAR,
      NOVEMBER_MONTH_INDEX,
      IMPORT_DAY,
      0,
      JUST_AFTER_MIDNIGHT_MINUTES,
    ).toISOString();
    const shownName: string = getProjectDisplayName(
      {
        name: getDefaultProjectName(),
        firstObjectName: OBJECT_NAME,
        createdAt: CREATED_AT,
        firstObjectImportedAt: importedAt,
      },
      LANGUAGE,
    );

    expect(shownName).toBe('sample · Nov 10, 2026');
  });

  it('keeps a name the user gave', () => {
    expect(
      getProjectDisplayName({ name: OWN_NAME, firstObjectName: OBJECT_NAME, createdAt: CREATED_AT }, LANGUAGE),
    ).toBe(OWN_NAME);
  });

  it('falls back to the default name while the project is empty or not yet listed', () => {
    expect(getProjectDisplayName({ name: getDefaultProjectName(), firstObjectName: undefined }, LANGUAGE)).toBe(
      getDefaultProjectName(),
    );
    expect(getProjectDisplayName({ name: getDefaultProjectName(), firstObjectName: OBJECT_NAME }, LANGUAGE)).toBe(
      getDefaultProjectName(),
    );
  });
});

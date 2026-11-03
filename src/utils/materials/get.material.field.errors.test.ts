import { DEFAULT } from '../localization/default.locales';
import { getMaterialFieldErrors } from './get.material.field.errors';
import {
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from './material.constants';

const VALID_NAME = 'Birch';
const VALID_THICKNESS_MM = 3;
const NO_ERRORS = { nameErrorKey: undefined, thicknessErrorKey: undefined };

describe(getMaterialFieldErrors.name, () => {
  it.each([MATERIAL_THICKNESS_MM_MIN, VALID_THICKNESS_MM, MATERIAL_THICKNESS_MM_MAX])(
    'accepts a thickness of %s mm',
    (thicknessMm: number) => {
      expect(getMaterialFieldErrors(VALID_NAME, thicknessMm)).toEqual(NO_ERRORS);
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, MATERIAL_THICKNESS_MM_MAX + 1])(
    'rejects a thickness of %s mm',
    (thicknessMm: number) => {
      expect(getMaterialFieldErrors(VALID_NAME, thicknessMm)).toEqual({
        nameErrorKey: undefined,
        thicknessErrorKey: DEFAULT.MATERIAL_DIALOG_THICKNESS_INVALID,
      });
    },
  );

  it.each(['', '   ', 'x'.repeat(MATERIAL_NAME_LENGTH_MAX + 1)])('rejects the name "%s"', (materialName: string) => {
    expect(getMaterialFieldErrors(materialName, VALID_THICKNESS_MM)).toEqual({
      nameErrorKey: DEFAULT.MATERIAL_DIALOG_NAME_INVALID,
      thicknessErrorKey: undefined,
    });
  });

  it('measures the name without the spaces around it', () => {
    const paddedName = ` ${'x'.repeat(MATERIAL_NAME_LENGTH_MAX)} `;

    expect(getMaterialFieldErrors(paddedName, VALID_THICKNESS_MM)).toEqual(NO_ERRORS);
  });
});

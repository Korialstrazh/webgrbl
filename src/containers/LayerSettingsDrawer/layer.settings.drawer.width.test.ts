import { describe, expect, it } from 'vitest';
import { LAYER_SETTINGS_DRAWER_WIDTH } from './layer.settings.drawer.constants';
import { MATERIAL_LIBRARY_DRAWER_WIDTH } from '../MaterialLibraryDrawer/material.library.drawer.constants';

const NARROW_DRAWER_WIDTH = 'clamp(21rem,';
const REGION_WIDTH_CAP = ', 100%)';

describe('bed region drawer widths', () => {
  it.each([LAYER_SETTINGS_DRAWER_WIDTH, MATERIAL_LIBRARY_DRAWER_WIDTH])(
    'shrink to 21rem in a narrower bed region and never pass the region width (%s)',
    (drawerWidth: string) => {
      expect(drawerWidth).toContain(NARROW_DRAWER_WIDTH);
      expect(drawerWidth.endsWith(REGION_WIDTH_CAP)).toBe(true);
    },
  );
});

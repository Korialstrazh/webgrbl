import { describe, expect, it } from 'vitest';
import { DEFAULT } from '../localization/default.locales';
import { newGcodeExportTestStore } from '../test.support/new.gcode.export.test.store';
import { selectGcodeExportBlockedReasonKey } from './gcode.export.blocked.reason.selector';
import type { AppStore } from './new.store';

describe('selectGcodeExportBlockedReasonKey', () => {
  it('asks for a laser profile first', async () => {
    const store: AppStore = await newGcodeExportTestStore({ activeProfile: undefined });

    expect(selectGcodeExportBlockedReasonKey(store.getState())).toBe(DEFAULT.GCODE_EXPORT_NEEDS_PROFILE);
  });

  it('asks for artwork in an empty project, not for a laser', async () => {
    const store: AppStore = await newGcodeExportTestStore({ objects: [] });

    expect(selectGcodeExportBlockedReasonKey(store.getState())).toBe(DEFAULT.GCODE_EXPORT_NEEDS_ARTWORK);
  });

  it('asks to switch on a layer when every layer is off', async () => {
    const store: AppStore = await newGcodeExportTestStore({ areLayersEnabled: false });

    expect(selectGcodeExportBlockedReasonKey(store.getState())).toBe(DEFAULT.GCODE_EXPORT_NEEDS_LAYER);
  });

  it('lets the export run with a profile and a layer that is on', async () => {
    const store: AppStore = await newGcodeExportTestStore();

    expect(selectGcodeExportBlockedReasonKey(store.getState())).toBeUndefined();
  });
});

/**
 * Tests for the machine profile state: upsert, delete, select, import and the selectors.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_FRAME_FEED_MM_PER_MIN } from '../frame/frame.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../profiles/interfaces/MachineProfilesDocument';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from '../profiles/machine.profile.constants';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { Action } from './action';
import {
  ActiveMachineProfileSelected,
  MACHINE_PROFILE_STATE_NAME,
  MachineProfileDeleted,
  MachineProfileSaved,
  MachineProfilesImported,
  MachineProfilesLoaded,
  machineProfileReducer,
  selectActiveMachineProfile,
  selectFrameFeedMmPerMin,
  selectFrameGridCellMm,
  selectFrameMarginMm,
  selectMachineProfiles,
} from './machine.profile.state';
import type { MachineProfileState } from './machine.profile.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const RENAMED_PROFILE_NAME = 'Workshop laser';
const UNKNOWN_PROFILE_ID = 'unknown-profile';

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

const getInitialState = (): MachineProfileState => machineProfileReducer(undefined, new UnknownAction());

const newDocument = (profiles: MachineProfile[], activeProfileId?: string): MachineProfilesDocument => ({
  version: MACHINE_PROFILES_DOCUMENT_VERSION,
  activeProfileId,
  profiles,
});

const getLoadedState = (profilesDocument: MachineProfilesDocument): MachineProfileState =>
  machineProfileReducer(getInitialState(), new MachineProfilesLoaded({ document: profilesDocument }));

const getRootState = (state: MachineProfileState): { [MACHINE_PROFILE_STATE_NAME]: MachineProfileState } => ({
  [MACHINE_PROFILE_STATE_NAME]: state,
});

describe(machineProfileReducer.name, () => {
  it('starts with an empty document', () => {
    expect(getInitialState().document).toEqual(newDocument([]));
  });

  it('loads a document', () => {
    const profile: MachineProfile = newMachineProfile();

    expect(getLoadedState(newDocument([profile], profile.id)).document).toEqual(newDocument([profile], profile.id));
  });

  it('adds a saved profile whose id is new', () => {
    const profile: MachineProfile = newMachineProfile();

    const state: MachineProfileState = machineProfileReducer(getInitialState(), new MachineProfileSaved({ profile }));

    expect(state.document.profiles).toEqual([profile]);
  });

  it('replaces a saved profile with an existing id in place', () => {
    const first: MachineProfile = newMachineProfile();
    const second: MachineProfile = newMachineProfile();
    const renamed: MachineProfile = { ...first, name: RENAMED_PROFILE_NAME };

    const state: MachineProfileState = machineProfileReducer(
      getLoadedState(newDocument([first, second])),
      new MachineProfileSaved({ profile: renamed }),
    );

    expect(state.document.profiles).toEqual([renamed, second]);
  });

  it('deleting the active profile removes it and clears the active profile', () => {
    const first: MachineProfile = newMachineProfile();
    const second: MachineProfile = newMachineProfile();

    const state: MachineProfileState = machineProfileReducer(
      getLoadedState(newDocument([first, second], first.id)),
      new MachineProfileDeleted({ profileId: first.id }),
    );

    expect(state.document).toEqual(newDocument([second]));
  });

  it('deleting another profile keeps the active profile', () => {
    const first: MachineProfile = newMachineProfile();
    const second: MachineProfile = newMachineProfile();

    const state: MachineProfileState = machineProfileReducer(
      getLoadedState(newDocument([first, second], first.id)),
      new MachineProfileDeleted({ profileId: second.id }),
    );

    expect(state.document).toEqual(newDocument([first], first.id));
  });

  it('selects an existing profile as active', () => {
    const first: MachineProfile = newMachineProfile();
    const second: MachineProfile = newMachineProfile();

    const state: MachineProfileState = machineProfileReducer(
      getLoadedState(newDocument([first, second], first.id)),
      new ActiveMachineProfileSelected({ profileId: second.id }),
    );

    expect(state.document.activeProfileId).toBe(second.id);
  });

  it('ignores the selection of an unknown profile', () => {
    const profile: MachineProfile = newMachineProfile();
    const loadedState: MachineProfileState = getLoadedState(newDocument([profile], profile.id));

    const state: MachineProfileState = machineProfileReducer(
      loadedState,
      new ActiveMachineProfileSelected({ profileId: UNKNOWN_PROFILE_ID }),
    );

    expect(state).toBe(loadedState);
  });

  it('takes over an imported document', () => {
    const current: MachineProfile = newMachineProfile();
    const imported: MachineProfile = newMachineProfile();
    const importedDocument: MachineProfilesDocument = newDocument([current, imported], current.id);

    const state: MachineProfileState = machineProfileReducer(
      getLoadedState(newDocument([current], current.id)),
      new MachineProfilesImported({ document: importedDocument }),
    );

    expect(state.document).toEqual(importedDocument);
  });
});

describe(selectActiveMachineProfile.name, () => {
  it('returns the active profile', () => {
    const first: MachineProfile = newMachineProfile();
    const second: MachineProfile = newMachineProfile();

    expect(selectActiveMachineProfile(getRootState(getLoadedState(newDocument([first, second], second.id)))))
      .toEqual(second);
  });

  it('returns undefined without an active profile', () => {
    expect(selectActiveMachineProfile(getRootState(getLoadedState(newDocument([newMachineProfile()])))))
      .toBeUndefined();
  });
});

describe(selectMachineProfiles.name, () => {
  it('returns every profile', () => {
    const first: MachineProfile = newMachineProfile();
    const second: MachineProfile = newMachineProfile();

    expect(selectMachineProfiles(getRootState(getLoadedState(newDocument([first, second]))))).toEqual([first, second]);
  });
});

const UNLISTED_GRID_CELL_MM = 7;
const LISTED_GRID_CELL_MM = 20;
const FRAME_MARGIN_MM = 3;
const FRAME_FEED_MM_PER_MIN = 3000;
const OUT_OF_RANGE_FEED_MM_PER_MIN = 60000;

const getActiveRootState = (profile: MachineProfile): { [MACHINE_PROFILE_STATE_NAME]: MachineProfileState } =>
  getRootState(getLoadedState(newDocument([profile], profile.id)));

describe(selectFrameGridCellMm.name, () => {
  it('returns 0 for a profile without the setting', () => {
    expect(selectFrameGridCellMm(getActiveRootState(newMachineProfile()))).toBe(0);
  });

  it('returns 0 without an active profile', () => {
    expect(selectFrameGridCellMm(getRootState(getInitialState()))).toBe(0);
  });

  it('returns a listed grid cell size', () => {
    expect(selectFrameGridCellMm(getActiveRootState(newMachineProfile({ frameGridCellMm: LISTED_GRID_CELL_MM }))))
      .toBe(LISTED_GRID_CELL_MM);
  });

  it('reads a grid cell size outside the options as 0', () => {
    expect(selectFrameGridCellMm(getActiveRootState(newMachineProfile({ frameGridCellMm: UNLISTED_GRID_CELL_MM }))))
      .toBe(0);
  });
});

describe(selectFrameFeedMmPerMin.name, () => {
  it('returns the default for a profile without the setting', () => {
    expect(selectFrameFeedMmPerMin(getActiveRootState(newMachineProfile()))).toBe(DEFAULT_FRAME_FEED_MM_PER_MIN);
  });

  it('returns the default without an active profile', () => {
    expect(selectFrameFeedMmPerMin(getRootState(getInitialState()))).toBe(DEFAULT_FRAME_FEED_MM_PER_MIN);
  });

  it('returns the speed of the active profile', () => {
    expect(selectFrameFeedMmPerMin(getActiveRootState(newMachineProfile({ frameFeedMmPerMin: FRAME_FEED_MM_PER_MIN }))))
      .toBe(FRAME_FEED_MM_PER_MIN);
  });

  it.each([[OUT_OF_RANGE_FEED_MM_PER_MIN], [0], [NaN]])('reads the stored speed %s as default', (stored: number) => {
    expect(selectFrameFeedMmPerMin(getActiveRootState(newMachineProfile({ frameFeedMmPerMin: stored }))))
      .toBe(DEFAULT_FRAME_FEED_MM_PER_MIN);
  });
});

describe(selectFrameMarginMm.name, () => {
  it('returns 0 for a profile without the setting', () => {
    expect(selectFrameMarginMm(getActiveRootState(newMachineProfile()))).toBe(0);
  });

  it('returns the margin of the active profile', () => {
    expect(selectFrameMarginMm(getActiveRootState(newMachineProfile({ frameMarginMm: FRAME_MARGIN_MM }))))
      .toBe(FRAME_MARGIN_MM);
  });
});

/**
 * Tests for the machine profile state: upsert, delete, select, import and the selectors.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
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

/**
 * The machine profiles: every laser the user has set up and which one is active. The active profile sizes the bed
 * and caps the laser power.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../profiles/interfaces/MachineProfilesDocument';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from '../profiles/machine.profile.constants';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';
import type { MachineProfileIdPayload } from './interfaces/MachineProfileIdPayload';
import type { MachineProfileSavedPayload } from './interfaces/MachineProfileSavedPayload';
import type { MachineProfilesDocumentPayload } from './interfaces/MachineProfilesDocumentPayload';

// #region State
export interface MachineProfileState {
  /** All profiles and the id of the active one, in the shape they are stored in. */
  document: MachineProfilesDocument;
}
// #endregion

// #region State name
export const MACHINE_PROFILE_STATE_NAME = 'machineProfile';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(MACHINE_PROFILE_STATE_NAME);
// #endregion

// #region Actions
export class MachineProfilesLoaded extends Action<MachineProfilesDocumentPayload> {
  public static readonly type: string = actionType('machine profiles loaded');
}

export class MachineProfileSaved extends Action<MachineProfileSavedPayload> {
  public static readonly type: string = actionType('machine profile saved');
}

export class MachineProfileDeleted extends Action<MachineProfileIdPayload> {
  public static readonly type: string = actionType('machine profile deleted');
}

export class ActiveMachineProfileSelected extends Action<MachineProfileIdPayload> {
  public static readonly type: string = actionType('active machine profile selected');
}

export class MachineProfilesImported extends Action<MachineProfilesDocumentPayload> {
  public static readonly type: string = actionType('machine profiles imported');
}
// #endregion

// #region Initial state
const INITIAL_MACHINE_PROFILE_STATE: MachineProfileState = {
  document: {
    version: MACHINE_PROFILES_DOCUMENT_VERSION,
    activeProfileId: undefined,
    profiles: [],
  },
};
// #endregion

// #region Reducer
const hasProfileWithId = (profilesDocument: MachineProfilesDocument, profileId: string): boolean =>
  profilesDocument.profiles.some((profile: MachineProfile): boolean => profile.id === profileId);

const getDocumentWithSavedProfile = (
  profilesDocument: MachineProfilesDocument,
  savedProfile: MachineProfile,
): MachineProfilesDocument => ({
  ...profilesDocument,
  profiles: hasProfileWithId(profilesDocument, savedProfile.id)
    ? profilesDocument.profiles.map((profile: MachineProfile): MachineProfile =>
      profile.id === savedProfile.id ? savedProfile : profile)
    : [...profilesDocument.profiles, savedProfile],
});

const getDocumentWithoutProfile = (
  profilesDocument: MachineProfilesDocument,
  profileId: string,
): MachineProfilesDocument => ({
  ...profilesDocument,
  activeProfileId: profilesDocument.activeProfileId === profileId ? undefined : profilesDocument.activeProfileId,
  profiles: profilesDocument.profiles.filter((profile: MachineProfile): boolean => profile.id !== profileId),
});

const getStateWithActiveProfile = (state: MachineProfileState, profileId: string): MachineProfileState =>
  hasProfileWithId(state.document, profileId)
    ? { ...state, document: { ...state.document, activeProfileId: profileId } }
    : state;

export const machineProfileReducer = (
  state: MachineProfileState = INITIAL_MACHINE_PROFILE_STATE,
  action: Action<unknown>,
): MachineProfileState => {
  switch (action.type) {
  case MachineProfilesLoaded.type:
    return { ...state, document: (action as MachineProfilesLoaded).payload.document };
  case MachineProfilesImported.type:
    return { ...state, document: (action as MachineProfilesImported).payload.document };
  case MachineProfileSaved.type:
    return {
      ...state,
      document: getDocumentWithSavedProfile(state.document, (action as MachineProfileSaved).payload.profile),
    };
  case MachineProfileDeleted.type:
    return {
      ...state,
      document: getDocumentWithoutProfile(state.document, (action as MachineProfileDeleted).payload.profileId),
    };
  case ActiveMachineProfileSelected.type:
    return getStateWithActiveProfile(state, (action as ActiveMachineProfileSelected).payload.profileId);
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [MACHINE_PROFILE_STATE_NAME]: MachineProfileState };

export const selectMachineProfilesDocument = (state: RootState): MachineProfilesDocument =>
  state[MACHINE_PROFILE_STATE_NAME].document;

export const selectMachineProfiles = (state: RootState): MachineProfile[] =>
  state[MACHINE_PROFILE_STATE_NAME].document.profiles;

export const selectMachineProfile = (profileId: string): ((state: RootState) => MachineProfile | undefined) =>
  (state: RootState): MachineProfile | undefined =>
    state[MACHINE_PROFILE_STATE_NAME].document.profiles.find(
      (profile: MachineProfile): boolean => profile.id === profileId,
    );

export const selectActiveMachineProfile = (state: RootState): MachineProfile | undefined => {
  const { activeProfileId }: MachineProfilesDocument = state[MACHINE_PROFILE_STATE_NAME].document;

  return activeProfileId ? selectMachineProfile(activeProfileId)(state) : undefined;
};
// #endregion

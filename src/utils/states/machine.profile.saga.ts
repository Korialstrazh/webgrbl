/**
 * Keeps the machine profiles in step with storage and the connected laser: loads them at start, stores every
 * change, creates a first profile from the laser's settings on the first connect, and warns when the laser reports
 * a different work area or has laser mode off. A differing profile is never overwritten without the user's consent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { DEFAULT } from '../localization/default.locales';
import { getProfileValuesFromSettings } from '../profiles/get.profile.values.from.settings';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../profiles/interfaces/MachineProfilesDocument';
import type { MachineProfileValuesFromSettings } from '../profiles/interfaces/MachineProfileValuesFromSettings';
import { MACHINE_PROFILES_STORAGE } from '../profiles/machine.profiles.storage';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { ConnectionEstablished, selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import {
  ActiveMachineProfileSelected,
  MachineProfileDeleted,
  MachineProfileReadFromLaserRequested,
  MachineProfileSaved,
  MachineProfileUpdateFromLaserAccepted,
  MachineProfilesImported,
  MachineProfilesLoaded,
  selectActiveMachineProfile,
  selectMachineProfile,
  selectMachineProfilesDocument,
} from './machine.profile.state';
import { NO_TOAST_PARAMETERS, TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

/** Actions after which the profiles document differs from the stored one. */
const PROFILE_CHANGE_ACTION_TYPES: string[] = [
  MachineProfileSaved.type,
  MachineProfileDeleted.type,
  ActiveMachineProfileSelected.type,
  MachineProfilesImported.type,
];

const isWorkAreaDifferent = (profile: MachineProfile, laserValues: MachineProfileValuesFromSettings): boolean =>
  profile.workAreaXMm !== laserValues.workAreaXMm || profile.workAreaYMm !== laserValues.workAreaYMm;

const isLaserModeReportedOff = (laserValues: MachineProfileValuesFromSettings | undefined): boolean =>
  !!laserValues && !laserValues.isLaserModeOn;

function* storeMachineProfiles(): Generator {
  const profilesDocument: MachineProfilesDocument =
    (yield select(selectMachineProfilesDocument)) as MachineProfilesDocument;

  yield call([MACHINE_PROFILES_STORAGE, MACHINE_PROFILES_STORAGE.storeDocument], profilesDocument);
}

function* showLaserModeOffWarning(): Generator {
  yield put(new ToastShown({
    severity: TOAST_SEVERITY.WARNING,
    messageKey: DEFAULT.TOAST_LASER_MODE_OFF,
    messageParameters: NO_TOAST_PARAMETERS,
  }));
}

function* createMachineProfileFromLaser(laserValues: MachineProfileValuesFromSettings): Generator {
  const { workAreaXMm, workAreaYMm, sValueMax, hasHomingSwitches }: MachineProfileValuesFromSettings = laserValues;
  const profile: MachineProfile = newMachineProfile({ workAreaXMm, workAreaYMm, sValueMax, hasHomingSwitches });

  yield put(new MachineProfileSaved({ profile }));
  yield put(new ActiveMachineProfileSelected({ profileId: profile.id }));
  yield put(new ToastShown({
    severity: TOAST_SEVERITY.INFO,
    messageKey: DEFAULT.TOAST_PROFILE_CREATED,
    messageParameters: { name: profile.name },
  }));
}

function* showProfileDiffersWarning(
  profile: MachineProfile,
  laserValues: MachineProfileValuesFromSettings,
): Generator {
  yield put(new ToastShown({
    severity: TOAST_SEVERITY.WARNING,
    messageKey: DEFAULT.TOAST_PROFILE_DIFFERS,
    messageParameters: {
      name: profile.name,
      profileWidth: profile.workAreaXMm,
      profileHeight: profile.workAreaYMm,
      laserWidth: laserValues.workAreaXMm,
      laserHeight: laserValues.workAreaYMm,
    },
  }));
}

function* checkMachineProfileOnConnect(action: ConnectionEstablished): Generator {
  const laserValues: MachineProfileValuesFromSettings =
    getProfileValuesFromSettings(action.payload.connectionInfo.settings);
  const activeProfile: MachineProfile | undefined =
    (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  if (!activeProfile) {
    yield call(createMachineProfileFromLaser, laserValues);
  } else if (isWorkAreaDifferent(activeProfile, laserValues)) {
    yield call(showProfileDiffersWarning, activeProfile, laserValues);
  }

  if (!laserValues.isLaserModeOn) {
    yield call(showLaserModeOffWarning);
  }
}

/** Applies the connected laser's settings to a profile; returns the laser values, or undefined when nothing changed. */
function* updateMachineProfileFromLaser(profileId: string): Generator {
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;
  const profile: MachineProfile | undefined =
    (yield select(selectMachineProfile(profileId))) as MachineProfile | undefined;

  // Without a connection the settings are empty and would reset the profile to the defaults.
  if (!isConnected) {
    return undefined;
  }

  if (!profile) {
    return undefined;
  }

  const settings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const laserValues: MachineProfileValuesFromSettings = getProfileValuesFromSettings(settings);
  const { workAreaXMm, workAreaYMm, sValueMax, hasHomingSwitches }: MachineProfileValuesFromSettings = laserValues;

  const updatedProfile: MachineProfile = { ...profile, workAreaXMm, workAreaYMm, sValueMax, hasHomingSwitches };

  yield put(new MachineProfileSaved({ profile: updatedProfile }));

  return laserValues;
}

function* acceptMachineProfileUpdateFromLaser(action: MachineProfileUpdateFromLaserAccepted): Generator {
  yield call(updateMachineProfileFromLaser, action.payload.profileId);
}

function* readMachineProfileFromLaser(action: MachineProfileReadFromLaserRequested): Generator {
  const laserValues: MachineProfileValuesFromSettings | undefined = (
    yield call(updateMachineProfileFromLaser, action.payload.profileId)
  ) as MachineProfileValuesFromSettings | undefined;

  if (isLaserModeReportedOff(laserValues)) {
    yield call(showLaserModeOffWarning);
  }
}

export function* watchMachineProfiles(): Generator {
  const storedDocument: MachineProfilesDocument =
    (yield call([MACHINE_PROFILES_STORAGE, MACHINE_PROFILES_STORAGE.getStoredDocument])) as MachineProfilesDocument;

  yield put(new MachineProfilesLoaded({ document: storedDocument }));
  yield takeEvery(PROFILE_CHANGE_ACTION_TYPES, storeMachineProfiles);
  yield takeEvery(ConnectionEstablished.type, checkMachineProfileOnConnect);
  yield takeEvery(MachineProfileUpdateFromLaserAccepted.type, acceptMachineProfileUpdateFromLaser);
  yield takeEvery(MachineProfileReadFromLaserRequested.type, readMachineProfileFromLaser);
}

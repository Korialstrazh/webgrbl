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
import { getReportedProfileFields } from '../profiles/get.reported.profile.fields';
import { getValidlyReportedProfileValues } from '../profiles/get.validly.reported.profile.values';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../profiles/interfaces/MachineProfilesDocument';
import type { ReportedMachineProfileValues } from '../profiles/interfaces/ReportedMachineProfileValues';
import type { ReportedMachineWorkArea } from '../profiles/interfaces/ReportedMachineWorkArea';
import { MACHINE_PROFILES_STORAGE } from '../profiles/machine.profiles.storage';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { isBoolean } from '../type.guards/is.boolean';
import { isFiniteNumber } from '../type.guards/is.finite.number';
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
  selectMachineProfiles,
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

const hasReportedWorkArea = (laserValues: ReportedMachineProfileValues): laserValues is ReportedMachineWorkArea =>
  isFiniteNumber(laserValues.workAreaXMm) && isFiniteNumber(laserValues.workAreaYMm);

const isActiveWorkAreaDifferent = (
  activeProfile: MachineProfile | undefined,
  laserValues: ReportedMachineWorkArea,
): activeProfile is MachineProfile =>
  !!activeProfile
  && (activeProfile.workAreaXMm !== laserValues.workAreaXMm || activeProfile.workAreaYMm !== laserValues.workAreaYMm);

/** True only when the laser reports `$32` and it is off; a laser that does not report it gets no warning. */
const isLaserModeReportedOff = (laserValues: ReportedMachineProfileValues | undefined): boolean =>
  isBoolean(laserValues?.isLaserModeOn) && !laserValues.isLaserModeOn;

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

function* createMachineProfileFromLaser(laserValues: ReportedMachineWorkArea): Generator {
  const profile: MachineProfile = newMachineProfile(getReportedProfileFields(laserValues));

  yield put(new MachineProfileSaved({ profile }));
  yield put(new ActiveMachineProfileSelected({ profileId: profile.id }));
  yield put(new ToastShown({
    severity: TOAST_SEVERITY.INFO,
    messageKey: DEFAULT.TOAST_PROFILE_CREATED,
    messageParameters: { name: profile.name },
  }));
}

function* showProfileDiffersWarning(profile: MachineProfile, laserValues: ReportedMachineWorkArea): Generator {
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
  const laserValues: ReportedMachineProfileValues =
    getValidlyReportedProfileValues(action.payload.connectionInfo.settings);
  const profiles: MachineProfile[] = (yield select(selectMachineProfiles)) as MachineProfile[];
  const activeProfile: MachineProfile | undefined =
    (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  // Without a valid work area there is nothing to create a profile from or to compare against.
  if (hasReportedWorkArea(laserValues)) {
    if (!profiles.length) {
      yield call(createMachineProfileFromLaser, laserValues);
    } else if (isActiveWorkAreaDifferent(activeProfile, laserValues)) {
      yield call(showProfileDiffersWarning, activeProfile, laserValues);
    }
  }

  if (isLaserModeReportedOff(laserValues)) {
    yield call(showLaserModeOffWarning);
  }
}

/**
 * Applies the values the connected laser reports validly to a profile and keeps the profile's own value for every
 * other field; returns the reported values, or undefined when nothing changed.
 */
function* updateMachineProfileFromLaser(profileId: string): Generator {
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;
  const profile: MachineProfile | undefined =
    (yield select(selectMachineProfile(profileId))) as MachineProfile | undefined;

  if (!isConnected) {
    return undefined;
  }

  if (!profile) {
    return undefined;
  }

  const settings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const laserValues: ReportedMachineProfileValues = getValidlyReportedProfileValues(settings);
  const updatedProfile: MachineProfile = { ...profile, ...getReportedProfileFields(laserValues) };

  yield put(new MachineProfileSaved({ profile: updatedProfile }));

  return laserValues;
}

function* acceptMachineProfileUpdateFromLaser(action: MachineProfileUpdateFromLaserAccepted): Generator {
  yield call(updateMachineProfileFromLaser, action.payload.profileId);
}

function* readMachineProfileFromLaser(action: MachineProfileReadFromLaserRequested): Generator {
  const laserValues: ReportedMachineProfileValues | undefined = (
    yield call(updateMachineProfileFromLaser, action.payload.profileId)
  ) as ReportedMachineProfileValues | undefined;

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

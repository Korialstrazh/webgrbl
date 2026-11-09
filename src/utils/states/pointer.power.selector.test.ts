/**
 * Tests for the pointer power in use: stored per laser profile, with the session's power for a profile that has none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_POINTER_POWER_PERCENT, MAX_POINTER_POWER_PERCENT } from '../machine/machine.command.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { LaserPointerPowerChanged } from './laser.pointer.state';
import { ActiveMachineProfileSelected, MachineProfileSaved, selectActiveMachineProfile } from './machine.profile.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { selectPointerPowerPercent } from './pointer.power.selector';

const SESSION_POWER_PERCENT = 2;
const FIRST_PROFILE_POWER_PERCENT = 3;
const SECOND_PROFILE_POWER_PERCENT = 0.5;
const OUT_OF_RANGE_POWER_PERCENT = 40;

const addActiveProfile = (store: AppStore, profile: MachineProfile): void => {
  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
};

describe('selectPointerPowerPercent', () => {
  it('uses the default power with no profile', () => {
    expect(selectPointerPowerPercent(newStore().getState())).toBe(DEFAULT_POINTER_POWER_PERCENT);
  });

  it('starts a profile without a stored power from the power set in this session', () => {
    const store: AppStore = newStore();

    store.dispatch(new LaserPointerPowerChanged({ percent: SESSION_POWER_PERCENT }));
    addActiveProfile(store, newMachineProfile());

    expect(selectPointerPowerPercent(store.getState())).toBe(SESSION_POWER_PERCENT);
  });

  it('stores a power change in the active profile and keeps each profile its own power', () => {
    const store: AppStore = newStore();
    const firstProfile: MachineProfile = newMachineProfile();
    const secondProfile: MachineProfile = newMachineProfile({ pointerPowerPercent: SECOND_PROFILE_POWER_PERCENT });

    store.dispatch(new MachineProfileSaved({ profile: secondProfile }));
    addActiveProfile(store, firstProfile);
    store.dispatch(new LaserPointerPowerChanged({ percent: FIRST_PROFILE_POWER_PERCENT }));

    expect(selectActiveMachineProfile(store.getState())?.pointerPowerPercent).toBe(FIRST_PROFILE_POWER_PERCENT);

    store.dispatch(new ActiveMachineProfileSelected({ profileId: secondProfile.id }));

    expect(selectPointerPowerPercent(store.getState())).toBe(SECOND_PROFILE_POWER_PERCENT);

    store.dispatch(new ActiveMachineProfileSelected({ profileId: firstProfile.id }));

    expect(selectPointerPowerPercent(store.getState())).toBe(FIRST_PROFILE_POWER_PERCENT);
  });

  it('keeps a stored power out of range inside the pointer range', () => {
    const store: AppStore = newStore();

    addActiveProfile(store, newMachineProfile({ pointerPowerPercent: OUT_OF_RANGE_POWER_PERCENT }));

    expect(selectPointerPowerPercent(store.getState())).toBe(MAX_POINTER_POWER_PERCENT);
  });
});

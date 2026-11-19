/**
 * Reads the bed the project is laid out on: the connected controller's travel, else the active profile's bed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { select } from 'redux-saga/effects';
import { getBedDimensions } from '../bed/get.bed.dimensions';
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import { selectActiveMachineProfile } from './machine.profile.state';

export function* getCurrentBed(): Generator<unknown, BedDimensions> {
  const settings: Record<number, string> = (yield select(selectGrblSettings)) as Record<number, string>;
  const isConnected: boolean = (yield select(selectIsConnected)) as boolean;
  const activeProfile: MachineProfile | undefined =
    (yield select(selectActiveMachineProfile)) as MachineProfile | undefined;

  return getBedDimensions(settings, isConnected, activeProfile);
}

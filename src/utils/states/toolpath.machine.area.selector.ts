/**
 * Selects the machine a toolpath is made for: the bed size the user sees (the active profile's work area, else the
 * connected laser's travel, else the default), and the active profile's origin corner. The same frame draws the
 * work-zero marker, so the toolpath starts where the marker is.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createSelector } from '@reduxjs/toolkit';
import { getBedDimensions } from '../bed/get.bed.dimensions';
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { selectGrblSettings, selectIsConnected } from './grbl.connection.state';
import { selectActiveMachineProfile } from './machine.profile.state';

export const selectToolpathMachineArea = createSelector(
  [selectGrblSettings, selectIsConnected, selectActiveMachineProfile],
  (
    settings: Record<number, string>,
    isConnected: boolean,
    profile: MachineProfile | undefined,
  ): ToolpathMachineArea => {
    const { widthMm, heightMm }: BedDimensions = getBedDimensions(settings, isConnected, profile);

    return {
      workAreaXMm: widthMm,
      workAreaYMm: heightMm,
      originCorner: profile?.originCorner ?? DEFAULT_MACHINE_ORIGIN_CORNER,
    };
  },
);

/**
 * Gets the bed size the way the bed panel does: from the machine settings while connected, otherwise from the active
 * profile.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useSelector } from 'react-redux';
import { getBedDimensions } from '../bed/get.bed.dimensions';
import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { selectGrblSettings, selectIsConnected } from '../states/grbl.connection.state';
import { selectActiveMachineProfile } from '../states/machine.profile.state';

export const useBedDimensions = (): BedDimensions => {
  const settings: Record<number, string> = useSelector(selectGrblSettings);
  const isConnected: boolean = useSelector(selectIsConnected);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);

  return getBedDimensions(settings, isConnected, activeProfile);
};

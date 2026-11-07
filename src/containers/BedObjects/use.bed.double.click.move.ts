/**
 * The double-click on empty bed that moves the laser there, when the user switched it on. The state is read at the
 * moment of the double-click, so a job, frame or overlay that started since the last render still blocks it; a
 * blocked double-click does nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useCallback } from 'react';
import type { MouseEvent, RefObject } from 'react';
import { getBedSvgPoint } from './get.bed.svg.point';
import { getBedMachinePoint } from './get.bed.machine.point';
import type { BedSvgPoint } from './interfaces/BedSvgPoint';
import { getBedDoubleClickJogCommand } from '../../utils/machine/get.bed.double.click.jog.command';
import { DEFAULT_MACHINE_JOG_FEED_RATE } from '../../utils/profiles/machine.profile.constants';
import { selectIsBedDoubleClickMovingLaser } from '../../utils/states/app.preferences.state';
import { selectIsConnected } from '../../utils/states/grbl.connection.state';
import { selectIsJobRunActive } from '../../utils/states/job.run.state';
import { selectIsLaserPointerFiring } from '../../utils/states/laser.pointer.state';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { MachineLineRequested, selectMachineStatus } from '../../utils/states/machine.status.state';
import type { AppRootState, AppStore } from '../../utils/states/new.store';
import { selectToolpathMachineArea } from '../../utils/states/toolpath.machine.area.selector';
import { selectIsAnyOverlayOpen } from '../../utils/states/ui.overlay.state';
import { useAppStore } from '../../utils/states/use.app.store';

const getBedDoubleClickLine = (state: AppRootState, svgPoint: BedSvgPoint, bedHeightMm: number): string | undefined =>
  getBedDoubleClickJogCommand({
    isPreferenceOn: selectIsBedDoubleClickMovingLaser(state),
    isConnected: selectIsConnected(state),
    machineState: selectMachineStatus(state)?.machineState,
    isJobRunActive: selectIsJobRunActive(state),
    isPointerFiring: selectIsLaserPointerFiring(state),
    isOverlayOpen: selectIsAnyOverlayOpen(state),
    bedPoint: getBedMachinePoint(svgPoint, bedHeightMm),
    machineArea: selectToolpathMachineArea(state),
    feedRate: selectActiveMachineProfile(state)?.jogFeedRate ?? DEFAULT_MACHINE_JOG_FEED_RATE,
  });

export const useBedDoubleClickMove = (
  layerRef: RefObject<SVGGElement | null>,
  bedHeightMm: number,
): ((mouseEvent: MouseEvent<SVGElement>) => void) => {
  const store: AppStore = useAppStore();

  return useCallback((mouseEvent: MouseEvent<SVGElement>): void => {
    const svgElement: SVGSVGElement | null | undefined = layerRef.current?.ownerSVGElement;
    const svgPoint: BedSvgPoint | undefined =
      svgElement ? getBedSvgPoint(svgElement, mouseEvent.clientX, mouseEvent.clientY) : undefined;
    const line: string | undefined = svgPoint && getBedDoubleClickLine(store.getState(), svgPoint, bedHeightMm);

    if (line) {
      store.dispatch(new MachineLineRequested({ line }));
    }
  }, [store, layerRef, bedHeightMm]);
};

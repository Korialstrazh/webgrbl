/**
 * What the playback bar's controls do: play or pause, jump to either end, set the time or the speed, and toggle play
 * from the keyboard.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { KeyboardEvent } from 'react';
import type { SimulationSpeed } from '../../../utils/states/simulation.speed.constants';

export interface SimulationTransport {
  /** Starts the playback (from 0 when at the end) or pauses it; does nothing while the toolpath may not play. */
  toggleSimulationPlay: () => void;
  /** Sends the time back to 0. */
  goToSimulationStart: () => void;
  /** Sends the time to the end of the job. */
  goToSimulationEnd: () => void;
  /** Sets the time, kept inside the job. */
  setSimulationTime: (timeS: number) => void;
  /** Sets the playback speed. */
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  /** Toggles play on Space, unless a button or input of the bar handles the key itself. */
  handleBarKeyDown: (keyEvent: KeyboardEvent<HTMLDivElement>) => void;
}

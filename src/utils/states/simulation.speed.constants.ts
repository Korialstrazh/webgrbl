/**
 * The playback speeds of the toolpath simulation: how many seconds of job time pass per real second.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const SIMULATION_SPEED_REAL_TIME = 1;
export const SIMULATION_SPEED_TEN_TIMES = 10;
export const SIMULATION_SPEED_FIFTY_TIMES = 50;
export const SIMULATION_SPEED_TWO_HUNDRED_TIMES = 200;

export const SIMULATION_SPEEDS = [
  SIMULATION_SPEED_REAL_TIME,
  SIMULATION_SPEED_TEN_TIMES,
  SIMULATION_SPEED_FIFTY_TIMES,
  SIMULATION_SPEED_TWO_HUNDRED_TIMES,
] as const;

export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export const DEFAULT_SIMULATION_SPEED: SimulationSpeed = SIMULATION_SPEED_REAL_TIME;

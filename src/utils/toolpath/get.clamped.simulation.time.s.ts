/**
 * Gets a simulation time kept inside the job, from 0 to its total time. Every dispatcher of a new time (the playback
 * bar and its frame loop) passes the time through here, since only they know the total; the reducer only keeps it
 * from going below 0.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getClampedSimulationTimeS = (timeS: number, totalTimeS: number): number =>
  Math.min(Math.max(timeS, 0), totalTimeS);

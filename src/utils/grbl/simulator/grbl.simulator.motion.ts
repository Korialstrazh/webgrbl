import {
  GRBL_SIMULATOR_DECELERATION_MS,
  GRBL_SIMULATOR_MOTION_PHASE,
  GRBL_SIMULATOR_MOTION_TICK_MS,
  GRBL_SIMULATOR_MS_PER_MINUTE,
  GRBL_SIMULATOR_ORIGIN,
  GRBL_SIMULATOR_PLANNER_BLOCK_COUNT,
} from './grbl.simulator.constants';
import type { GrblSimulatorMotionPhase } from './grbl.simulator.constants';
import type { GrblAxisPosition } from '../interfaces/GrblAxisPosition';
import type { GrblSimulatorMotionBlock } from './interfaces/GrblSimulatorMotionBlock';
import type { GrblSimulatorPlannedBlock } from './interfaces/GrblSimulatorPlannedBlock';

type GrblSimulatorStoppingPhase =
  | typeof GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING
  | typeof GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE
  | typeof GRBL_SIMULATOR_MOTION_PHASE.JOG_CANCELLING;

const getInterpolatedPosition = (block: GrblSimulatorPlannedBlock): GrblAxisPosition => {
  const progress: number = block.elapsedMs / block.durationMs;

  return {
    x: block.start.x + (block.target.x - block.start.x) * progress,
    y: block.start.y + (block.target.y - block.start.y) * progress,
    z: block.start.z + (block.target.z - block.start.z) * progress,
  };
};

const getBlockFeedRate = (block: GrblSimulatorMotionBlock, start: GrblAxisPosition): number => {
  const distance: number = Math.hypot(block.target.x - start.x, block.target.y - start.y, block.target.z - start.z);

  return block.durationMs ? (distance / block.durationMs) * GRBL_SIMULATOR_MS_PER_MINUTE : 0;
};

/**
 * Motion planner of the simulated controller: holds up to 15 blocks and moves the machine position along them in
 * 20 ms ticks. A feed hold or jog cancel slows the machine to a stop over 200 ms.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblSimulatorMotion {
  /** Called whenever blocks leave the planner, so waiting lines can move in. */
  private readonly blocksFreedListener: () => void;
  /** Planned blocks, the running one first. */
  private plannedBlocks: GrblSimulatorPlannedBlock[] = [];
  /** Machine position in millimetres right now. */
  private currentPosition: GrblAxisPosition = GRBL_SIMULATOR_ORIGIN;
  /** Feed hold or jog cancel in progress, or undefined while moving normally. */
  private stoppingPhase: GrblSimulatorStoppingPhase | undefined;
  /** Time since the current deceleration started, in milliseconds. */
  private decelerationElapsedMs = 0;
  /** Interval that drives the motion ticks; only set while something moves. */
  private tickTimer: ReturnType<typeof setInterval> | undefined;

  public constructor(blocksFreedListener: () => void) {
    this.blocksFreedListener = blocksFreedListener;
  }

  public enqueueBlock(block: GrblSimulatorMotionBlock, isJog: boolean): void {
    const start: GrblAxisPosition = this.plannedBlocks.at(-1)?.target ?? this.currentPosition;

    this.plannedBlocks.push({ ...block, start, feedRate: getBlockFeedRate(block, start), isJog, elapsedMs: 0 });
    this.updateTickTimer();
  }

  public isPlannerFull(): boolean {
    return this.plannedBlocks.length >= GRBL_SIMULATOR_PLANNER_BLOCK_COUNT;
  }

  public hasPlannedBlocks(): boolean {
    return Boolean(this.plannedBlocks.length);
  }

  public getMotionPhase(): GrblSimulatorMotionPhase {
    if (this.stoppingPhase) {
      return this.stoppingPhase;
    }

    const runningBlock: GrblSimulatorPlannedBlock | undefined = this.plannedBlocks[0];

    if (!runningBlock) {
      return GRBL_SIMULATOR_MOTION_PHASE.IDLE;
    }

    return runningBlock.isJog ? GRBL_SIMULATOR_MOTION_PHASE.JOG : GRBL_SIMULATOR_MOTION_PHASE.RUN;
  }

  public getPosition(): GrblAxisPosition {
    return this.currentPosition;
  }

  public getCurrentFeedRate(): number {
    return (this.plannedBlocks[0]?.feedRate ?? 0) * this.getSpeedFactor();
  }

  public getCurrentLaserPower(): number {
    const isMoving: boolean = this.getSpeedFactor() > 0;

    return isMoving ? (this.plannedBlocks[0]?.spindleSpeed ?? 0) : 0;
  }

  /** Starts a feed hold; without planned motion the hold is complete at once. */
  public startFeedHold(): void {
    if (this.stoppingPhase) {
      return;
    }

    this.stoppingPhase = this.hasPlannedBlocks()
      ? GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING
      : GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE;
    this.decelerationElapsedMs = 0;
    this.updateTickTimer();
  }

  /** Continues after a completed feed hold; ignored while the machine is still slowing down, as in GRBL. */
  public resumeCycle(): void {
    if (this.stoppingPhase !== GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE) {
      return;
    }

    this.stoppingPhase = undefined;
    this.updateTickTimer();
  }

  public cancelJog(): void {
    if (this.getMotionPhase() !== GRBL_SIMULATOR_MOTION_PHASE.JOG) {
      return;
    }

    this.stoppingPhase = GRBL_SIMULATOR_MOTION_PHASE.JOG_CANCELLING;
    this.decelerationElapsedMs = 0;
  }

  /** Drops all planned motion at once and keeps the position reached so far. */
  public stopMotion(): void {
    this.plannedBlocks = [];
    this.stoppingPhase = undefined;
    this.updateTickTimer();
  }

  public setPosition(position: GrblAxisPosition): void {
    this.currentPosition = position;
  }

  private isDecelerating(): boolean {
    return (
      this.stoppingPhase === GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING ||
      this.stoppingPhase === GRBL_SIMULATOR_MOTION_PHASE.JOG_CANCELLING
    );
  }

  /** Share of full speed the machine moves at: falls linearly to 0 while decelerating, 0 while held. */
  private getSpeedFactor(): number {
    if (this.isDecelerating()) {
      return Math.max(0, 1 - this.decelerationElapsedMs / GRBL_SIMULATOR_DECELERATION_MS);
    }

    return this.stoppingPhase === GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE ? 0 : 1;
  }

  private isTickTimerNeeded(): boolean {
    const hasRunnableBlocks: boolean = this.hasPlannedBlocks() && this.getSpeedFactor() > 0;

    return hasRunnableBlocks || this.isDecelerating();
  }

  private updateTickTimer(): void {
    if (!this.isTickTimerNeeded()) {
      clearInterval(this.tickTimer);
      this.tickTimer = undefined;

      return;
    }

    this.tickTimer ??= setInterval((): void => this.advanceMotionTick(), GRBL_SIMULATOR_MOTION_TICK_MS);
  }

  private advanceMotionTick(): void {
    const travelMs: number = GRBL_SIMULATOR_MOTION_TICK_MS * this.getSpeedFactor();
    const completedBlockCount: number = this.advanceBlocks(travelMs);
    const flushedBlockCount: number = this.advanceDeceleration();

    this.updateTickTimer();

    if (completedBlockCount + flushedBlockCount) {
      this.blocksFreedListener();
    }
  }

  /** Moves along the planned blocks for the given time and returns how many blocks finished. */
  private advanceBlocks(travelMs: number): number {
    let remainingMs: number = travelMs;
    let completedBlockCount = 0;

    while (remainingMs > 0) {
      const runningBlock: GrblSimulatorPlannedBlock | undefined = this.plannedBlocks[0];

      if (!runningBlock) {
        break;
      }

      const stepMs: number = Math.min(remainingMs, runningBlock.durationMs - runningBlock.elapsedMs);
      runningBlock.elapsedMs += stepMs;
      remainingMs -= stepMs;

      if (runningBlock.elapsedMs < runningBlock.durationMs) {
        this.currentPosition = getInterpolatedPosition(runningBlock);
        break;
      }

      this.currentPosition = runningBlock.target;
      this.plannedBlocks.shift();
      completedBlockCount++;
    }

    return completedBlockCount;
  }

  /** Ends a finished deceleration and returns how many blocks a jog cancel dropped. */
  private advanceDeceleration(): number {
    if (!this.isDecelerating()) {
      return 0;
    }

    this.decelerationElapsedMs += GRBL_SIMULATOR_MOTION_TICK_MS;

    if (this.decelerationElapsedMs < GRBL_SIMULATOR_DECELERATION_MS) {
      return 0;
    }

    if (this.stoppingPhase === GRBL_SIMULATOR_MOTION_PHASE.HOLD_DECELERATING) {
      this.stoppingPhase = GRBL_SIMULATOR_MOTION_PHASE.HOLD_COMPLETE;

      return 0;
    }

    const flushedBlockCount: number = this.plannedBlocks.length;
    this.plannedBlocks = [];
    this.stoppingPhase = undefined;

    return flushedBlockCount;
  }
}

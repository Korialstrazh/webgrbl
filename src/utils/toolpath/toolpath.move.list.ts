import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathMoveStyle } from './interfaces/ToolpathMoveStyle';
import { MOVE_MIN_LENGTH_MM, TOOLPATH_MOVE_KIND, TRAVEL_POWER_PERCENT } from './toolpath.constants';

/**
 * Collects the moves of one layer in order, always starting each move where the head is, and leaves out moves that
 * would not go anywhere.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class ToolpathMoveList {
  /** The moves collected so far, in burn order. */
  private readonly moves: ToolpathMove[] = [];

  /** Where the head is after the last move. */
  private position: GeometryPoint;

  /** The layer fields every move of this list carries. */
  private readonly moveStyle: ToolpathMoveStyle;

  public constructor(startPoint: GeometryPoint, moveStyle: ToolpathMoveStyle) {
    this.position = startPoint;
    this.moveStyle = moveStyle;
  }

  public getMoves(): ToolpathMove[] {
    return this.moves;
  }

  public getPosition(): GeometryPoint {
    return this.position;
  }

  public addTravelMove(to: GeometryPoint): void {
    this.addMove(TOOLPATH_MOVE_KIND.TRAVEL, to, TRAVEL_POWER_PERCENT);
  }

  public addBurnMove(to: GeometryPoint, powerPercent: number): void {
    this.addMove(TOOLPATH_MOVE_KIND.BURN, to, powerPercent);
  }

  private addMove(kind: ToolpathMove['kind'], to: GeometryPoint, powerPercent: number): void {
    if (Math.hypot(to.x - this.position.x, to.y - this.position.y) < MOVE_MIN_LENGTH_MM) {
      return;
    }

    this.moves.push({ ...this.moveStyle, kind, from: this.position, to, powerPercent });
    this.position = to;
  }
}

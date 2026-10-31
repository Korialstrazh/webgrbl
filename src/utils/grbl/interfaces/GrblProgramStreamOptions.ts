/**
 * How a program is streamed.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface GrblProgramStreamOptions {
  /** Whether the first line error stops the machine and ends the program; otherwise errors are collected. */
  isStopOnErrorEnabled: boolean;
}

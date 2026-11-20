/**
 * What a resume needs from a job run that stopped early: the program lines that streamed, with the toolpath they
 * came from.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GcodeLine } from '../../toolpath/interfaces/GcodeLine';
import type { Toolpath } from '../../toolpath/interfaces/Toolpath';

export interface JobResumeState {
  /** The program lines the run streamed, each with the move it carries out. */
  lines: GcodeLine[];
  /** How many leading entries of lines the laser had answered when the run stopped; skipped blank lines count. */
  answeredLineCount: number;
  /** Version of the toolpath document when the run started; a later edit makes the resume stale. */
  toolpathDocumentVersion: number;
  /** Id of the machine profile the program was written for. */
  profileId: string;
  /** The toolpath the lines were written from, so a resume slices the toolpath that ran. */
  toolpath: Toolpath;
}

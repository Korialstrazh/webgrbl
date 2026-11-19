/**
 * What the actions that ask for and report a new project name carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectIdPayload } from './ProjectIdPayload';

export interface ProjectNamePayload extends ProjectIdPayload {
  /** The new display name, as typed or as stored. */
  name: string;
}

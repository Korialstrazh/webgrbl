/**
 * What the actions that ask for and report a new project name carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectIdPayload } from './ProjectIdPayload';

export interface ProjectNamePayload extends ProjectIdPayload {
  /** The new display name, as typed or as stored. */
  name: string;
}

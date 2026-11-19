/**
 * What the action that asks to open a .webgrbl.json project file carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ProjectFilePayload {
  /** The project file the user picked. */
  file: File;
}

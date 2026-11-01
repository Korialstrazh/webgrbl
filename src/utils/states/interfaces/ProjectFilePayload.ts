/**
 * What the action that asks to open a .webgrbl.json project file carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ProjectFilePayload {
  /** The project file the user picked. */
  file: File;
}

/**
 * What the MaterialPresetDeleted action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MaterialPresetDeletedPayload {
  /** The preset to remove. */
  presetId: string;
}

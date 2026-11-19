/**
 * What the user has typed into a layer setting and not yet committed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface LayerFieldDraft {
  /** The typed number, or null while the field is empty. */
  fieldValue: number | null;
}

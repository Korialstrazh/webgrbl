/**
 * What the user has typed into a number field while editing it; a cleared field has no value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface NumberFieldDraft {
  fieldValue: number | null;
}

/**
 * What the user has typed into a placement field and not yet committed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ObjectFieldDraft {
  /** The typed number, or null while the field is empty. */
  fieldValue: number | null;
}

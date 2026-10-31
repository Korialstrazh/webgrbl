/**
 * One choice of a SegmentedControl: the value it reports and the text it shows.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface SegmentedOption {
  /** The value reported when the option is selected. */
  value: string;
  label: string;
}

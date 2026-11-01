/**
 * What one placement field needs: its label, the stored value and what to do with a new value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ObjectTransformFieldProps {
  label: string;
  /** The value stored in the project. */
  value: number;
  decimals: number;
  /** Called with a changed value when the user leaves the field or presses Enter. */
  onCommit: (fieldValue: number) => void;
}

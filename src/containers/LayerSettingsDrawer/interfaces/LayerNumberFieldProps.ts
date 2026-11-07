/**
 * What one layer number field needs: its label, the stored value, a hint under it and what to do with a new value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';

export interface LayerNumberFieldProps {
  label: string;
  /** The icon at the start of the field. */
  iconComponent: ReactNode;
  captionText?: string;
  unitText?: string;
  /** The value stored in the project. */
  value: number;
  decimals: number;
  /** The smallest value the field commits; a lower one is dropped and the stored value shows again. */
  minValue?: number;
  /** Text under the field, such as the watts a percent gives; undefined shows nothing. */
  hintText: string | undefined;
  /** Called with a changed value when the user leaves the field or presses Enter. */
  onCommit: (fieldValue: number) => void;
}

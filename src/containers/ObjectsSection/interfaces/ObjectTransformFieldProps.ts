/**
 * What one placement field needs: its label, the stored value and what to do with a new value.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';

export interface ObjectTransformFieldProps {
  label: string;
  /** Tooltip naming the field and its unit. */
  hintText: string;
  /** Icon or letter shown inside the input. */
  prefixComponent: ReactNode;
  /** The value stored in the project. */
  value: number;
  decimals: number;
  /** Called with a changed value when the user leaves the field or presses Enter. */
  onCommit: (fieldValue: number) => void;
}

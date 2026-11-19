/**
 * What the Import SVG button needs: the antd button type it is drawn with.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ButtonProps } from 'antd';
import type { ReactNode } from 'react';

export interface SvgImportButtonProps {
  /** The antd button type; a bordered button when left out. */
  buttonType?: ButtonProps['type'];
  /** An icon before the label; with it, the label may be hidden in a narrow window and the icon stays. */
  iconComponent?: ReactNode;
  /** Class of the label, so a narrow layout can hide it; the button keeps the label as its accessible name. */
  labelClassName?: string;
  /** The id of the button, so another control can move the focus to it. */
  buttonId?: string;
}

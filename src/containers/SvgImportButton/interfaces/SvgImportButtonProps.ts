/**
 * What the Import SVG button needs: the antd button type it is drawn with.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ButtonProps } from 'antd';

export interface SvgImportButtonProps {
  /** The antd button type; a bordered button when left out. */
  buttonType?: ButtonProps['type'];
}

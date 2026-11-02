/**
 * The banner the Toolpath view shows for a status with no toolpath to show, with a button that asks for one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { AlertProps } from 'antd';

export interface ToolpathRequestBanner {
  /** Locale key of the banner text. */
  messageKey: string;
  /** How the banner looks: a warning for a toolpath that is out of date or failed, information when there is none. */
  alertType: AlertProps['type'];
  /** Locale key of the button that asks for a toolpath. */
  actionLabelKey: string;
}

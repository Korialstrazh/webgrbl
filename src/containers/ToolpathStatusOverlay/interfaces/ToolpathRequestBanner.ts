/**
 * The banner the Toolpath view shows for a status with no toolpath to show, with a button that asks for one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

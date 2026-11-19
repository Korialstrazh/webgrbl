/**
 * The antd status props of a form item: its error state and message.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { FormItemProps } from 'antd';

export type PaletteFieldStatus = Pick<FormItemProps, 'validateStatus' | 'help'>;

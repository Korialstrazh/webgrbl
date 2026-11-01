/**
 * The antd status props of a form item: its error state and message.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { FormItemProps } from 'antd';

export type PaletteFieldStatus = Pick<FormItemProps, 'validateStatus' | 'help'>;

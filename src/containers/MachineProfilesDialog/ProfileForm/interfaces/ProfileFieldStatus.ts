/**
 * How a profile form field shows its validation result: the antd status and the error text below the field.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { FormItemProps } from 'antd';

export type ProfileFieldStatus = Pick<FormItemProps, 'validateStatus' | 'help'>;

/**
 * How a profile form field shows its validation result: the antd status and the error text below the field.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { FormItemProps } from 'antd';

export type ProfileFieldStatus = Pick<FormItemProps, 'validateStatus' | 'help'>;

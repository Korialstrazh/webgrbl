/**
 * The number input every field uses: the antd input that also takes a comma as the decimal mark.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';
import type { ReactNode } from 'react';
import { getDecimalNumberText } from '../../utils/get.decimal.number.text';

// The input reads the parsed text as a decimal itself, so an empty field stays empty instead of becoming 0 as
// Number('') would; the antd type asks for the value type, hence the cast.
const parseDecimalNumberText = (displayText?: string): number => getDecimalNumberText(displayText) as unknown as number;

export const DecimalNumberInput = (props: InputNumberProps<number>): ReactNode => (
  <InputNumber<number> parser={parseDecimalNumberText} {...props} />
);

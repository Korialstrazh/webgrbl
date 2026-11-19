/**
 * A percentage as CSS text, such as 25%, for a splitter size or a custom property.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PERCENT_SUFFIX } from '../percent.constants';

export const getPercentText = (percent: number): string => `${percent}${PERCENT_SUFFIX}`;

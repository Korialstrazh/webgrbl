/**
 * A percentage as CSS text, such as 25%, for a splitter size or a custom property.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PERCENT_SUFFIX } from '../percent.constants';

export const getPercentText = (percent: number): string => `${percent}${PERCENT_SUFFIX}`;

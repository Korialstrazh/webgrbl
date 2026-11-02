/**
 * The view of the bed one ruler layout works on: the request, the part of the bed in view, its scale and the text
 * sizes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedRulersRequest } from './BedRulersRequest';
import type { BedRulerTextSizes } from './BedRulerTextSizes';
import type { BedViewBox } from './BedViewBox';

export interface BedRulerView {
  request: BedRulersRequest;
  viewBox: BedViewBox;
  pixelsPerMm: number;
  textSizes: BedRulerTextSizes;
}

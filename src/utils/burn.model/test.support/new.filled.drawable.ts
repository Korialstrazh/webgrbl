/**
 * Test factory for a bed drawable with its subpaths filled in a colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgSubpath } from '../../svg/geometry/interfaces/SvgSubpath';
import type { BedDrawable } from '../../toolpath/interfaces/BedDrawable';
import { newBedDrawable } from '../../toolpath/test.support/new.bed.drawable';
import { newDrawablePaint } from '../../toolpath/test.support/new.drawable.paint';
import { newSvgPaint } from '../../toolpath/test.support/new.svg.paint';

export const newFilledDrawable = (subpaths: SvgSubpath[], colour: string): BedDrawable => newBedDrawable({
  subpaths,
  paint: newDrawablePaint({ fill: newSvgPaint({ colour }) }),
});

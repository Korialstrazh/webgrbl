/**
 * Test factory for a bed drawable with its subpaths filled in a colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

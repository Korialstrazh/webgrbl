import { describe, expect, it } from 'vitest';
import { DESIGN_PAINT_ROLE } from './bed.design.constants';
import type { DesignLayerLook } from './interfaces/DesignLayerLook';
import type { ObjectDesignDrawing } from './interfaces/ObjectDesignDrawing';
import { isDesignDrawnAsAuthored } from './is.design.drawn.as.authored';
import { LAYER_MODE } from '../palette/palette.constants';
import { SVG_FILL_RULE } from '../svg/geometry/svg.geometry.constants';

const RED = '#ff0000';

const DRAWING: ObjectDesignDrawing = {
  runs: [{
    runKey: 'fill:red:0',
    role: DESIGN_PAINT_ROLE.FILL,
    layerKey: RED,
    paints: [{
      role: DESIGN_PAINT_ROLE.FILL,
      layerKey: RED,
      pathData: 'M0 0L1 0L1 1Z',
      colour: RED,
      opacity: 1,
      strokeWidthMm: 0,
      fillRule: SVG_FILL_RULE.NONZERO,
    }],
  }],
};

const getLooks = (look: DesignLayerLook): ReadonlyMap<string, DesignLayerLook> => new Map([[RED, look]]);

describe(isDesignDrawnAsAuthored.name, () => {
  it('is true when every paint is on a fill layer that is on', () => {
    expect(isDesignDrawnAsAuthored(DRAWING, getLooks({ mode: LAYER_MODE.FILL, isEnabled: true, colour: RED })))
      .toBe(true);
  });

  it('is false when a paint is on a Line layer', () => {
    expect(isDesignDrawnAsAuthored(DRAWING, getLooks({ mode: LAYER_MODE.LINE, isEnabled: true, colour: RED })))
      .toBe(false);
  });

  it('is false when a paint is on a layer that is off', () => {
    expect(isDesignDrawnAsAuthored(DRAWING, getLooks({ mode: LAYER_MODE.FILL, isEnabled: false, colour: RED })))
      .toBe(false);
  });

  it('is true for a paint on no layer yet and for a drawing with nothing read', () => {
    expect(isDesignDrawnAsAuthored(DRAWING, new Map())).toBe(true);
    expect(isDesignDrawnAsAuthored({ runs: [] }, new Map())).toBe(true);
  });
});

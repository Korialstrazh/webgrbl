import { getToolpathBounds } from './get.toolpath.bounds';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';

const getMove = (from: ToolpathMove['from'], to: ToolpathMove['to']): ToolpathMove => ({
  kind: TOOLPATH_MOVE_KIND.BURN,
  from,
  to,
  powerPercent: 0,
  feedMmPerMin: 1,
  layerKey: '#ff0000',
  airAssist: false,
});

describe(getToolpathBounds.name, () => {
  it('covers every point the head reaches but not the origin it starts from', () => {
    const moves: ToolpathMove[] = [getMove({ x: 0, y: 0 }, { x: 5, y: 6 }), getMove({ x: 5, y: 6 }, { x: 9, y: 2 })];

    expect(getToolpathBounds(moves)).toEqual({ minX: 5, minY: 2, maxX: 9, maxY: 6 });
  });

  it('is undefined without moves', () => {
    expect(getToolpathBounds([])).toBeUndefined();
  });
});

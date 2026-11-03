import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import { getToolpath } from '../toolpath/get.toolpath';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { getBoxSubpath } from '../toolpath/test.support/get.box.subpath';
import { newBedDrawable } from '../toolpath/test.support/new.bed.drawable';
import { newDrawablePaint } from '../toolpath/test.support/new.drawable.paint';
import { newSvgPaint } from '../toolpath/test.support/new.svg.paint';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMachineArea } from '../toolpath/test.support/new.toolpath.machine.area';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { getBurnChains } from './get.burn.chains';
import type { BurnChain } from './interfaces/BurnChain';

const RED = '#ff0000';
const BLUE = '#0000ff';
const GREEN = '#00a000';
const CUT_PASSES = 3;
const SQUARE_SIDE_COUNT = 4;

const CUT_LAYER: ProjectLayer = getNewLayer(RED, DEFAULT_PALETTE, 0);
const SCORE_LAYER: ProjectLayer = getNewLayer(BLUE, DEFAULT_PALETTE, 1);
const FILL_LAYER: ProjectLayer = getNewLayer(GREEN, DEFAULT_PALETTE, 2);

const getSquareToolpath = (): Toolpath => getToolpath({
  drawables: [newBedDrawable({
    subpaths: [getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 })],
    paint: newDrawablePaint({ stroke: newSvgPaint({ colour: RED }) }),
  })],
  warnings: [],
  layers: [CUT_LAYER],
  machineArea: newToolpathMachineArea(),
});

describe(getBurnChains.name, () => {
  it('gives each pass of a closed square its own closed chain, though no travel separates the passes', () => {
    const chains: BurnChain[] = getBurnChains(getSquareToolpath(), [CUT_LAYER]);

    expect(chains.map((chain: BurnChain) => [chain.layerKey, chain.moves.length, chain.isClosed])).toEqual(
      Array.from({ length: CUT_PASSES }, () => [RED, SQUARE_SIDE_COUNT, true]),
    );
  });

  it('ends a chain at a travel and at a zero-power move', () => {
    const moves: ToolpathMove[] = [
      newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 10, y: 0 } }),
      newToolpathMove({ from: { x: 10, y: 0 }, to: { x: 20, y: 0 }, powerPercent: 0 }),
      newToolpathMove({ from: { x: 20, y: 0 }, to: { x: 30, y: 0 } }),
      newToolpathMove({ from: { x: 30, y: 0 }, to: { x: 40, y: 0 }, kind: TOOLPATH_MOVE_KIND.TRAVEL, powerPercent: 0 }),
      newToolpathMove({ from: { x: 40, y: 0 }, to: { x: 50, y: 0 } }),
    ];

    const chains: BurnChain[] = getBurnChains(newToolpath({ moves }), [CUT_LAYER]);

    expect(chains.map((chain: BurnChain) => chain.moves.length)).toEqual([1, 1, 1]);
    expect(chains.every((chain: BurnChain) => !chain.isClosed)).toBe(true);
  });

  it('ends a chain where the layer changes, though the head does not stop', () => {
    const moves: ToolpathMove[] = [
      newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 10, y: 0 }, layerKey: RED }),
      newToolpathMove({ from: { x: 10, y: 0 }, to: { x: 20, y: 0 }, layerKey: BLUE }),
    ];

    const chains: BurnChain[] = getBurnChains(newToolpath({ moves }), [CUT_LAYER, SCORE_LAYER]);

    expect(chains.map((chain: BurnChain) => chain.layerKey)).toEqual([RED, BLUE]);
  });

  it('does not close a curve early when its first points lie within the closed gap of its start', () => {
    const moves: ToolpathMove[] = [
      newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 0.05, y: 0 } }),
      newToolpathMove({ from: { x: 0.05, y: 0 }, to: { x: 5, y: 0 } }),
      newToolpathMove({ from: { x: 5, y: 0 }, to: { x: 5, y: 5 } }),
    ];

    const chains: BurnChain[] = getBurnChains(newToolpath({ moves }), [CUT_LAYER]);

    expect(chains.map((chain: BurnChain) => [chain.moves.length, chain.isClosed])).toEqual([[moves.length, false]]);
  });

  it('leaves out fill layers, disabled layers and layers it does not know', () => {
    const moves: ToolpathMove[] = [
      newToolpathMove({ layerKey: GREEN }),
      newToolpathMove({ layerKey: RED }),
      newToolpathMove({ layerKey: BLUE }),
    ];

    const chains: BurnChain[] = getBurnChains(newToolpath({ moves }), [FILL_LAYER, { ...CUT_LAYER, enabled: false }]);

    expect(chains).toEqual([]);
  });

  it('gives no chains for a toolpath without moves', () => {
    expect(getBurnChains(newToolpath(), [CUT_LAYER])).toEqual([]);
  });
});

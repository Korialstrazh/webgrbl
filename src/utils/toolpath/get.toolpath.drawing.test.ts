import { describe, expect, it } from 'vitest';
import { getToolpathDrawing } from './get.toolpath.drawing';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import { newToolpath } from './test.support/new.toolpath';
import { newToolpathMove } from './test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from './toolpath.constants';
import { TOOLPATH_DISPLAY_MODE, TOOLPATH_PATH_CHUNK_MOVE_COUNT } from './toolpath.drawing.constants';

const BLUE_LAYER_KEY = '#0000ff';
const RED_LAYER_KEY = '#ff0000';
const LONG_LAYER_MOVE_COUNT = 2500;

const getContiguousMoves = (moveCount: number): ToolpathMove[] => Array.from(
  { length: moveCount },
  (_unused: unknown, moveIndex: number): ToolpathMove => newToolpathMove({
    from: { x: moveIndex, y: 0 },
    to: { x: moveIndex + 1, y: 0 },
  }),
);

const MIXED_TOOLPATH: Toolpath = newToolpath({
  moves: [
    newToolpathMove({ from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, powerPercent: 5 }),
    newToolpathMove({ from: { x: 1, y: 0 }, to: { x: 2, y: 0 }, powerPercent: 0 }),
    newToolpathMove({ from: { x: 2, y: 0 }, to: { x: 3, y: 0 }, powerPercent: 100 }),
    newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, from: { x: 3, y: 0 }, to: { x: 3, y: 5 }, powerPercent: 0 }),
    newToolpathMove({ from: { x: 3, y: 5 }, to: { x: 4, y: 5 }, layerKey: BLUE_LAYER_KEY }),
    newToolpathMove({ from: { x: 4, y: 5 }, to: { x: 5.12345, y: 5 }, powerPercent: 9 }),
  ],
});

describe(getToolpathDrawing.name, () => {
  it('draws each layer as one path that starts anew after a gap, and draws power 0 moves with the travel', () => {
    const { strokePaths, travelPathText } = getToolpathDrawing(MIXED_TOOLPATH, TOOLPATH_DISPLAY_MODE.BY_LAYER);

    expect(strokePaths.map(({ pathKey, moveIndices, moveTexts }) => ({ pathKey, moveIndices, moveTexts }))).toEqual([
      { pathKey: RED_LAYER_KEY, moveIndices: [0, 2, 5], moveTexts: ['M0 0L1 0', 'M2 0L3 0', 'M4 5L5.123 5'] },
      { pathKey: BLUE_LAYER_KEY, moveIndices: [4], moveTexts: ['M3 5L4 5'] },
    ]);
    expect(travelPathText).toBe('M1 0L2 0M3 0L3 5');
  });

  it('splits each layer into 10 % power bands in power shading, full power in the last band', () => {
    const { strokePaths } = getToolpathDrawing(MIXED_TOOLPATH, TOOLPATH_DISPLAY_MODE.POWER_SHADING);

    expect(strokePaths.map(({ pathKey, powerBand, moveIndices }) => ({ pathKey, powerBand, moveIndices }))).toEqual([
      { pathKey: `${RED_LAYER_KEY}:0`, powerBand: 0, moveIndices: [0, 5] },
      { pathKey: `${RED_LAYER_KEY}:9`, powerBand: 9, moveIndices: [2] },
      { pathKey: `${BLUE_LAYER_KEY}:5`, powerBand: 5, moveIndices: [4] },
    ]);
  });

  it('keeps the move texts of a long layer joined in chunks that each start with a move to', () => {
    const [strokePath] = getToolpathDrawing(
      newToolpath({ moves: getContiguousMoves(LONG_LAYER_MOVE_COUNT) }),
      TOOLPATH_DISPLAY_MODE.BY_LAYER,
    ).strokePaths;
    const secondChunkMoveTexts: string[] = strokePath?.moveTexts
      .slice(TOOLPATH_PATH_CHUNK_MOVE_COUNT, TOOLPATH_PATH_CHUNK_MOVE_COUNT * 2) ?? [];

    expect(strokePath?.chunkTexts).toHaveLength(Math.ceil(LONG_LAYER_MOVE_COUNT / TOOLPATH_PATH_CHUNK_MOVE_COUNT));
    expect(strokePath?.chunkTexts[1]).toBe(`M${TOOLPATH_PATH_CHUNK_MOVE_COUNT} 0${secondChunkMoveTexts.join('')}`);
  });

  it('draws nothing for a toolpath with no moves', () => {
    expect(getToolpathDrawing(newToolpath(), TOOLPATH_DISPLAY_MODE.BY_LAYER)).toEqual({
      strokePaths: [],
      travelPathText: '',
    });
  });
});

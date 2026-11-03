import { BoxGeometry, BufferAttribute, BufferGeometry } from 'three';
import { BURN_SCENE_ATTRIBUTE } from './burn.scene.constants';
import { getBurnPieceOutlineGeometry } from './get.burn.piece.outline.geometry';

const THICKNESS_MM = 3;
const BOX_FACE_LINE_COUNT = 4;

const getOutlineZs = (zOffsetMm: number, heightMm: number): number[] => {
  const box = new BoxGeometry(10, 10, heightMm);

  box.translate(0, 0, zOffsetMm);

  const position = getBurnPieceOutlineGeometry(box, THICKNESS_MM).getAttribute(BURN_SCENE_ATTRIBUTE.POSITION);

  return Array.from({ length: position.count }, (_unused: unknown, vertex: number) => position.getZ(vertex));
};

describe(getBurnPieceOutlineGeometry.name, () => {
  it('outlines a piece on the top and the bottom of the sheet, without its upright edges', () => {
    const zs: number[] = getOutlineZs(THICKNESS_MM / 2, THICKNESS_MM);

    expect(zs.filter((z: number) => z === 0)).toHaveLength(BOX_FACE_LINE_COUNT * 2);
    expect(zs.filter((z: number) => z === THICKNESS_MM)).toHaveLength(BOX_FACE_LINE_COUNT * 2);
  });

  it('draws no line on a flat face made of rows of different lengths, whose edges do not match up', () => {
    const rows = new BufferGeometry();

    rows.setAttribute(BURN_SCENE_ATTRIBUTE.POSITION, new BufferAttribute(new Float32Array([
      0, 0, THICKNESS_MM, 10, 0, THICKNESS_MM, 10, 1, THICKNESS_MM, 0, 1, THICKNESS_MM,
      0, 1, THICKNESS_MM, 4, 1, THICKNESS_MM, 4, 2, THICKNESS_MM, 0, 2, THICKNESS_MM,
    ]), 3));
    rows.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);

    expect(getBurnPieceOutlineGeometry(rows, THICKNESS_MM).getAttribute(BURN_SCENE_ATTRIBUTE.POSITION).count).toBe(0);
  });

  it('leaves out edges at a depth inside the sheet', () => {
    expect(getOutlineZs(1.5, 1)).toEqual([]);
  });
});

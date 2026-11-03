import { BURN_PART_FRAMED_LIFT_THICKNESSES, BURN_PART_STATUS } from './burn.model.constants';
import type { BurnPartStatus } from './burn.model.constants';
import { getBurnPartFramedLiftMm } from './get.burn.part.framed.lift.mm';
import type { BurnPart } from './interfaces/BurnPart';

const THICKNESS_MM = 3;
const ONE_FULL_LIFT_MM = THICKNESS_MM * BURN_PART_FRAMED_LIFT_THICKNESSES;

const newPart = (id: number, parentId?: number, status: BurnPartStatus = BURN_PART_STATUS.FREE): BurnPart => ({
  id,
  parentId,
  status,
  boundsMm: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
  weakestLayerKey: undefined,
  weakestDepthMm: undefined,
});

describe(getBurnPartFramedLiftMm.name, () => {
  it('adds a full lift for each liftable part of the deepest chain', () => {
    expect(getBurnPartFramedLiftMm([newPart(1), newPart(2, 1), newPart(3, 2), newPart(4)], THICKNESS_MM))
      .toBe(ONE_FULL_LIFT_MM * 3);
  });

  it('counts nothing for a part that cannot lift', () => {
    expect(getBurnPartFramedLiftMm(
      [newPart(1, undefined, BURN_PART_STATUS.NOT_THROUGH), newPart(2, 1)],
      THICKNESS_MM,
    )).toBe(ONE_FULL_LIFT_MM);
  });

  it('is zero with no parts, and ends on a loop of parents', () => {
    expect(getBurnPartFramedLiftMm([], THICKNESS_MM)).toBe(0);
    expect(getBurnPartFramedLiftMm([newPart(1, 2), newPart(2, 1)], THICKNESS_MM)).toBe(ONE_FULL_LIFT_MM * 2);
  });
});

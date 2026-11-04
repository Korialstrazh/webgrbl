import { describe, expect, it } from 'vitest';
import { FRAME_EDGE } from './frame.constants';
import { getFrameBedOverrun } from './get.frame.bed.overrun';

const WORK_AREA = { workAreaXMm: 400, workAreaYMm: 300 };

describe(getFrameBedOverrun.name, () => {
  it('reports the right edge and how far the outline passes it', () => {
    const rectangle = { minX: 100, minY: 10, maxX: 412, maxY: 50 };

    expect(getFrameBedOverrun(rectangle, WORK_AREA)).toEqual({
      edge: FRAME_EDGE.RIGHT,
      distanceMm: 12,
    });
  });

  it('returns undefined when the outline touches the edge exactly', () => {
    const rectangle = { minX: 0, minY: 0, maxX: 400, maxY: 300 };

    expect(getFrameBedOverrun(rectangle, WORK_AREA)).toBeUndefined();
  });

  it('reports the largest overrun when several edges are passed', () => {
    const rectangle = { minX: -3, minY: -8, maxX: 100, maxY: 305 };

    expect(getFrameBedOverrun(rectangle, WORK_AREA)).toEqual({
      edge: FRAME_EDGE.FRONT,
      distanceMm: 8,
    });
  });

  it('reports the left and back edges', () => {
    expect(
      getFrameBedOverrun({ minX: -4, minY: 0, maxX: 10, maxY: 10 }, WORK_AREA),
    ).toEqual({
      edge: FRAME_EDGE.LEFT,
      distanceMm: 4,
    });
    expect(
      getFrameBedOverrun({ minX: 0, minY: 0, maxX: 10, maxY: 309 }, WORK_AREA),
    ).toEqual({
      edge: FRAME_EDGE.BACK,
      distanceMm: 9,
    });
  });
});

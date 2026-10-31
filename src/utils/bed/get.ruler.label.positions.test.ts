import { getRulerLabelPositions } from './get.ruler.label.positions';

const BED_LENGTH_MM = 300;
const LABEL_CLEARANCE_MM = 10;
const LONG_CLEARANCE_MM = 60;

describe(getRulerLabelPositions.name, () => {
  it('labels every step from zero up to the bed length when no room is needed after the label', () => {
    expect(getRulerLabelPositions(BED_LENGTH_MM, 0)).toEqual([0, 50, 100, 150, 200, 250, 300]);
  });

  it('skips the label at the far edge that would not fit inside the bed', () => {
    expect(getRulerLabelPositions(BED_LENGTH_MM, LABEL_CLEARANCE_MM)).toEqual([0, 50, 100, 150, 200, 250]);
  });

  it('skips every label whose room reaches past the far edge', () => {
    expect(getRulerLabelPositions(BED_LENGTH_MM, LONG_CLEARANCE_MM)).toEqual([0, 50, 100, 150, 200]);
  });
});

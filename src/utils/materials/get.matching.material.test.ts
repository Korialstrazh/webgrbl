import { getMatchingMaterial } from './get.matching.material';
import { newMaterial } from './new.material';
import { newTestResultFixture } from './new.test.result.fixture';

const NAME = 'Birch';
const THICKNESS_MM = 4;

describe(getMatchingMaterial.name, () => {
  it('ignores case and outer spaces in the name', () => {
    const material = newMaterial({ name: NAME, thicknessMm: THICKNESS_MM });

    expect(getMatchingMaterial([material], { name: ' birch ', thicknessMm: THICKNESS_MM })).toBe(material);
  });

  it('finds nothing for another thickness or name', () => {
    const material = newMaterial({ name: NAME, thicknessMm: THICKNESS_MM });

    expect(getMatchingMaterial([material], { name: NAME, thicknessMm: THICKNESS_MM + 1 })).toBeUndefined();
    expect(getMatchingMaterial([material], { name: 'Oak', thicknessMm: THICKNESS_MM })).toBeUndefined();
  });

  it('prefers a copy with a test', () => {
    const untested = newMaterial({ name: NAME, thicknessMm: THICKNESS_MM });
    const tested = { ...newMaterial({ name: NAME, thicknessMm: THICKNESS_MM }), testResults: [newTestResultFixture()] };

    expect(getMatchingMaterial([untested, tested], { name: NAME, thicknessMm: THICKNESS_MM })).toBe(tested);
  });
});

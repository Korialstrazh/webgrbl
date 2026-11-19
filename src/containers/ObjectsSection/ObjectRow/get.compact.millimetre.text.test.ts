import { getCompactMillimetreText } from './get.compact.millimetre.text';

describe(getCompactMillimetreText.name, () => {
  it('keeps one decimal below 100 mm', () => {
    expect(getCompactMillimetreText(42.25)).toBe('42.3');
  });

  it('shows whole millimetres from 100 mm on', () => {
    expect(getCompactMillimetreText(900.04)).toBe('900');
  });
});

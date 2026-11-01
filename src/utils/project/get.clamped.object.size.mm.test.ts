import { getClampedObjectSizeMm } from './get.clamped.object.size.mm';
import { MAX_OBJECT_SIZE_MM, MIN_OBJECT_SIZE_MM } from './project.constants';

const IN_RANGE_SIZE_MM = 42;

describe(getClampedObjectSizeMm.name, () => {
  it('keeps a size inside the range', () => {
    expect(getClampedObjectSizeMm(IN_RANGE_SIZE_MM)).toBe(IN_RANGE_SIZE_MM);
  });

  it('raises a size below the range, zero and a negative size to the minimum', () => {
    expect(getClampedObjectSizeMm(MIN_OBJECT_SIZE_MM / 2)).toBe(MIN_OBJECT_SIZE_MM);
    expect(getClampedObjectSizeMm(0)).toBe(MIN_OBJECT_SIZE_MM);
    expect(getClampedObjectSizeMm(-IN_RANGE_SIZE_MM)).toBe(MIN_OBJECT_SIZE_MM);
  });

  it('lowers a size above the range to the maximum', () => {
    expect(getClampedObjectSizeMm(MAX_OBJECT_SIZE_MM * 2)).toBe(MAX_OBJECT_SIZE_MM);
  });
});

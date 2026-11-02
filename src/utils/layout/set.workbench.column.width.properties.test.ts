import { DESIGN_COLUMN_WIDTH_PROPERTY, MACHINE_COLUMN_WIDTH_PROPERTY } from '../layout.constants';
import { setWorkbenchColumnWidthProperties } from './set.workbench.column.width.properties';

const RESIZED_PERCENTS: number[] = [20, 50, 30];

describe(setWorkbenchColumnWidthProperties.name, () => {
  it('sets the side column widths in percent', () => {
    const workbenchElement: HTMLElement = document.createElement('section');

    setWorkbenchColumnWidthProperties(workbenchElement, RESIZED_PERCENTS);

    expect(workbenchElement.style.getPropertyValue(DESIGN_COLUMN_WIDTH_PROPERTY)).toBe('20%');
    expect(workbenchElement.style.getPropertyValue(MACHINE_COLUMN_WIDTH_PROPERTY)).toBe('30%');
  });

  it('removes the widths again without sizes, so the stylesheet defaults apply', () => {
    const workbenchElement: HTMLElement = document.createElement('section');
    setWorkbenchColumnWidthProperties(workbenchElement, RESIZED_PERCENTS);

    setWorkbenchColumnWidthProperties(workbenchElement, undefined);

    expect(workbenchElement.style.getPropertyValue(DESIGN_COLUMN_WIDTH_PROPERTY)).toBe('');
    expect(workbenchElement.style.getPropertyValue(MACHINE_COLUMN_WIDTH_PROPERTY)).toBe('');
  });
});

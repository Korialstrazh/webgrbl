/**
 * Puts the widths of the design and machine columns, in percent of the workbench width, into custom properties on the
 * workbench element, so the console overlay, which sits outside the splitter, lines up with the resized columns.
 * Without sizes the properties are removed and the stylesheet defaults apply again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  DESIGN_COLUMN_WIDTH_PROPERTY,
  DESIGN_PANEL_INDEX,
  MACHINE_COLUMN_WIDTH_PROPERTY,
  MACHINE_PANEL_INDEX,
} from '../layout.constants';
import { getPercentText } from './get.percent.text';

const setColumnWidthProperty = (
  workbenchElement: HTMLElement,
  propertyName: string,
  columnPercent: number | undefined,
): void => {
  if (columnPercent) {
    workbenchElement.style.setProperty(propertyName, getPercentText(columnPercent));

    return;
  }

  workbenchElement.style.removeProperty(propertyName);
};

export const setWorkbenchColumnWidthProperties = (
  workbenchElement: HTMLElement | null,
  panelSizePercents: number[] | undefined,
): void => {
  if (!workbenchElement) {
    return;
  }

  setColumnWidthProperty(workbenchElement, DESIGN_COLUMN_WIDTH_PROPERTY, panelSizePercents?.[DESIGN_PANEL_INDEX]);
  setColumnWidthProperty(workbenchElement, MACHINE_COLUMN_WIDTH_PROPERTY, panelSizePercents?.[MACHINE_PANEL_INDEX]);
};

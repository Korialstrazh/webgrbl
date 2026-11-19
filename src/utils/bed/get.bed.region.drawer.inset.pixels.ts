/**
 * Measures the width in CSS pixels that the drawer inset set on the bed region host resolves to, with a hidden probe
 * as wide as the drawer, so the bed view knows how much of it the drawer covers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BED_REGION_DRAWER_INSET_PROPERTY } from './bed.region.drawer.constants';

export const getBedRegionDrawerInsetPixels = (bedRegionHost: HTMLElement): number => {
  const probeElement: HTMLDivElement = document.createElement('div');

  probeElement.style.position = 'absolute';
  probeElement.style.visibility = 'hidden';
  probeElement.style.width = `var(${BED_REGION_DRAWER_INSET_PROPERTY})`;
  bedRegionHost.append(probeElement);

  const insetPx: number = probeElement.getBoundingClientRect().width;

  probeElement.remove();

  return insetPx;
};

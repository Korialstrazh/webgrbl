/**
 * Gets the CSS width a bed-region drawer takes from the left of the bed: its size for a left drawer, as given or in
 * pixels for a number, and nothing for a drawer on another side or without a size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-06
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { DrawerProps } from 'antd';
import { ANTD_DRAWER_PLACEMENT_LEFT } from '../antd.constants';

const PIXEL_UNIT = 'px';

export const getBedRegionDrawerInset = (
  placement: DrawerProps['placement'],
  size: DrawerProps['size'],
): string | undefined => {
  if (placement !== ANTD_DRAWER_PLACEMENT_LEFT) {
    return undefined;
  }

  if (typeof size === 'number') {
    return `${size}${PIXEL_UNIT}`;
  }

  return size || undefined;
};

/**
 * Props of the chip that sums up the problems of one object (outside the bed, content the job leaves out) and lists
 * them in a popover.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ReactNode } from 'react';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';

export interface ObjectWarningChipProps {
  /** Name of the object, used in the chip's accessible label. */
  objectName: string;
  /** Whether the object lies outside the bed. */
  isOutsideBed: boolean;
  /** Fixes shown under the outside-the-bed line, such as Move onto bed and Fit to bed. */
  outsideBedActionsComponent?: ReactNode;
  /** Kinds of content of the object that the job leaves out. */
  warningKinds: SvgUnsupportedKind[];
}

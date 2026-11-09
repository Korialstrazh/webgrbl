/**
 * Props of the chip that sums up the problems of one object (outside the bed, content the job leaves out) and lists
 * them in a popover.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';

export interface ObjectWarningChipProps {
  /** Name of the object, used in the chip's accessible label. */
  objectName: string;
  /** Whether the object lies outside the bed. */
  isOutsideBed: boolean;
  /** Kinds of content of the object that the job leaves out. */
  warningKinds: SvgUnsupportedKind[];
}

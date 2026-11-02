/**
 * Gets the flattening tolerance of a project object in its user units: 0.05 mm divided by the largest stretch of
 * the object's scale matrix, so curves are never coarser than 0.05 mm on the bed. The flip, turn and move of the
 * object do not stretch, so they are left out: moving or turning the object keeps the same tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getSvgMatrixMaxScale } from '../svg/geometry/get.svg.matrix.max.scale';
import type { SvgViewBox } from '../svg/interfaces/SvgViewBox';
import { getObjectArtworkScaleMatrix } from './get.object.artwork.scale.matrix';
import { TOOLPATH_TOLERANCE_MM } from './toolpath.constants';

export const getObjectFlatteningTolerance = (
  projectObject: ProjectObject,
  svgViewBox: SvgViewBox | undefined,
): number => TOOLPATH_TOLERANCE_MM / getSvgMatrixMaxScale(getObjectArtworkScaleMatrix(projectObject, svgViewBox));

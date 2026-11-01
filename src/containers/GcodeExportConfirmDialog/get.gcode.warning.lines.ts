/**
 * Gets the lines of the G-code export confirmation: each warning with the name of its object, in toolpath order.
 * A warning whose object is gone keeps the default object name, so no warning is ever dropped.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { OBJECT_WARNING_TEXT_KEY } from './gcode.export.confirm.dialog.constants';
import type { GcodeWarningLine } from './interfaces/GcodeWarningLine';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { DEFAULT_OBJECT_NAME } from '../../utils/project/project.constants';
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';

const LINE_KEY_SEPARATOR = ':';

export const getGcodeWarningLines = (warnings: ObjectWarning[], projectObjects: ProjectObject[]): GcodeWarningLine[] =>
  warnings.map((warning: ObjectWarning): GcodeWarningLine => ({
    lineKey: [warning.objectId, warning.kind].join(LINE_KEY_SEPARATOR),
    objectName: projectObjects.find((projectObject: ProjectObject): boolean => projectObject.id === warning.objectId)
      ?.name ?? DEFAULT_OBJECT_NAME,
    warningTextKey: OBJECT_WARNING_TEXT_KEY[warning.kind],
  }));

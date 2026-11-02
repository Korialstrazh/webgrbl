/**
 * A small panel in the Toolpath view that lists what the ready toolpath leaves out: each affected object with the
 * text of its warning. Nothing is shown while there is no ready toolpath or it has no warnings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { selectProjectObjects } from '../../utils/states/project.document.state';
import { selectToolpath, selectToolpathStatus } from '../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../utils/states/toolpath.status.constants';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import { getGcodeWarningLines } from '../GcodeExportConfirmDialog/get.gcode.warning.lines';
import type { GcodeWarningLine } from '../GcodeExportConfirmDialog/interfaces/GcodeWarningLine';
import styles from './styles.module.scss';

export const ToolpathWarningsPanel = (): ReactNode => {
  const { t } = useTranslation();
  const isToolpathCurrent: boolean = useSelector(selectToolpathStatus) === TOOLPATH_STATUS.READY;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const warningLines: GcodeWarningLine[] = isToolpathCurrent && toolpath
    ? getGcodeWarningLines(toolpath.warnings, projectObjects)
    : [];

  if (!warningLines.length) {
    return undefined;
  }

  return (
    <section className={styles.warningsPanel} aria-label={t(DEFAULT.TOOLPATH_WARNINGS_TITLE)}>
      <h3 className={styles.title}>{t(DEFAULT.TOOLPATH_WARNINGS_TITLE)}</h3>
      {/* A plain list: antd has no lightweight list for a few lines of text. */}
      <ul className={styles.warningList}>
        {warningLines.map(({ lineKey, objectName, warningTextKey }: GcodeWarningLine) => (
          <li key={lineKey}>
            <strong className={styles.objectName}>{objectName}</strong>
            <span>{t(warningTextKey)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

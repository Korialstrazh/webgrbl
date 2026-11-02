/**
 * The warnings chip of the Toolpath view, in the toolbar row above the bed so it never covers the work or the origin
 * corner. Closed, it names each kind of warning with its count ("Warnings: text left out (1)"); open, it lists each
 * affected object with the full text of its warning below the chip. Nothing is shown while there is no ready toolpath
 * or it has no warnings.
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
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import { getGcodeWarningLines } from '../GcodeExportConfirmDialog/get.gcode.warning.lines';
import type { GcodeWarningLine } from '../GcodeExportConfirmDialog/interfaces/GcodeWarningLine';
import { getToolpathWarningsSummaryText } from './get.toolpath.warnings.summary.text';
import styles from './styles.module.scss';

export const ToolpathWarningsPanel = (): ReactNode => {
  const { t } = useTranslation();
  const isToolpathCurrent: boolean = useSelector(selectToolpathStatus) === TOOLPATH_STATUS.READY;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const currentWarnings: ObjectWarning[] = isToolpathCurrent && toolpath ? toolpath.warnings : [];
  const warningLines: GcodeWarningLine[] = getGcodeWarningLines(currentWarnings, projectObjects);

  if (!warningLines.length) {
    return undefined;
  }

  return (
    <section className={styles.warningsPanel} aria-label={t(DEFAULT.TOOLPATH_WARNINGS_TITLE)}>
      {/* A native disclosure: closed it is a small chip in the toolbar row; antd Collapse brings a bordered card. */}
      <details className={styles.disclosure}>
        <summary className={styles.title}>{getToolpathWarningsSummaryText(t, currentWarnings)}</summary>
        {/* A plain list: antd has no lightweight list for a few lines of text. */}
        <ul className={styles.warningList}>
          {warningLines.map(({ lineKey, objectName, warningTextKey }: GcodeWarningLine) => (
            <li key={lineKey}>
              <strong className={styles.objectName}>{objectName}</strong>
              <span>{t(warningTextKey)}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
};

/**
 * Asks before the G-code export downloads a toolpath with warnings: it lists each affected object with its warning
 * texts. Export anyway downloads; Cancel downloads nothing. It is mounted once and opens when the export saga asks
 * for a confirmation, so the Project menu and the Job card share it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectProjectObjects } from '../../utils/states/project.document.state';
import {
  GcodeExportConfirmationClosed,
  GcodeExportRequested,
  selectIsGcodeExportConfirmationOpen,
  selectToolpath,
} from '../../utils/states/toolpath.state';
import type { Toolpath } from '../../utils/toolpath/interfaces/Toolpath';
import { BedRegionModal } from '../BedRegionModal';
import { GCODE_EXPORT_CONFIRM_DIALOG_OVERLAY_ID } from './gcode.export.confirm.dialog.constants';
import { getGcodeWarningLines } from './get.gcode.warning.lines';
import type { GcodeWarningLine } from './interfaces/GcodeWarningLine';
import styles from './styles.module.scss';

export const GcodeExportConfirmDialog = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const isOpen: boolean = useSelector(selectIsGcodeExportConfirmationOpen);
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const warningLines: GcodeWarningLine[] = getGcodeWarningLines(toolpath?.warnings ?? [], projectObjects);

  return (
    <BedRegionModal
      isOpen={isOpen}
      overlayIdPrefix={GCODE_EXPORT_CONFIRM_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.GCODE_WARNINGS_TITLE)}
      okText={t(DEFAULT.GCODE_WARNINGS_CONFIRM)}
      cancelText={t(DEFAULT.GCODE_WARNINGS_CANCEL)}
      destroyOnHidden
      onOk={() => dispatch(new GcodeExportRequested({ isWarningConfirmed: true }))}
      onClose={() => dispatch(new GcodeExportConfirmationClosed())}
    >
      <p className={styles.intro}>{t(DEFAULT.GCODE_WARNINGS_INTRO)}</p>
      <ul className={styles.warningList} aria-label={t(DEFAULT.GCODE_WARNINGS_LIST_LABEL)}>
        {warningLines.map(({ lineKey, objectName, warningTextKey }: GcodeWarningLine) => (
          <li key={lineKey}>
            {t(DEFAULT.GCODE_WARNINGS_ITEM, { objectName, warning: t(warningTextKey) })}
          </li>
        ))}
      </ul>
    </BedRegionModal>
  );
};

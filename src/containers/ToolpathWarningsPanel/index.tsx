/**
 * The warnings chip of the Toolpath view, in the toolbar row above the bed so it never covers the work or the origin
 * corner. It is the same compact chip as an object's: a warning icon and the number of warnings. A click opens a
 * popover that lists each affected object, one line per warning led by the icon of its kind. Nothing is shown while
 * there is no ready toolpath or it has no warnings.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WarningOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_POPOVER_PLACEMENT_BOTTOM_LEFT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../utils/antd.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { usePopoverAutoClose } from '../../utils/hooks/use.popover.auto.close';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ProjectObject } from '../../utils/project/interfaces/ProjectObject';
import { selectProjectObjects } from '../../utils/states/project.document.state';
import { selectCurrentToolpathWarnings } from '../../utils/states/toolpath.warnings.selector';
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';
import { ObjectWarningKindIcon } from '../../views/ObjectWarningKindIcon';
import { getGcodeWarningLines } from '../GcodeExportConfirmDialog/get.gcode.warning.lines';
import type { GcodeWarningLine } from '../GcodeExportConfirmDialog/interfaces/GcodeWarningLine';
import { TOOLPATH_WARNINGS_CHIP_ID } from './toolpath.warnings.panel.constants';
import styles from './styles.module.scss';

const TOOLPATH_WARNINGS_OVERLAY_ID = 'toolpath-warnings';

export const ToolpathWarningsPanel = (): ReactNode => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(TOOLPATH_WARNINGS_OVERLAY_ID, isOpen);

  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const currentWarnings: ObjectWarning[] = useSelector(selectCurrentToolpathWarnings) ?? [];
  const warningLines: GcodeWarningLine[] = getGcodeWarningLines(currentWarnings, projectObjects);

  usePopoverAutoClose(isOpen, () => setIsOpen(false));

  if (!warningLines.length) {
    return undefined;
  }

  const chipLabelText: string = t(DEFAULT.TOOLPATH_WARNINGS_CHIP, { count: warningLines.length });
  const listComponent: ReactNode = (
    // A plain list: antd has no lightweight list for a few lines of text.
    <ul className={styles.warningList} aria-label={t(DEFAULT.TOOLPATH_WARNINGS_TITLE)}>
      {warningLines.map(({ lineKey, objectName, kind, warningTextKey }: GcodeWarningLine) => (
        <li key={lineKey} className={styles.item}>
          <span className={styles.itemIcon}><ObjectWarningKindIcon kind={kind} /></span>
          <span className={styles.itemText}>
            <strong className={styles.objectName}>{objectName}</strong>
            <span>{t(warningTextKey)}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <Popover
      content={listComponent}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      placement={ANTD_POPOVER_PLACEMENT_BOTTOM_LEFT}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Button
        id={TOOLPATH_WARNINGS_CHIP_ID}
        className={styles.chip}
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        aria-label={chipLabelText}
        title={chipLabelText}
        data-toolpath-warning-count={warningLines.length}
      >
        <WarningOutlined aria-hidden />
        <span>{warningLines.length}</span>
      </Button>
    </Popover>
  );
};

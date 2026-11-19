/**
 * The warnings chip of the Toolpath view, in the toolbar row above the bed so it never covers the work or the origin
 * corner. It is the same compact chip as an object's: a warning icon and the number of warnings. A click opens a
 * popover that lists each affected object, one line per warning led by the icon of its kind, a few words on the
 * warning with its full sentence in a tooltip, and a button that selects the object and zooms the bed to it. Nothing
 * is shown while there is no ready toolpath or it has no warnings. A frame that would run off the bed adds its note
 * with its move action below the list, where Fix warnings leads.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { AimOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Popover, Tooltip } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
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
import { BedSelectionFitRequested } from '../../utils/states/bed.view.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectProjectObjects } from '../../utils/states/project.document.state';
import { ProjectSelectionChanged } from '../../utils/states/project.selection.state';
import { selectCurrentToolpathWarnings } from '../../utils/states/toolpath.warnings.selector';
import type { ObjectWarning } from '../../utils/toolpath/interfaces/ObjectWarning';
import { OBJECT_WARNING_SHORT_TEXT_KEY } from '../../utils/toolpath/object.warning.short.text.key';
import { IconActionButton } from '../../views/IconActionButton';
import { ObjectWarningKindIcon } from '../../views/ObjectWarningKindIcon';
import { getGcodeWarningLines } from '../GcodeExportConfirmDialog/get.gcode.warning.lines';
import type { GcodeWarningLine } from '../GcodeExportConfirmDialog/interfaces/GcodeWarningLine';
import { TOOLPATH_WARNINGS_CHIP_ID } from './toolpath.warnings.panel.constants';
import styles from './styles.module.scss';

import { selectFrameBedOverrun } from '../../utils/states/frame.start.blocked.reason.selector';
import type { FrameBedOverrun } from '../../utils/frame/interfaces/FrameBedOverrun';
import { FrameBedOverrunNote } from '../MachinePanel/JobCard/FrameControls/FrameBedOverrunNote';

const TOOLPATH_WARNINGS_OVERLAY_ID = 'toolpath-warnings';

export const ToolpathWarningsPanel = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(TOOLPATH_WARNINGS_OVERLAY_ID, isOpen);

  const projectObjects: ProjectObject[] = useSelector(selectProjectObjects);
  const currentWarnings: ObjectWarning[] = useSelector(selectCurrentToolpathWarnings) ?? [];
  const warningLines: GcodeWarningLine[] = getGcodeWarningLines(currentWarnings, projectObjects);
  const bedOverrun: FrameBedOverrun | undefined = useSelector(selectFrameBedOverrun);

  usePopoverAutoClose(isOpen, () => setIsOpen(false));

  const showObject = (objectId: string): void => {
    dispatch(new ProjectSelectionChanged({ objectIds: [objectId] }));
    dispatch(new BedSelectionFitRequested());
  };

  if (!warningLines.length) {
    return undefined;
  }

  const chipLabelText: string = t(DEFAULT.TOOLPATH_WARNINGS_CHIP, { count: warningLines.length });
  const listComponent: ReactNode = (
    // A plain list: antd has no lightweight list for a few lines of text.
    <ul className={styles.warningList} aria-label={t(DEFAULT.TOOLPATH_WARNINGS_TITLE)}>
      {warningLines.map(({ lineKey, objectId, objectName, kind, warningTextKey }: GcodeWarningLine) => (
        <li key={lineKey} className={styles.item}>
          <span className={styles.itemIcon}><ObjectWarningKindIcon kind={kind} /></span>
          {/* A few words on one line; the full sentence opens in the tooltip and is read out with the line. */}
          <Tooltip title={t(warningTextKey)}>
            <span className={styles.itemText}>
              <strong className={styles.objectName}>{objectName}</strong>
              <span className={styles.shortText} aria-hidden>{t(OBJECT_WARNING_SHORT_TEXT_KEY[kind])}</span>
              <span className={styles.fullText}>{t(warningTextKey)}</span>
            </span>
          </Tooltip>
          <IconActionButton
            type={ANTD_BUTTON_TYPE_TEXT}
            size={ANTD_BUTTON_SIZE_SMALL}
            labelText={t(DEFAULT.TOOLPATH_WARNINGS_SHOW_OBJECT, { name: objectName })}
            iconComponent={<AimOutlined />}
            onClick={() => showObject(objectId)}
          />
        </li>
      ))}
    </ul>
  );
  const popoverContent: ReactNode = (
    <div className={styles.popoverContent}>
      {listComponent}
      {bedOverrun && <FrameBedOverrunNote bedOverrun={bedOverrun} />}
    </div>
  );

  return (
    <Popover
      content={popoverContent}
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

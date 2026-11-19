/**
 * A small chip with a warning icon and the number of problems of one object that lock Start job (the same toolpath
 * warnings the Job card's Fix warnings counts), and, apart from that count, a bed-outline icon when the object sits
 * outside the bed, a note that does not lock Start; a click or focus opens a popover that
 * explains each problem in full, so the object row stays one line. The popover opens to the side, over the bed, so it
 * never covers the element tree below the row, and each line starts with the icon of its kind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BorderOuterOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_POPOVER_PLACEMENT_RIGHT_TOP,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../../utils/antd.constants';
import { useOverlayRegistration } from '../../../utils/hooks/use.overlay.registration';
import { usePopoverAutoClose } from '../../../utils/hooks/use.popover.auto.close';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';
import { OBJECT_WARNING_TEXT_KEY } from '../../../utils/toolpath/object.warning.text.key';
import { ObjectWarningKindIcon } from '../../../views/ObjectWarningKindIcon';
import type { ObjectWarningChipProps } from '../interfaces/ObjectWarningChipProps';
import styles from './styles.module.scss';

const OBJECT_WARNING_OVERLAY_ID = 'object-warning';

const getChipLabelText = (
  t: TFunction,
  objectName: string,
  blockingCount: number,
  isOutsideBed: boolean,
): string => {
  if (!blockingCount) {
    return t(DEFAULT.OBJECTS_WARNINGS_OUTSIDE_BED_ONLY, { name: objectName });
  }

  const labelKey: string = isOutsideBed ? DEFAULT.OBJECTS_WARNINGS_AND_OUTSIDE_BED : DEFAULT.OBJECTS_WARNINGS;

  return t(labelKey, { name: objectName, count: blockingCount });
};

export const ObjectWarningChip = (props: ObjectWarningChipProps): ReactNode => {
  const { objectName, isOutsideBed, outsideBedActionsComponent, warningKinds } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(OBJECT_WARNING_OVERLAY_ID, isOpen);

  usePopoverAutoClose(isOpen, () => setIsOpen(false));

  const blockingCount: number = warningKinds.length;

  if (!blockingCount && !isOutsideBed) {
    return null;
  }

  const labelText: string = getChipLabelText(t, objectName, blockingCount, isOutsideBed);

  const listComponent: ReactNode = (
    <ul className={styles.list}>
      {isOutsideBed && (
        <li className={[styles.item, styles.noteItem].join(' ')}>
          <BorderOuterOutlined className={styles.itemIcon} aria-hidden />
          <div>
            <span>{t(DEFAULT.OBJECTS_OUTSIDE_BED)}</span>
            {outsideBedActionsComponent}
          </div>
        </li>
      )}
      {warningKinds.map((warningKind: SvgUnsupportedKind) => (
        <li key={warningKind} className={styles.item}>
          <span className={styles.itemIcon}><ObjectWarningKindIcon kind={warningKind} /></span>
          <span>{t(OBJECT_WARNING_TEXT_KEY[warningKind])}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Popover
      content={listComponent}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      placement={ANTD_POPOVER_PLACEMENT_RIGHT_TOP}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Button
        className={styles.chip}
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        aria-label={labelText}
        title={labelText}
        data-object-warning-count={blockingCount}
      >
        {!!blockingCount && (
          <span className={styles.blockingPart}>
            <WarningOutlined aria-hidden />
            <span>{blockingCount}</span>
          </span>
        )}
        {isOutsideBed && <BorderOuterOutlined className={styles.outsideBedIcon} aria-hidden />}
      </Button>
    </Popover>
  );
};

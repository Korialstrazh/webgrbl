/**
 * A small chip with a warning icon and the number of problems of one object; a click or focus opens a popover that
 * explains each problem in full, so the object row stays one line. The popover opens to the side, over the bed, so it
 * never covers the element tree below the row, and each line starts with the icon of its kind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BorderOuterOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
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

export const ObjectWarningChip = ({ objectName, isOutsideBed, warningKinds }: ObjectWarningChipProps): ReactNode => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(OBJECT_WARNING_OVERLAY_ID, isOpen);

  usePopoverAutoClose(isOpen, () => setIsOpen(false));

  const problemCount: number = warningKinds.length + (isOutsideBed ? 1 : 0);

  if (!problemCount) {
    return null;
  }

  const chipClassName: string | undefined = isOutsideBed ? [styles.chip, styles.dangerChip].join(' ') : styles.chip;
  const listComponent: ReactNode = (
    <ul className={styles.list}>
      {isOutsideBed && (
        <li className={[styles.item, styles.dangerItem].join(' ')}>
          <BorderOuterOutlined className={styles.itemIcon} aria-hidden />
          <span>{t(DEFAULT.OBJECTS_OUTSIDE_BED)}</span>
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
        className={chipClassName}
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        aria-label={t(DEFAULT.OBJECTS_WARNINGS, { name: objectName, count: problemCount })}
        title={t(DEFAULT.OBJECTS_WARNINGS, { name: objectName, count: problemCount })}
        data-object-warning-count={problemCount}
      >
        <WarningOutlined aria-hidden />
        <span>{problemCount}</span>
      </Button>
    </Popover>
  );
};

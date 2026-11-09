/**
 * A small chip with a warning icon and the number of problems of one object; a click or focus opens a popover that
 * explains each problem in full, so the object row stays one line.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WarningOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT,
  ANTD_POPOVER_TRIGGER_CLICK,
} from '../../../utils/antd.constants';
import { usePopoverAutoClose } from '../../../utils/hooks/use.popover.auto.close';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';
import { OBJECT_WARNING_TEXT_KEY } from '../../../utils/toolpath/object.warning.text.key';
import type { ObjectWarningChipProps } from '../interfaces/ObjectWarningChipProps';
import styles from './styles.module.scss';

export const ObjectWarningChip = ({ objectName, isOutsideBed, warningKinds }: ObjectWarningChipProps): ReactNode => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  usePopoverAutoClose(isOpen, () => setIsOpen(false));

  const problemCount: number = warningKinds.length + (isOutsideBed ? 1 : 0);

  if (!problemCount) {
    return null;
  }

  const chipClassName: string = isOutsideBed ? [styles.chip, styles.dangerChip].join(' ') : styles.chip;
  const listComponent: ReactNode = (
    <ul className={styles.list}>
      {isOutsideBed && <li className={styles.dangerItem}>{t(DEFAULT.OBJECTS_OUTSIDE_BED)}</li>}
      {warningKinds.map((warningKind: SvgUnsupportedKind) => (
        <li key={warningKind}>{t(OBJECT_WARNING_TEXT_KEY[warningKind])}</li>
      ))}
    </ul>
  );

  return (
    <Popover
      content={listComponent}
      trigger={ANTD_POPOVER_TRIGGER_CLICK}
      placement={ANTD_POPOVER_PLACEMENT_BOTTOM_RIGHT}
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

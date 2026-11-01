/**
 * A row of the object list: a button that selects the object, with its name, size and a note when it is outside the
 * bed, and a button that deletes it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DELETE_CROSS } from '../../../utils/characters.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { ObjectRowProps } from '../interfaces/ObjectRowProps';
import { OBJECT_MILLIMETRE_DECIMALS } from '../objects.section.constants';
import styles from './styles.module.scss';

export const ObjectRow = ({
  projectObject,
  isSelected,
  isOutsideBed,
  onSelect,
  onDelete,
}: ObjectRowProps): ReactNode => {
  const { t } = useTranslation();
  const rowClassName: string | undefined = isSelected ? [styles.row, styles.selectedRow].join(' ') : styles.row;

  return (
    <li className={rowClassName}>
      <Button
        className={styles.selectButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        aria-pressed={isSelected}
        onClick={() => onSelect(projectObject.id)}
      >
        <span className={styles.name}>{projectObject.name}</span>
        <span className={styles.size}>
          {t(DEFAULT.OBJECTS_SIZE, {
            widthMm: projectObject.widthMm.toFixed(OBJECT_MILLIMETRE_DECIMALS),
            heightMm: projectObject.heightMm.toFixed(OBJECT_MILLIMETRE_DECIMALS),
          })}
        </span>
        {isOutsideBed && <span className={styles.outsideNote}>{t(DEFAULT.OBJECTS_OUTSIDE_BED)}</span>}
      </Button>
      <Button
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={DELETE_CROSS}
        aria-label={t(DEFAULT.OBJECTS_DELETE, { name: projectObject.name })}
        onClick={() => onDelete(projectObject.id)}
      />
    </li>
  );
};

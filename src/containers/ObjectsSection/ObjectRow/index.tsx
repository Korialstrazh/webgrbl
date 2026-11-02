/**
 * A row of the object list: a button that selects the object, with its name, size, a note when it is outside the
 * bed and the warnings for content the job leaves out (text, images, ...), and a button that deletes it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { selectToolpath, selectToolpathStatus } from '../../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../../utils/states/toolpath.status.constants';
import type { SvgUnsupportedKind } from '../../../utils/svg/geometry/svg.shape.constants';
import type { ObjectWarning } from '../../../utils/toolpath/interfaces/ObjectWarning';
import type { Toolpath } from '../../../utils/toolpath/interfaces/Toolpath';
import { OBJECT_WARNING_TEXT_KEY } from '../../../utils/toolpath/object.warning.text.key';
import type { ObjectRowProps } from '../interfaces/ObjectRowProps';
import { OBJECT_MILLIMETRE_DECIMALS } from '../objects.section.constants';
import { getObjectWarningKinds } from './get.object.warning.kinds';
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
  const isToolpathCurrent: boolean = useSelector(selectToolpathStatus) === TOOLPATH_STATUS.READY;
  const toolpath: Toolpath | undefined = useSelector(selectToolpath);
  const readyToolpathWarnings: ObjectWarning[] | undefined = isToolpathCurrent ? toolpath?.warnings : undefined;
  const warningKinds: SvgUnsupportedKind[] = useMemo(
    () => getObjectWarningKinds(projectObject, readyToolpathWarnings),
    [projectObject, readyToolpathWarnings],
  );

  return (
    <li className={rowClassName}>
      <Button
        className={styles.selectButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        aria-pressed={isSelected}
        onClick={() => onSelect(projectObject.id)}
      >
        <span className={styles.name} title={projectObject.name}>{projectObject.name}</span>
        <span className={styles.size} title={t(DEFAULT.OBJECTS_SIZE_HINT)}>
          {t(DEFAULT.OBJECTS_SIZE, {
            widthMm: projectObject.widthMm.toFixed(OBJECT_MILLIMETRE_DECIMALS),
            heightMm: projectObject.heightMm.toFixed(OBJECT_MILLIMETRE_DECIMALS),
          })}
        </span>
        {isOutsideBed && <span className={styles.outsideNote}>{t(DEFAULT.OBJECTS_OUTSIDE_BED)}</span>}
        {warningKinds.map((warningKind: SvgUnsupportedKind) => (
          <span key={warningKind} className={styles.warningNote}>{t(OBJECT_WARNING_TEXT_KEY[warningKind])}</span>
        ))}
      </Button>
      <Button
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        icon={<CloseOutlined />}
        aria-label={t(DEFAULT.OBJECTS_DELETE, { name: projectObject.name })}
        onClick={() => onDelete(projectObject.id)}
      />
    </li>
  );
};

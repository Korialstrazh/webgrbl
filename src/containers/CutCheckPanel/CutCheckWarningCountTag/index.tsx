/**
 * The Cut check's warning count: a warning tag with the number of warnings, named in full for screen readers, and
 * nothing while there are none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WarningFilled } from '@ant-design/icons';
import { Tag } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_TAG_COLOR_WARNING } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import styles from './styles.module.scss';

interface CutCheckWarningCountTagProps {
  /** How many warnings the check found. */
  count: number;
}

export const CutCheckWarningCountTag = ({ count }: CutCheckWarningCountTagProps): ReactNode => {
  const { t } = useTranslation();

  if (!count) {
    return undefined;
  }

  return (
    <Tag
      className={styles.warningCountTag}
      color={ANTD_TAG_COLOR_WARNING}
      icon={<WarningFilled aria-hidden />}
      role="img"
      aria-label={t(DEFAULT.CUT_CHECK_WARNING_COUNT, { count })}
    >
      {count}
    </Tag>
  );
};

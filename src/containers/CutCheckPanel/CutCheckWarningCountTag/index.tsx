/**
 * The Cut check's risk count: a tag with scissors and the number of cut risks, named in full in its tooltip and for
 * screen readers, and nothing while there are none. It is not a toolpath warning count: those lock Start and have their
 * own warning icon, so the two numbers never read as one count that disagrees.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ScissorOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_TAG_COLOR_WARNING } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import styles from './styles.module.scss';

interface CutCheckWarningCountTagProps {
  /** How many cut risks the check found. */
  count: number;
}

export const CutCheckWarningCountTag = ({ count }: CutCheckWarningCountTagProps): ReactNode => {
  const { t } = useTranslation();

  if (!count) {
    return undefined;
  }

  const labelText: string = t(DEFAULT.CUT_CHECK_WARNING_COUNT, { count });

  return (
    <Tooltip title={labelText}>
      <Tag
        className={styles.warningCountTag}
        color={ANTD_TAG_COLOR_WARNING}
        icon={<ScissorOutlined aria-hidden />}
        role="img"
        aria-label={labelText}
      >
        {count}
      </Tag>
    </Tooltip>
  );
};

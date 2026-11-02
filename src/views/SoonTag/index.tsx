/**
 * The small neutral "Soon" tag that marks one control that is not built yet. It takes the keyboard focus, so a
 * keyboard user can reach the tooltip that says what the control will do; screen readers get that text as hidden text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Tag } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_TAG_VARIANT_FILLED } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface SoonTagProps {
  /** What the control will do, read out after the tag text. */
  description: string;
}

export const SoonTag = ({ description }: SoonTagProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <Tag className={styles.soonTag} variant={ANTD_TAG_VARIANT_FILLED} tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}>
      {t(DEFAULT.COMING_SOON)}
      <span className={styles.description}>{description}</span>
    </Tag>
  );
};

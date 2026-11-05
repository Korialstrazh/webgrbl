/**
 * The card on an empty bed: drop an SVG, import one, or start with the test sample. It leaves with the first object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CloudUploadOutlined, ImportOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_DEFAULT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AddTestSampleButton } from '../AddTestSampleButton';
import { SvgImportButton } from '../SvgImportButton';
import styles from './styles.module.scss';

export const BedEmptyCard = (): ReactNode => {
  const { t } = useTranslation();
  // One accent action at a time: the Job card's readiness row leads until the design is the next step.

  return (
    <div className={styles.bedEmptyCard}>
      <div className={styles.card}>
        <CloudUploadOutlined className={styles.icon} aria-hidden />
        <p className={styles.hint}>{t(DEFAULT.BED_EMPTY_DROP_HINT)}</p>
        <div className={styles.actions}>
          <SvgImportButton
            buttonType={ANTD_BUTTON_TYPE_DEFAULT}
            iconComponent={<ImportOutlined aria-hidden />}
          />
          <AddTestSampleButton />
        </div>
      </div>
    </div>
  );
};

/**
 * The card on an empty bed: Import SVG as the one accent action, drop an SVG, or start with the test sample. The Job
 * card leaves the import to it while it is on screen, so Import SVG shows at most twice with the top bar. It leaves
 * with the first object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CloudUploadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AddTestSampleButton } from '../AddTestSampleButton';
import { SvgImportButton } from '../SvgImportButton';
import { BED_EMPTY_IMPORT_BUTTON_ID } from './bed.empty.card.constants';
import styles from './styles.module.scss';

export const BedEmptyCard = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <div className={styles.bedEmptyCard}>
      <div className={styles.card}>
        <CloudUploadOutlined className={styles.icon} aria-hidden />
        <p className={styles.hint}>{t(DEFAULT.BED_EMPTY_DROP_HINT)}</p>
        <div className={styles.actions}>
          <SvgImportButton
            buttonType={ANTD_BUTTON_TYPE_PRIMARY}
            iconComponent={<CloudUploadOutlined aria-hidden />}
            buttonId={BED_EMPTY_IMPORT_BUTTON_ID}
          />
          <AddTestSampleButton />
        </div>
      </div>
    </div>
  );
};

/**
 * The card on an empty bed: drop an SVG or start with the test sample. In a wide layout the Job card beside it carries
 * Import SVG as its next step, so the card leaves that button out and Import SVG shows twice with the top bar. A narrow
 * layout shows one region at a time, so there the card keeps Import SVG as its accent action. It leaves with the
 * first object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { CloudUploadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_PRIMARY } from '../../utils/antd.constants';
import { useIsWideLayout } from '../../utils/hooks/use.is.wide.layout';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AddTestSampleButton } from '../AddTestSampleButton';
import { SvgImportButton } from '../SvgImportButton';
import { BED_EMPTY_IMPORT_BUTTON_ID } from './bed.empty.card.constants';
import styles from './styles.module.scss';

export const BedEmptyCard = (): ReactNode => {
  const { t } = useTranslation();
  const isWideLayout: boolean = useIsWideLayout();

  return (
    <div className={styles.bedEmptyCard}>
      <div className={styles.card}>
        <CloudUploadOutlined className={styles.icon} aria-hidden />
        <p className={styles.hint}>{t(DEFAULT.BED_EMPTY_DROP_HINT)}</p>
        <div className={styles.actions}>
          {!isWideLayout && (
            <SvgImportButton
              buttonType={ANTD_BUTTON_TYPE_PRIMARY}
              iconComponent={<CloudUploadOutlined aria-hidden />}
              buttonId={BED_EMPTY_IMPORT_BUTTON_ID}
            />
          )}
          <AddTestSampleButton />
        </div>
      </div>
    </div>
  );
};

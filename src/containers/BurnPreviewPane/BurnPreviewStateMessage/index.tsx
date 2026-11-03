/**
 * Says why the 3D scene is empty: no material, out of date, a build running or a failed build. With no material it also
 * offers to add one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Button, Spin } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_ALERT_TYPE_INFO, ANTD_ALERT_TYPE_WARNING, ANTD_BUTTON_SIZE_SMALL } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import {
  BURN_PREVIEW_EMPTY_STATE,
  BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS,
} from '../../../utils/states/burn.preview.empty.state.constants';
import type { BurnPreviewEmptyState } from '../../../utils/states/burn.preview.empty.state.constants';
import { selectBurnPreviewEmptyState } from '../../../utils/states/burn.preview.selectors';
import { MaterialDialog } from '../../MaterialDialog';
import type { BurnPreviewStateMessageProps } from './interfaces/BurnPreviewStateMessageProps';
import styles from './styles.module.scss';

export const BurnPreviewStateMessage = ({ isSceneUnavailable }: BurnPreviewStateMessageProps): ReactNode => {
  const { t } = useTranslation();
  const emptyState: BurnPreviewEmptyState | undefined = useSelector(selectBurnPreviewEmptyState);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState<boolean>(false);
  const isMaterialMissing: boolean = emptyState === BURN_PREVIEW_EMPTY_STATE.NO_MATERIAL;
  const isMessageShown: boolean = !!emptyState && (isMaterialMissing || !isSceneUnavailable);

  const messageComponent: ReactNode = getMessageComponent();

  function getMessageComponent(): ReactNode {
    if (!emptyState || !isMessageShown) {
      return null;
    }

    if (emptyState === BURN_PREVIEW_EMPTY_STATE.BUILDING) {
      return (
        <div className={styles.building} role="status">
          <Spin aria-hidden="true" />
          <span>{t(DEFAULT.BURN_PREVIEW_BUILDING)}</span>
        </div>
      );
    }

    return (
      <Alert
        className={styles.message}
        type={isMaterialMissing ? ANTD_ALERT_TYPE_INFO : ANTD_ALERT_TYPE_WARNING}
        title={t(BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS[emptyState])}
        action={isMaterialMissing && (
          <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => setIsMaterialDialogOpen(true)}>
            {t(DEFAULT.BURN_PREVIEW_ADD_MATERIAL)}
          </Button>
        )}
      />
    );
  }

  // The dialog stays mounted whatever the state, so it cannot vanish and come back while the flag is still set.
  return (
    <>
      {messageComponent}
      <MaterialDialog isOpen={isMaterialDialogOpen} onClose={() => setIsMaterialDialogOpen(false)} />
    </>
  );
};

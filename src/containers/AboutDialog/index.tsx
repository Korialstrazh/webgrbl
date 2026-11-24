/**
 * The About dialog: the app name, its version, what it does, who made it, its licence, the LaserGRBL credit and the
 * link to the source code.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GithubOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_REPOSITORY_URL, EXTERNAL_LINK_REL, EXTERNAL_LINK_TARGET } from '../../utils/app.repository.constants';
import { APP_VERSION } from '../../utils/app.version.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { AppModal } from '../AppModal';
import { ABOUT_CREATOR_NAME, ABOUT_DIALOG_OVERLAY_ID, ABOUT_DIALOG_WIDTH } from './about.dialog.constants';
import type { AboutDialogProps } from './interfaces/AboutDialogProps';
import styles from './styles.module.scss';

export const AboutDialog = ({ isOpen, onClose }: AboutDialogProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <AppModal
      isOpen={isOpen}
      overlayIdPrefix={ABOUT_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.ABOUT_TITLE)}
      footer={null}
      maxWidth={ABOUT_DIALOG_WIDTH}
      onClose={onClose}
    >
      <div className={styles.about}>
        <Typography.Text strong>{t(DEFAULT.ABOUT_VERSION, { version: APP_VERSION })}</Typography.Text>
        <Typography.Paragraph>{t(DEFAULT.ABOUT_DESCRIPTION)}</Typography.Paragraph>
        <Typography.Text>{t(DEFAULT.ABOUT_CREATOR, { name: ABOUT_CREATOR_NAME })}</Typography.Text>
        <Typography.Text>{t(DEFAULT.ABOUT_LICENCE)}</Typography.Text>
        <Typography.Text type="secondary">{t(DEFAULT.ABOUT_CREDIT)}</Typography.Text>
        <Typography.Link href={APP_REPOSITORY_URL} target={EXTERNAL_LINK_TARGET} rel={EXTERNAL_LINK_REL}>
          <GithubOutlined aria-hidden /> {t(DEFAULT.ABOUT_SOURCE)}
        </Typography.Link>
      </div>
    </AppModal>
  );
};

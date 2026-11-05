/**
 * The bed tools and views that are not built yet (Edit nodes, Align, 3D), gathered behind one icon button, so the bed
 * header stays one row. Each entry is disabled and says what it will do, with a Soon tag.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_DROPDOWN_TRIGGER_CLICK } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { ProjectMenuItems } from '../../TopBar/interfaces/ProjectMenuItems';
import { BED_COMING_SOON_TOOLS } from '../bed.toolbar.constants';
import type { BedComingSoonToolKeys } from '../interfaces/BedComingSoonToolKeys';
import styles from './styles.module.scss';

export const BedMoreToolsMenu = (): ReactNode => {
  const { t } = useTranslation();
  const menuItems: ProjectMenuItems = BED_COMING_SOON_TOOLS.map(({
    labelKey,
    descriptionKey,
  }: BedComingSoonToolKeys) => ({
    key: labelKey,
    disabled: true,
    label: (
      <span className={styles.toolEntry}>
        <span className={styles.toolName}>{t(labelKey)}</span>
        <span className={styles.soonText}>{t(DEFAULT.COMING_SOON)}</span>
        <span className={styles.toolDescription}>{t(descriptionKey)}</span>
      </span>
    ),
  }));

  return (
    <Dropdown
      trigger={ANTD_DROPDOWN_TRIGGER_CLICK}
      menu={{ items: menuItems }}
      classNames={{ root: styles.moreToolsMenu }}
    >
      <Button icon={<EllipsisOutlined />} aria-label={t(DEFAULT.BED_MORE_TOOLS_LABEL)} />
    </Dropdown>
  );
};

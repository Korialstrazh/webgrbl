/**
 * The overflow menu of a narrow top bar: a compact "more" button that holds the entries the bar has no room for, so
 * the connection pill always stays visible. The stylesheet shows it only below the narrow breakpoint, where the bar
 * hides the same entries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Dropdown } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_TEXT, ANTD_DROPDOWN_TRIGGER_CLICK } from '../../../utils/antd.constants';
import { HORIZONTAL_ELLIPSIS } from '../../../utils/characters.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { ProjectMenuClickInfo } from '../interfaces/ProjectMenuClickInfo';
import type { ProjectMenuItems } from '../interfaces/ProjectMenuItems';
import type { TopBarOverflowMenuProps } from '../interfaces/TopBarOverflowMenuProps';
import styles from './styles.module.scss';
import { TOP_BAR_OVERFLOW_MENU_KEY } from './top.bar.overflow.menu.constants';

export const TopBarOverflowMenu = ({ onOpenMachineProfiles }: TopBarOverflowMenuProps): ReactNode => {
  const { t } = useTranslation();
  const menuItems: ProjectMenuItems = [
    { key: TOP_BAR_OVERFLOW_MENU_KEY.MACHINE_PROFILES, label: t(DEFAULT.TOP_BAR_MENU_MACHINE_PROFILES) },
    {
      key: TOP_BAR_OVERFLOW_MENU_KEY.MATERIALS,
      label: t(DEFAULT.TOP_BAR_MENU_MATERIALS),
      extra: t(DEFAULT.COMING_SOON),
      disabled: true,
    },
  ];

  const handleMenuClick = ({ key }: ProjectMenuClickInfo): void => {
    if (key === TOP_BAR_OVERFLOW_MENU_KEY.MACHINE_PROFILES) {
      onOpenMachineProfiles();
    }
  };

  return (
    <Dropdown trigger={ANTD_DROPDOWN_TRIGGER_CLICK} menu={{ items: menuItems, onClick: handleMenuClick }}>
      <Button
        className={styles.overflowButton}
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_LARGE}
        icon={HORIZONTAL_ELLIPSIS}
        aria-label={t(DEFAULT.TOP_BAR_MORE)}
      />
    </Dropdown>
  );
};

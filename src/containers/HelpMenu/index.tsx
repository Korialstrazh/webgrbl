/**
 * The Help menu of the top bar: a question mark button that lists the getting-started handbook and the About dialog.
 * Both dialogs live in the top bar and open through the workbench state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-23
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_TYPE_TEXT, ANTD_DROPDOWN_TRIGGER_CLICK } from '../../utils/antd.constants';
import { useOverlayRegistration } from '../../utils/hooks/use.overlay.registration';
import { usePopoverAutoClose } from '../../utils/hooks/use.popover.auto.close';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { AppDispatch } from '../../utils/states/new.store';
import { AboutDialogOpenChanged, HandbookDialogOpenChanged } from '../../utils/states/ui.workbench.state';
import { IconActionButton } from '../../views/IconActionButton';
import { HELP_MENU_KEY, HELP_MENU_OVERLAY_ID } from './help.menu.constants';

export const HelpMenu = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Escape must only close this, not also stop the machine.
  useOverlayRegistration(HELP_MENU_OVERLAY_ID, isMenuOpen);
  usePopoverAutoClose(isMenuOpen, () => setIsMenuOpen(false));

  const menuItems: MenuProps['items'] = [
    { key: HELP_MENU_KEY.HANDBOOK, label: t(DEFAULT.HELP_MENU_HANDBOOK) },
    { key: HELP_MENU_KEY.ABOUT, label: t(DEFAULT.HELP_MENU_ABOUT) },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }): void => {
    setIsMenuOpen(false);

    if (key === HELP_MENU_KEY.HANDBOOK) {
      dispatch(new HandbookDialogOpenChanged({ isHandbookOpen: true }));
    } else if (key === HELP_MENU_KEY.ABOUT) {
      dispatch(new AboutDialogOpenChanged({ isAboutOpen: true }));
    }
  };

  return (
    <Dropdown
      trigger={ANTD_DROPDOWN_TRIGGER_CLICK}
      open={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      menu={{ items: menuItems, onClick: handleMenuClick }}
    >
      <IconActionButton
        type={ANTD_BUTTON_TYPE_TEXT}
        iconComponent={<QuestionCircleOutlined aria-hidden />}
        labelText={t(DEFAULT.HELP_MENU_LABEL)}
      />
    </Dropdown>
  );
};

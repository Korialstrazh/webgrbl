/**
 * The pre-flight check card. Shown but inert for now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { Button } from '../../../views/Button';
import { BUTTON_SIZE, BUTTON_VARIANT } from '../../../views/Button/button.constants';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';

export const PreflightCard = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <Panel title={t(DEFAULT.MACHINE_PREFLIGHT_TITLE)}>
      <ComingSoon description={t(DEFAULT.MACHINE_PREFLIGHT_DESCRIPTION)}>
        <Button variant={BUTTON_VARIANT.SECONDARY} size={BUTTON_SIZE.LARGE} onClick={doNothing}>
          {t(DEFAULT.MACHINE_PREFLIGHT_RUN)}
        </Button>
      </ComingSoon>
    </Panel>
  );
};

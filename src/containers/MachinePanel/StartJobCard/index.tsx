/**
 * The start job card. Shown but inert for now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_LARGE, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';

export const StartJobCard = (): ReactNode => {
  const { t } = useTranslation();

  return (
    <Panel title={t(DEFAULT.MACHINE_START_JOB_TITLE)}>
      <ComingSoon description={t(DEFAULT.MACHINE_START_JOB_DESCRIPTION)}>
        <Button type={ANTD_BUTTON_TYPE_PRIMARY} size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
          {t(DEFAULT.MACHINE_START_JOB)}
        </Button>
      </ComingSoon>
    </Panel>
  );
};

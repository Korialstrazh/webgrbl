/**
 * The move card: home, set zero, the jog pad and the step sizes. Not built yet, so it is shown but inert.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Segmented } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_LARGE } from '../../../utils/antd.constants';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { ComingSoon } from '../../../views/ComingSoon';
import { Panel } from '../../../views/Panel';
import type { JogPadCell } from './interfaces/JogPadCell';
import type { JogStepOption } from './interfaces/JogStepOption';
import { DEFAULT_JOG_STEP_MM, JOG_PAD_CELLS, JOG_STEP_DISTANCES_MM } from './jog.pad.constants';
import styles from './styles.module.scss';

export const MoveCard = (): ReactNode => {
  const { t } = useTranslation();
  const stepOptions: JogStepOption[] = JOG_STEP_DISTANCES_MM.map((distance: string) => ({
    value: distance,
    label: t(DEFAULT.MACHINE_MOVE_STEP_OPTION, { distance }),
  }));

  return (
    <Panel title={t(DEFAULT.MACHINE_MOVE_TITLE)}>
      <ComingSoon description={t(DEFAULT.MACHINE_MOVE_DESCRIPTION)}>
        <div className={styles.moveCard}>
          <div className={styles.homeRow}>
            <Button size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
              {t(DEFAULT.MACHINE_MOVE_HOME)}
            </Button>
            <Button size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
              {t(DEFAULT.MACHINE_MOVE_SET_ZERO)}
            </Button>
          </div>
          <div className={styles.jogPad}>
            {JOG_PAD_CELLS.map((cell: JogPadCell) =>
              cell.arrowGlyph ? (
                <Button
                  key={cell.labelKey}
                  size={ANTD_BUTTON_SIZE_LARGE}
                  icon={cell.arrowGlyph}
                  aria-label={t(cell.labelKey)}
                  onClick={doNothing}
                />
              ) : (
                <Button key={cell.labelKey} size={ANTD_BUTTON_SIZE_LARGE} onClick={doNothing}>
                  {t(cell.labelKey)}
                </Button>
              ),
            )}
          </div>
          <Segmented
            aria-label={t(DEFAULT.MACHINE_MOVE_STEP_LABEL)}
            options={stepOptions}
            value={DEFAULT_JOG_STEP_MM}
            onChange={doNothing}
          />
        </div>
      </ComingSoon>
    </Panel>
  );
};

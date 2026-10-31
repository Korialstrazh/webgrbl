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
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { doNothing } from '../../../utils/do.nothing';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { Button } from '../../../views/Button';
import { BUTTON_SIZE, BUTTON_VARIANT } from '../../../views/Button/button.constants';
import { ComingSoon } from '../../../views/ComingSoon';
import { IconButton } from '../../../views/IconButton';
import { Panel } from '../../../views/Panel';
import { SegmentedControl } from '../../../views/SegmentedControl';
import type { SegmentedOption } from '../../../views/SegmentedControl/interfaces/SegmentedOption';
import type { JogPadCell } from './interfaces/JogPadCell';
import { DEFAULT_JOG_STEP_MM, JOG_PAD_CELLS, JOG_STEP_DISTANCES_MM } from './jog.pad.constants';
import styles from './styles.module.scss';

export const MoveCard = (): ReactNode => {
  const { t } = useTranslation();
  const stepOptions: SegmentedOption[] = JOG_STEP_DISTANCES_MM.map((distance: string) => ({
    value: distance,
    label: t(DEFAULT.MACHINE_MOVE_STEP_OPTION, { distance }),
  }));

  return (
    <Panel title={t(DEFAULT.MACHINE_MOVE_TITLE)}>
      <ComingSoon description={t(DEFAULT.MACHINE_MOVE_DESCRIPTION)}>
        <div className={styles.moveCard}>
          <div className={styles.homeRow}>
            <Button variant={BUTTON_VARIANT.SECONDARY} size={BUTTON_SIZE.LARGE} onClick={doNothing}>
              {t(DEFAULT.MACHINE_MOVE_HOME)}
            </Button>
            <Button variant={BUTTON_VARIANT.SECONDARY} size={BUTTON_SIZE.LARGE} onClick={doNothing}>
              {t(DEFAULT.MACHINE_MOVE_SET_ZERO)}
            </Button>
          </div>
          <div className={styles.jogPad}>
            {JOG_PAD_CELLS.map((cell: JogPadCell) =>
              cell.arrowGlyph ? (
                <IconButton
                  key={cell.labelKey}
                  label={t(cell.labelKey)}
                  iconComponent={cell.arrowGlyph}
                  onClick={doNothing}
                />
              ) : (
                <Button key={cell.labelKey} variant={BUTTON_VARIANT.SECONDARY} onClick={doNothing}>
                  {t(cell.labelKey)}
                </Button>
              ),
            )}
          </div>
          <SegmentedControl
            label={t(DEFAULT.MACHINE_MOVE_STEP_LABEL)}
            options={stepOptions}
            selectedValue={DEFAULT_JOG_STEP_MM}
            onSelect={doNothing}
          />
        </div>
      </ComingSoon>
    </Panel>
  );
};

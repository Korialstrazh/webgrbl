/**
 * The central region: a toolbar (not built yet) above the bed drawn to scale; the toasts are anchored to its top right.
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
import { useSelector } from 'react-redux';
import { getBedDimensions } from '../../utils/bed/get.bed.dimensions';
import type { BedDimensions } from '../../utils/bed/interfaces/BedDimensions';
import { doNothing } from '../../utils/do.nothing';
import type { GrblResolvedStatus } from '../../utils/grbl/interfaces/GrblResolvedStatus';
import { DEFAULT } from '../../utils/localization/default.locales';
import { selectGrblSettings, selectIsConnected } from '../../utils/states/grbl.connection.state';
import { selectMachineStatus } from '../../utils/states/machine.status.state';
import { BedView } from '../../views/BedView';
import { Button } from '../../views/Button';
import { BUTTON_VARIANT } from '../../views/Button/button.constants';
import { ComingSoon } from '../../views/ComingSoon';
import { SegmentedControl } from '../../views/SegmentedControl';
import type { SegmentedOption } from '../../views/SegmentedControl/interfaces/SegmentedOption';
import { ToastStack } from '../ToastStack';
import { BED_PLACEHOLDER_LABEL_KEYS } from './bed.placeholder.constants';
import { BED_TOOL_LABEL_KEYS, BED_VIEW_MODE_DESIGN, BED_VIEW_MODE_OPTION_KEYS } from './bed.toolbar.constants';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';
import styles from './styles.module.scss';

export const BedPanel = (): ReactNode => {
  const { t } = useTranslation();
  const settings: Record<number, string> = useSelector(selectGrblSettings);
  const isConnected: boolean = useSelector(selectIsConnected);
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const dimensions: BedDimensions = getBedDimensions(settings, isConnected);
  const placeholderKey: string | undefined = BED_PLACEHOLDER_LABEL_KEYS[dimensions.placeholderKind];
  const viewModeOptions: SegmentedOption[] = BED_VIEW_MODE_OPTION_KEYS.map((option: BedViewModeOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <main className={styles.bedPanel}>
      <h2 className={styles.title}>{t(DEFAULT.BED_PANEL_TITLE)}</h2>
      <ComingSoon description={t(DEFAULT.BED_TOOLBAR_DESCRIPTION)}>
        <div className={styles.toolbar}>
          {BED_TOOL_LABEL_KEYS.map((labelKey: string) => (
            <Button key={labelKey} variant={BUTTON_VARIANT.SECONDARY} onClick={doNothing}>
              {t(labelKey)}
            </Button>
          ))}
          <SegmentedControl
            label={t(DEFAULT.BED_VIEW_MODE_LABEL)}
            options={viewModeOptions}
            selectedValue={BED_VIEW_MODE_DESIGN}
            onSelect={doNothing}
          />
        </div>
      </ComingSoon>
      <div className={styles.bed}>
        <BedView
          dimensions={dimensions}
          headPosition={status?.machinePosition}
          workOriginPosition={status?.workCoordinateOffset}
          placeholderLabel={placeholderKey && t(placeholderKey)}
        />
      </div>
      <ToastStack />
    </main>
  );
};

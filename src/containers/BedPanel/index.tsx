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
import { Button, Layout, Segmented } from 'antd';
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
import { ComingSoon } from '../../views/ComingSoon';
import { ToastStack } from '../ToastStack';
import { BED_PLACEHOLDER_LABEL_KEYS } from './bed.placeholder.constants';
import { BED_TOOL_LABEL_KEYS, BED_VIEW_MODE_DESIGN, BED_VIEW_MODE_OPTION_KEYS } from './bed.toolbar.constants';
import type { BedViewModeOption } from './interfaces/BedViewModeOption';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';
import styles from './styles.module.scss';

export const BedPanel = (): ReactNode => {
  const { t } = useTranslation();
  const settings: Record<number, string> = useSelector(selectGrblSettings);
  const isConnected: boolean = useSelector(selectIsConnected);
  const status: GrblResolvedStatus | undefined = useSelector(selectMachineStatus);
  const dimensions: BedDimensions = getBedDimensions(settings, isConnected);
  const placeholderKey: string | undefined = BED_PLACEHOLDER_LABEL_KEYS[dimensions.placeholderKind];
  const viewModeOptions: BedViewModeOption[] = BED_VIEW_MODE_OPTION_KEYS.map((option: BedViewModeOptionKey) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <Layout.Content className={styles.bedPanel}>
      <h2 className={styles.title}>{t(DEFAULT.BED_PANEL_TITLE)}</h2>
      <ComingSoon description={t(DEFAULT.BED_TOOLBAR_DESCRIPTION)}>
        <div className={styles.toolbar}>
          {BED_TOOL_LABEL_KEYS.map((labelKey: string) => (
            <Button key={labelKey} onClick={doNothing}>
              {t(labelKey)}
            </Button>
          ))}
          <Segmented
            aria-label={t(DEFAULT.BED_VIEW_MODE_LABEL)}
            options={viewModeOptions}
            value={BED_VIEW_MODE_DESIGN}
            onChange={doNothing}
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
    </Layout.Content>
  );
};

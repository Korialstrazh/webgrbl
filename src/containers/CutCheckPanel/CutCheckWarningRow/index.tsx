/**
 * One Cut check warning as a compact row: a warning icon, the layer name, the predicted against the needed depth and a
 * button that opens that layer's settings, where the power, speed and runs are fixed. The full sentence, with its
 * suggestion, is the row's tooltip and accessible description.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { ToolOutlined, WarningFilled } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { AppDispatch } from '../../../utils/states/new.store';
import { LayerSettingsOpenChanged } from '../../../utils/states/ui.workbench.state';
import { getCutCheckNeededDepthText, getCutCheckPredictedDepthText } from '../get.cut.check.depth.text';
import { getCutCheckWarningText } from '../get.cut.check.warning.text';
import type { CutCheckWarningRowProps } from '../interfaces/CutCheckWarningRowProps';
import styles from './styles.module.scss';

export const CutCheckWarningRow = ({ warning, layerName, partCount }: CutCheckWarningRowProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const warningText: string = getCutCheckWarningText(t, warning, layerName, partCount);
  const depthText: string = t(DEFAULT.CUT_CHECK_DEPTH_COMPARISON, {
    predicted: getCutCheckPredictedDepthText(warning),
    needed: getCutCheckNeededDepthText(warning),
  });

  return (
    <Tooltip title={warningText}>
      <li className={styles.warningRow} aria-label={warningText}>
        <WarningFilled className={styles.warningIcon} aria-hidden />
        <span className={styles.layerName}>{layerName}</span>
        <span className={styles.depth}>{depthText}</span>
        <Button
          size={ANTD_BUTTON_SIZE_SMALL}
          icon={<ToolOutlined aria-hidden />}
          aria-label={t(DEFAULT.CUT_CHECK_OPEN_LAYER_SETTINGS, { layer: layerName })}
          onClick={() => dispatch(new LayerSettingsOpenChanged({ openLayerSettingsKey: warning.layerKey }))}
        >
          {t(DEFAULT.CUT_CHECK_FIX)}
        </Button>
      </li>
    </Tooltip>
  );
};

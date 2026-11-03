/**
 * The Cut check of the 3D view: the part counts, one row per part that selects it, the warnings, and whether this is an
 * estimate from a test or a guess. Without a current model it says why and shows no old parts. Warnings never block
 * export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Button, Tag } from 'antd';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_ALERT_TYPE_WARNING,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_TAG_COLOR_WARNING,
} from '../../utils/antd.constants';
import { BURN_PART_STATUS } from '../../utils/burn.model/burn.model.constants';
import type { BurnModel } from '../../utils/burn.model/interfaces/BurnModel';
import type { BurnPart } from '../../utils/burn.model/interfaces/BurnPart';
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { getLayerNameByKey } from '../../utils/layers/get.layer.name.by.key';
import type { ProjectLayer } from '../../utils/layers/interfaces/ProjectLayer';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { PaletteEntry } from '../../utils/palette/interfaces/PaletteEntry';
import {
  BurnPartSelected,
  selectCurrentBurnModel,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import { BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS } from '../../utils/states/burn.preview.empty.state.constants';
import type { BurnPreviewEmptyState } from '../../utils/states/burn.preview.empty.state.constants';
import { selectBurnPreviewEmptyState } from '../../utils/states/burn.preview.selectors';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { selectProjectLayers } from '../../utils/states/project.document.state';
import { Panel } from '../../views/Panel';
import { getCutCheckWarningText } from './get.cut.check.warning.text';
import styles from './styles.module.scss';

const PART_STATUS_TEXT_KEYS: Record<BurnPart['status'], string> = {
  [BURN_PART_STATUS.FREE]: DEFAULT.CUT_CHECK_PART_STATUS_FREE,
  [BURN_PART_STATUS.BORDERLINE]: DEFAULT.CUT_CHECK_PART_STATUS_MAY_STAY_ATTACHED,
  [BURN_PART_STATUS.NOT_THROUGH]: DEFAULT.CUT_CHECK_PART_STATUS_ATTACHED,
};

const WARNING_ROW_KEY_SEPARATOR = '-';

const getWarningRowKey = ({ kind, layerKey, partId }: CutCheckWarning): string =>
  [kind, layerKey, partId].join(WARNING_ROW_KEY_SEPARATOR);

export const CutCheckPanel = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const emptyState: BurnPreviewEmptyState | undefined = useSelector(selectBurnPreviewEmptyState);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const projectLayers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);

  if (!model) {
    return (
      <Panel title={t(DEFAULT.CUT_CHECK_TITLE)}>
        {emptyState && <p className={styles.note}>{t(BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS[emptyState])}</p>}
      </Panel>
    );
  }

  const { freePartCount, borderlinePartCount, attachedPartCount, warnings, isGuess } = model.cutCheck;

  return (
    <Panel title={t(DEFAULT.CUT_CHECK_TITLE)}>
      <div className={styles.cutCheckPanel}>
        <p className={styles.summary}>
          {t(DEFAULT.CUT_CHECK_SUMMARY, {
            parts: t(DEFAULT.CUT_CHECK_PART_COUNT, { count: model.parts.length }),
            free: freePartCount,
            borderline: borderlinePartCount,
            attached: attachedPartCount,
          })}
        </p>
        <p className={styles.note}>{t(isGuess ? DEFAULT.CUT_CHECK_NOTE_GUESS : DEFAULT.CUT_CHECK_NOTE_ESTIMATE)}</p>
        {isGuess && <p className={styles.note}>{t(DEFAULT.CUT_CHECK_TEST_SAMPLE_POINTER)}</p>}
        <ul className={styles.list}>
          {model.parts.map(({ id, status }: BurnPart) => (
            <li key={id}>
              <Button
                className={styles.partRow}
                type={ANTD_BUTTON_TYPE_TEXT}
                aria-pressed={id === selectedPartId}
                onClick={() => dispatch(new BurnPartSelected({ partId: id }))}
              >
                <span>{t(DEFAULT.CUT_CHECK_PART_ROW, { part: id })}</span>
                <Tag color={status === BURN_PART_STATUS.FREE ? undefined : ANTD_TAG_COLOR_WARNING}>
                  {t(PART_STATUS_TEXT_KEYS[status])}
                </Tag>
              </Button>
            </li>
          ))}
        </ul>
        {warnings.map((warning: CutCheckWarning) => (
          <Alert
            key={getWarningRowKey(warning)}
            type={ANTD_ALERT_TYPE_WARNING}
            title={getCutCheckWarningText(
              t,
              warning,
              getLayerNameByKey(warning.layerKey, projectLayers, paletteEntries),
            )}
          />
        ))}
      </div>
    </Panel>
  );
};

/**
 * The Cut check of the 3D view: the part counts, the warnings put together by what they say, a scrolling list with one
 * row per part that selects it and shows its own warning, and whether this is an estimate from a test or a guess.
 * Without a current model it says why and shows no old parts. Warnings never block export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Alert, Button, Tag } from 'antd';
import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_ALERT_TYPE_WARNING,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_TAG_COLOR_SUCCESS,
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
  BurnPartHovered,
  BurnPartSelected,
  selectCurrentBurnModel,
  selectHoveredBurnPartId,
  selectSelectedBurnPartId,
} from '../../utils/states/burn.model.state';
import { BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS } from '../../utils/states/burn.preview.empty.state.constants';
import type { BurnPreviewEmptyState } from '../../utils/states/burn.preview.empty.state.constants';
import { selectBurnPreviewEmptyState } from '../../utils/states/burn.preview.selectors';
import type { AppDispatch } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { selectProjectLayers } from '../../utils/states/project.document.state';
import { Panel } from '../../views/Panel';
import { BurnPartRowLift } from './BurnPartRowLift';
import { getCutCheckWarningGroups } from './get.cut.check.warning.groups';
import { getCutCheckWarningText } from './get.cut.check.warning.text';
import type { CutCheckWarningGroup } from './interfaces/CutCheckWarningGroup';
import styles from './styles.module.scss';

const PART_STATUS_TEXT_KEYS: Record<BurnPart['status'], string> = {
  [BURN_PART_STATUS.FREE]: DEFAULT.CUT_CHECK_PART_STATUS_FREE,
  [BURN_PART_STATUS.BORDERLINE]: DEFAULT.CUT_CHECK_PART_STATUS_MAY_STAY_ATTACHED,
  [BURN_PART_STATUS.NOT_THROUGH]: DEFAULT.CUT_CHECK_PART_STATUS_ATTACHED,
};

const WARNING_ROW_KEY_SEPARATOR = '-';
const SELECTED_ROW_SCROLL: ScrollIntoViewOptions = { block: 'nearest' };

const getWarningRowKey = ({ kind, layerKey, partId }: CutCheckWarning): string =>
  [kind, layerKey, partId].join(WARNING_ROW_KEY_SEPARATOR);

const getSummaryCountClassName = (count: number): string | undefined => (count ? undefined : styles.emptyCount);

export const CutCheckPanel = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const emptyState: BurnPreviewEmptyState | undefined = useSelector(selectBurnPreviewEmptyState);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const hoveredPartId: number | undefined = useSelector(selectHoveredBurnPartId);
  const selectedRowRef: RefObject<HTMLLIElement | null> = useRef<HTMLLIElement>(null);
  const projectLayers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);

  useEffect(() => {
    // Nearest, so a click on a row in view moves nothing.
    selectedRowRef.current?.scrollIntoView(SELECTED_ROW_SCROLL);
  }, [selectedPartId]);

  if (!model) {
    return (
      <Panel title={t(DEFAULT.CUT_CHECK_TITLE)}>
        {emptyState && <p className={styles.note}>{t(BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS[emptyState])}</p>}
      </Panel>
    );
  }

  const { freePartCount, borderlinePartCount, attachedPartCount, warnings, isGuess } = model.cutCheck;
  const warningGroups: CutCheckWarningGroup[] = getCutCheckWarningGroups(warnings);
  const getLayerName = (layerKey: string): string => getLayerNameByKey(layerKey, projectLayers, paletteEntries);
  // A row repeats its warning only where the alert does not name the part.
  const selectedPartWarnings: CutCheckWarning[] = warningGroups
    .filter((group: CutCheckWarningGroup): boolean => group.warnings.length > 1)
    .flatMap((group: CutCheckWarningGroup): CutCheckWarning[] => group.warnings)
    .filter(({ partId }: CutCheckWarning): boolean => !!partId && partId === selectedPartId);

  return (
    <Panel title={t(DEFAULT.CUT_CHECK_TITLE)}>
      <div className={styles.cutCheckPanel}>
        <div className={styles.summary}>
          <strong>{t(DEFAULT.CUT_CHECK_PART_COUNT, { count: model.parts.length })}</strong>
          <Tag className={getSummaryCountClassName(freePartCount)} color={freePartCount ? ANTD_TAG_COLOR_SUCCESS : undefined}>
            {t(DEFAULT.CUT_CHECK_SUMMARY_FREE, { count: freePartCount })}
          </Tag>
          <Tag
            className={getSummaryCountClassName(borderlinePartCount)}
            color={borderlinePartCount ? ANTD_TAG_COLOR_WARNING : undefined}
          >
            {t(DEFAULT.CUT_CHECK_SUMMARY_MAY_STAY_ATTACHED, { count: borderlinePartCount })}
          </Tag>
          <Tag
            className={getSummaryCountClassName(attachedPartCount)}
            color={attachedPartCount ? ANTD_TAG_COLOR_WARNING : undefined}
          >
            {t(DEFAULT.CUT_CHECK_SUMMARY_ATTACHED, { count: attachedPartCount })}
          </Tag>
        </div>
        <p className={styles.note}>{t(isGuess ? DEFAULT.CUT_CHECK_NOTE_GUESS : DEFAULT.CUT_CHECK_NOTE_ESTIMATE)}</p>
        {isGuess && <p className={styles.note}>{t(DEFAULT.CUT_CHECK_TEST_SAMPLE_POINTER)}</p>}
        {warningGroups.map(({ groupKey, warnings: groupWarnings }: CutCheckWarningGroup) => (
          <Alert
            key={groupKey}
            type={ANTD_ALERT_TYPE_WARNING}
            title={getCutCheckWarningText(t, groupWarnings[0], getLayerName(groupWarnings[0].layerKey), groupWarnings.length)}
          />
        ))}
        <ul className={styles.list}>
          {model.parts.map(({ id, status }: BurnPart) => (
            <li key={id} ref={id === selectedPartId ? selectedRowRef : undefined}>
              <Button
                className={id === hoveredPartId ? [styles.partRow, styles.hoveredRow].join(' ') : styles.partRow}
                type={ANTD_BUTTON_TYPE_TEXT}
                aria-pressed={id === selectedPartId}
                onClick={() => dispatch(new BurnPartSelected({ partId: id }))}
                onMouseEnter={() => dispatch(new BurnPartHovered({ partId: id }))}
                onMouseLeave={() => dispatch(new BurnPartHovered({ partId: undefined }))}
              >
                <span>{t(DEFAULT.CUT_CHECK_PART_ROW, { part: id })}</span>
                <BurnPartRowLift partId={id} />
                <Tag color={status === BURN_PART_STATUS.FREE ? undefined : ANTD_TAG_COLOR_WARNING}>
                  {t(PART_STATUS_TEXT_KEYS[status])}
                </Tag>
              </Button>
              {id === selectedPartId && selectedPartWarnings.map((warning: CutCheckWarning) => (
                <p key={getWarningRowKey(warning)} className={styles.partDetail}>
                  {getCutCheckWarningText(t, warning, getLayerName(warning.layerKey))}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
};

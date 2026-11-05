/**
 * The Cut check of the 3D view: the part counts, the warnings put together by what they say, a list with one row per
 * part that selects it, cut down to the selected row when it is long so Layers stays near, and whether this is an
 * estimate from a test or a guess. Without a current model it is the heading only, as the 3D view says why, and it
 * shows no old parts. Warnings never block export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckSquareOutlined } from '@ant-design/icons';
import { Alert, Button, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
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
import type { AppDispatch } from '../../utils/states/new.store';
import { selectPaletteEntries } from '../../utils/states/palette.state';
import { selectProjectLayers } from '../../utils/states/project.document.state';
import { Panel } from '../../views/Panel';
import { BurnPartRowLift } from './BurnPartRowLift';
import { getCutCheckListScrollTopPx } from './get.cut.check.list.scroll.top.px';
import { getCutCheckWarningGroups } from './get.cut.check.warning.groups';
import { getCutCheckWarningText } from './get.cut.check.warning.text';
import type { CutCheckWarningGroup } from './interfaces/CutCheckWarningGroup';
import styles from './styles.module.scss';

const PART_STATUS_TEXT_KEYS: Record<BurnPart['status'], string> = {
  [BURN_PART_STATUS.FREE]: DEFAULT.CUT_CHECK_PART_STATUS_FREE,
  [BURN_PART_STATUS.BORDERLINE]: DEFAULT.CUT_CHECK_PART_STATUS_MAY_STAY_ATTACHED,
  [BURN_PART_STATUS.NOT_THROUGH]: DEFAULT.CUT_CHECK_PART_STATUS_ATTACHED,
};

/** More rows than this start cut down to the selected row: the counts above already sum them up. */
const PART_LIST_FULL_ROW_LIMIT = 4;
const SCROLLING_OVERFLOW_VALUES: readonly string[] = ['auto', 'scroll'];

const getScrollingAncestor = (element: HTMLElement): HTMLElement | undefined => {
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (SCROLLING_OVERFLOW_VALUES.includes(getComputedStyle(ancestor).overflowY)) {
      return ancestor;
    }
  }

  return undefined;
};

const getSummaryCountClassName = (count: number): string | undefined => (count ? undefined : styles.emptyCount);

export const CutCheckPanel = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const hoveredPartId: number | undefined = useSelector(selectHoveredBurnPartId);
  const selectedRowRef: RefObject<HTMLLIElement | null> = useRef<HTMLLIElement>(null);
  const [isPartListExpanded, setIsPartListExpanded] = useState<boolean>(false);
  const projectLayers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);

  useEffect(() => {
    // Only the panel moves: stacked, that panel does not scroll, so the scene stays with a user who clicked in it.
    const selectedRow: HTMLLIElement | null = selectedRowRef.current;
    const scroller: HTMLElement | undefined = selectedRow ? getScrollingAncestor(selectedRow) : undefined;

    if (scroller && selectedRow) {
      scroller.scrollTop = getCutCheckListScrollTopPx(scroller, selectedRow);
    }
  }, [selectedPartId, isPartListExpanded]);

  if (!model) {
    return <Panel iconComponent={<CheckSquareOutlined />} title={t(DEFAULT.CUT_CHECK_TITLE)} />;
  }

  const { freePartCount, borderlinePartCount, attachedPartCount, warnings, isGuess } = model.cutCheck;
  const warningGroups: CutCheckWarningGroup[] = getCutCheckWarningGroups(warnings);
  const getLayerName = (layerKey: string): string => getLayerNameByKey(layerKey, projectLayers, paletteEntries);
  const isPartListLong: boolean = model.parts.length > PART_LIST_FULL_ROW_LIMIT;
  const shownParts: BurnPart[] = isPartListLong && !isPartListExpanded
    ? model.parts.filter(({ id }: BurnPart): boolean => id === selectedPartId)
    : model.parts;

  return (
    <Panel iconComponent={<CheckSquareOutlined />} title={t(DEFAULT.CUT_CHECK_TITLE)}>
      <div className={styles.cutCheckPanel}>
        <div className={styles.summary}>
          <strong>{t(DEFAULT.CUT_CHECK_PART_COUNT, { count: model.parts.length })}</strong>
          <Tag
            className={getSummaryCountClassName(freePartCount)}
            color={freePartCount ? ANTD_TAG_COLOR_SUCCESS : undefined}
          >
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
            title={getCutCheckWarningText(
              t,
              groupWarnings[0],
              getLayerName(groupWarnings[0].layerKey),
              groupWarnings.length,
            )}
          />
        ))}
        <ul className={styles.list}>
          {shownParts.map(({ id, status }: BurnPart) => (
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
            </li>
          ))}
        </ul>
        {isPartListLong && (
          <Button
            className={styles.partListToggle}
            aria-expanded={isPartListExpanded}
            onClick={() => setIsPartListExpanded(!isPartListExpanded)}
          >
            {isPartListExpanded
              ? t(DEFAULT.CUT_CHECK_SHOW_FEWER_PARTS)
              : t(DEFAULT.CUT_CHECK_SHOW_ALL_PARTS, { total: model.parts.length })}
          </Button>
        )}
      </div>
    </Panel>
  );
};

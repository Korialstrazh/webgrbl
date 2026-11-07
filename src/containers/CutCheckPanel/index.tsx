/**
 * The Cut check of the 3D view: the part counts as status icons with a count, a small Estimate or Guess badge whose
 * tooltip explains it, one compact icon row per group of warnings with a button to that layer's settings, and a list
 * with one row per part that selects it and carries one status icon, cut down to the selected row when it is long so
 * Layers stays near. Without a current model it is the heading only, as the 3D view says why, and it shows no old
 * parts. Outside the 3D view it is a muted heading line whose note says it runs in 3D, so it keeps its place in the
 * panel. Warnings never block export.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckSquareOutlined, DownOutlined, QuestionCircleOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip } from 'antd';
import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
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
import { IconActionButton } from '../../views/IconActionButton';
import { Panel } from '../../views/Panel';
import { BurnPartRowLift } from './BurnPartRowLift';
import { CutCheckWarningCountTag } from './CutCheckWarningCountTag';
import { CutCheckWarningRow } from './CutCheckWarningRow';
import { PartStatusMark } from './PartStatusMark';
import { getCutCheckSummaryCounts } from './get.cut.check.summary.counts';
import { getCutCheckListScrollTopPx } from './get.cut.check.list.scroll.top.px';
import { getCutCheckWarningGroups } from './get.cut.check.warning.groups';
import type { CutCheckSummaryCount } from './interfaces/CutCheckSummaryCount';
import type { CutCheckWarningGroup } from './interfaces/CutCheckWarningGroup';
import styles from './styles.module.scss';

const PART_STATUS_TEXT_KEYS: Record<BurnPart['status'], string> = {
  [BURN_PART_STATUS.FREE]: DEFAULT.CUT_CHECK_PART_STATUS_FREE,
  [BURN_PART_STATUS.BORDERLINE]: DEFAULT.CUT_CHECK_PART_STATUS_MAY_STAY_ATTACHED,
  [BURN_PART_STATUS.NOT_THROUGH]: DEFAULT.CUT_CHECK_PART_STATUS_ATTACHED,
};

/** More rows than this start cut down to the selected row: the counts above already sum them up. */
const PART_LIST_FULL_ROW_LIMIT = 4;
const NOTE_SENTENCE_SEPARATOR = ' ';
const SCROLLING_OVERFLOW_VALUES: readonly string[] = ['auto', 'scroll'];

const getScrollingAncestor = (element: HTMLElement): HTMLElement | undefined => {
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (SCROLLING_OVERFLOW_VALUES.includes(getComputedStyle(ancestor).overflowY)) {
      return ancestor;
    }
  }

  return undefined;
};

interface CutCheckPanelProps {
  /** Whether the 3D view is shown; elsewhere the Cut check is only its muted heading line. */
  isActive: boolean;
}

export const CutCheckPanel = ({ isActive }: CutCheckPanelProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const hoveredPartId: number | undefined = useSelector(selectHoveredBurnPartId);
  const selectedRowRef: RefObject<HTMLLIElement | null> = useRef<HTMLLIElement>(null);
  const [isPartListExpanded, setIsPartListExpanded] = useState<boolean>(false);
  // The check starts folded to its heading and a warning count, so the 3D view leads with the scene, not numbers.
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const detailsId: string = useId();
  const projectLayers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);

  useEffect(() => {
    // Only the panel moves: stacked, that panel does not scroll, so the scene stays with a user who clicked in it.
    const selectedRow: HTMLLIElement | null = selectedRowRef.current;
    const scroller: HTMLElement | undefined = selectedRow ? getScrollingAncestor(selectedRow) : undefined;

    if (scroller && selectedRow) {
      scroller.scrollTop = getCutCheckListScrollTopPx(scroller, selectedRow);
    }
  }, [selectedPartId, isPartListExpanded, isExpanded]);

  // A part picked in the scene opens the check, so its row is there to see.
  useEffect(() => {
    // eslint-disable-next-line no-restricted-syntax -- part 0 is a real part, distinct from no selection
    if (selectedPartId !== undefined) {
      setIsExpanded(true);
    }
  }, [selectedPartId]);

  // Away from 3D the check is a muted line, but a current model's warning count stays on it, so the warnings are seen
  // in the view where they get fixed.
  if (!isActive) {
    return (
      <Panel
        iconComponent={<CheckSquareOutlined />}
        title={t(DEFAULT.CUT_CHECK_TITLE)}
        headerActionComponent={model && (
          <CutCheckWarningCountTag count={getCutCheckWarningGroups(model.cutCheck.warnings).length} />
        )}
        noteText={t(DEFAULT.CUT_CHECK_3D_ONLY_NOTE)}
      />
    );
  }

  if (!model) {
    return <Panel iconComponent={<CheckSquareOutlined />} title={t(DEFAULT.CUT_CHECK_TITLE)} />;
  }

  const { warnings, isGuess } = model.cutCheck;
  const summaryCounts: CutCheckSummaryCount[] = getCutCheckSummaryCounts(model.cutCheck);
  const warningGroups: CutCheckWarningGroup[] = getCutCheckWarningGroups(warnings);
  const getLayerName = (layerKey: string): string => getLayerNameByKey(layerKey, projectLayers, paletteEntries);
  const isPartListLong: boolean = model.parts.length > PART_LIST_FULL_ROW_LIMIT;
  const guessNoteText: string = [t(DEFAULT.CUT_CHECK_NOTE_GUESS), t(DEFAULT.CUT_CHECK_TEST_SAMPLE_POINTER)]
    .join(NOTE_SENTENCE_SEPARATOR);
  const accuracyNoteText: string = isGuess ? guessNoteText : t(DEFAULT.CUT_CHECK_NOTE_ESTIMATE);
  const shownParts: BurnPart[] = isPartListLong && !isPartListExpanded
    ? model.parts.filter(({ id }: BurnPart): boolean => id === selectedPartId)
    : model.parts;

  const headerActionComponent: ReactNode = (
    <span className={styles.headerActions}>
      <CutCheckWarningCountTag count={warningGroups.length} />
      <IconActionButton
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={t(isExpanded ? DEFAULT.CUT_CHECK_HIDE_DETAILS_LABEL : DEFAULT.CUT_CHECK_SHOW_DETAILS_LABEL)}
        iconComponent={isExpanded ? <UpOutlined /> : <DownOutlined />}
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded(!isExpanded)}
      />
    </span>
  );

  return (
    <Panel
      iconComponent={<CheckSquareOutlined />}
      title={t(DEFAULT.CUT_CHECK_TITLE)}
      headerActionComponent={headerActionComponent}
    >
      {isExpanded && (
        <div id={detailsId} className={styles.cutCheckPanel}>
          <div className={styles.summary}>
            <strong>{t(DEFAULT.CUT_CHECK_PART_COUNT, { count: model.parts.length })}</strong>
            {summaryCounts.map(({ status, count, textKey }: CutCheckSummaryCount) => (
              <Tag key={status} className={styles.countTag}>
                <PartStatusMark
                  status={status}
                  count={count}
                  labelText={t(textKey, { count })}
                  isMuted={!count}
                />
              </Tag>
            ))}
            <Tooltip title={accuracyNoteText}>
              <Tag
                className={styles.accuracyTag}
                icon={<QuestionCircleOutlined aria-hidden />}
                tabIndex={0}
                aria-label={accuracyNoteText}
              >
                {t(isGuess ? DEFAULT.CUT_CHECK_BADGE_GUESS : DEFAULT.CUT_CHECK_BADGE_ESTIMATE)}
              </Tag>
            </Tooltip>
          </div>
          {warningGroups.length > 0 && (
            <ul className={styles.warningList} aria-label={t(DEFAULT.CUT_CHECK_WARNINGS_LABEL)}>
              {warningGroups.map(({ groupKey, warnings: groupWarnings }: CutCheckWarningGroup) => (
                <CutCheckWarningRow
                  key={groupKey}
                  warning={groupWarnings[0]}
                  layerName={getLayerName(groupWarnings[0].layerKey)}
                  partCount={groupWarnings.length}
                />
              ))}
            </ul>
          )}
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
                  <PartStatusMark status={status} labelText={t(PART_STATUS_TEXT_KEYS[status])} />
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
      )}
    </Panel>
  );
};

/**
 * Lifts the part selected in the 3D preview out of the sheet, or says why that part cannot be lifted. Lifting changes
 * nothing in the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Slider, Tag } from 'antd';
import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_TAG_COLOR_WARNING } from '../../../utils/antd.constants';
import {
  BURN_PART_LIFT_MAX_THICKNESSES,
  BURN_PART_LIFT_STEP_MM,
  BURN_PART_STATUS,
} from '../../../utils/burn.model/burn.model.constants';
import { getBurnLiftingPart } from '../../../utils/burn.model/get.burn.lifting.part';
import type { BurnModel } from '../../../utils/burn.model/interfaces/BurnModel';
import type { BurnPart } from '../../../utils/burn.model/interfaces/BurnPart';
import { isBurnPartLiftable } from '../../../utils/burn.model/is.burn.part.liftable';
import { DEFAULT } from '../../../utils/localization/default.locales';
import {
  BurnPartLifted,
  selectBurnPartLiftMm,
  selectCurrentBurnModel,
  selectSelectedBurnPartId,
} from '../../../utils/states/burn.model.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import styles from './styles.module.scss';

const NO_PART_ID = 0;

const LIFT_HINT_KEYS: Record<BurnPart['status'], string> = {
  [BURN_PART_STATUS.FREE]: DEFAULT.BURN_PART_LIFT_HINT_FREE,
  [BURN_PART_STATUS.BORDERLINE]: DEFAULT.BURN_PART_LIFT_HINT_BORDERLINE,
  [BURN_PART_STATUS.NOT_THROUGH]: DEFAULT.BURN_PART_LIFT_HINT_NOT_THROUGH,
};

/** The liftable part a not-through part hangs in, and so rises with; undefined when nothing carries it. */
const getCarryingBurnPart = (part: BurnPart, { parts }: BurnModel): BurnPart | undefined => {
  const partsById: Map<number, BurnPart> = new Map<number, BurnPart>(
    parts.map((modelPart: BurnPart): [number, BurnPart] => [modelPart.id, modelPart]),
  );
  const liftingPart: BurnPart | undefined = getBurnLiftingPart(part, partsById);

  return liftingPart === part ? undefined : liftingPart;
};

export const BurnPartLiftControl = (): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const labelId: string = useId();
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const liftMm: number = useSelector(selectBurnPartLiftMm(selectedPartId ?? NO_PART_ID));
  const part: BurnPart | undefined = model?.parts.find(({ id }: BurnPart): boolean => id === selectedPartId);

  if (!model || !part) {
    return null;
  }

  const carryingPart: BurnPart | undefined = getCarryingBurnPart(part, model);

  return (
    <div className={styles.burnPartLiftControl}>
      <span id={labelId} className={styles.label}>{t(DEFAULT.BURN_PART_LIFT_LABEL)}</span>
      <Slider
        min={0}
        max={model.thicknessMm * BURN_PART_LIFT_MAX_THICKNESSES}
        step={BURN_PART_LIFT_STEP_MM}
        value={liftMm}
        disabled={!isBurnPartLiftable(part)}
        onChange={(nextLiftMm: number) => dispatch(new BurnPartLifted({ partId: part.id, liftMm: nextLiftMm }))}
        ariaLabelledByForHandle={labelId}
      />
      {part.status === BURN_PART_STATUS.BORDERLINE && (
        <Tag className={styles.attachedTag} color={ANTD_TAG_COLOR_WARNING}>
          {t(DEFAULT.BURN_PART_LIFT_MAY_STAY_ATTACHED)}
        </Tag>
      )}
      <span className={styles.hint}>
        {carryingPart
          ? t(DEFAULT.BURN_PART_LIFT_HINT_RISES_WITH_PARENT, { part: part.id, parent: carryingPart.id })
          : t(LIFT_HINT_KEYS[part.status], { part: part.id })}
      </span>
    </div>
  );
};

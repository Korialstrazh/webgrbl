/**
 * Says what the part selected in the 3D preview will do, or why it cannot be lifted, and lets the keyboard lift it as
 * the arrow in the scene does for a pointer. Lifting changes nothing in the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Tag } from 'antd';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_TAG_COLOR_WARNING } from '../../../utils/antd.constants';
import {
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
  selectBurnPartEffectiveLiftMm,
  selectBurnPartLiftMm,
  selectCurrentBurnModel,
  selectSelectedBurnPartId,
} from '../../../utils/states/burn.model.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import styles from './styles.module.scss';

const NO_PART_ID = 0;
const LIFT_RAISE_KEYS: readonly string[] = ['ArrowUp', 'ArrowRight'];
const LIFT_LOWER_KEYS: readonly string[] = ['ArrowDown', 'ArrowLeft'];

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
  const model: BurnModel | undefined = useSelector(selectCurrentBurnModel);
  const selectedPartId: number | undefined = useSelector(selectSelectedBurnPartId);
  const liftMm: number = useSelector(selectBurnPartLiftMm(selectedPartId ?? NO_PART_ID));
  const heightMm: number = useSelector(selectBurnPartEffectiveLiftMm(selectedPartId ?? NO_PART_ID));
  const part: BurnPart | undefined = model?.parts.find(({ id }: BurnPart): boolean => id === selectedPartId);

  if (!model || !part) {
    return null;
  }

  const carryingPart: BurnPart | undefined = getCarryingBurnPart(part, model);

  const isLiftable: boolean = isBurnPartLiftable(part);
  const handleLiftKeyDown = ({ key }: KeyboardEvent<HTMLDivElement>): void => {
    const isRaiseKey: boolean = LIFT_RAISE_KEYS.includes(key);

    if (isLiftable && (isRaiseKey || LIFT_LOWER_KEYS.includes(key))) {
      const stepMm: number = isRaiseKey ? BURN_PART_LIFT_STEP_MM : -BURN_PART_LIFT_STEP_MM;

      dispatch(new BurnPartLifted({ partId: part.id, liftMm: liftMm + stepMm }));
    }
  };

  return (
    <div
      className={styles.burnPartLiftControl}
      role="spinbutton"
      tabIndex={0}
      aria-label={t(DEFAULT.BURN_PART_LIFT_LABEL)}
      aria-valuemin={0}
      aria-valuenow={heightMm}
      aria-disabled={!isLiftable}
      onKeyDown={handleLiftKeyDown}
    >
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

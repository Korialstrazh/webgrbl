/**
 * The bar below the 3D scene: asks for a click before any selection, then says how high the selected part stands and
 * what it will do, or why it cannot be lifted, and lets the keyboard lift it as the arrow in the scene does for a
 * pointer. While any part stands lifted it offers to put all back. Lifting changes nothing in the project.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button } from 'antd';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  BURN_PART_LIFT_DISPLAY_DECIMALS,
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
  BurnPartLiftsReset,
  selectBurnPartEffectiveLiftMm,
  selectBurnPartLiftMm,
  selectCurrentBurnModel,
  selectHasLiftedBurnPart,
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
  const hasLiftedPart: boolean = useSelector(selectHasLiftedBurnPart);
  const part: BurnPart | undefined = model?.parts.find(({ id }: BurnPart): boolean => id === selectedPartId);

  if (!model) {
    return null;
  }

  const putAllBackComponent: ReactNode = hasLiftedPart && (
    <Button className={styles.putAllBack} onClick={() => dispatch(new BurnPartLiftsReset())}>
      {t(DEFAULT.BURN_PART_LIFT_PUT_ALL_BACK)}
    </Button>
  );

  if (!part) {
    return (
      <div className={styles.burnPartLiftControl}>
        <span className={[styles.status, styles.hint].join(' ')}>{t(DEFAULT.BURN_PART_LIFT_CLICK_HINT)}</span>
        {putAllBackComponent}
      </div>
    );
  }

  const carryingPart: BurnPart | undefined = getCarryingBurnPart(part, model);
  const isLiftable: boolean = isBurnPartLiftable(part);
  const isAboveSheet: boolean = heightMm > 0;
  const heightText: string = heightMm.toFixed(BURN_PART_LIFT_DISPLAY_DECIMALS);
  const heightLabel: string = t(DEFAULT.BURN_PART_LIFT_HEIGHT, { height: heightText });
  const handleLiftKeyDown = (keyEvent: KeyboardEvent<HTMLDivElement>): void => {
    const { key } = keyEvent;
    const isRaiseKey: boolean = LIFT_RAISE_KEYS.includes(key);

    if (isLiftable && (isRaiseKey || LIFT_LOWER_KEYS.includes(key))) {
      keyEvent.preventDefault();

      const stepMm: number = isRaiseKey ? BURN_PART_LIFT_STEP_MM : -BURN_PART_LIFT_STEP_MM;

      dispatch(new BurnPartLifted({ partId: part.id, liftMm: liftMm + stepMm }));
    }
  };
  const getHintText = (): string => {
    if (carryingPart) {
      return t(DEFAULT.BURN_PART_LIFT_HINT_RISES_WITH_PARENT, { part: part.id, parent: carryingPart.id });
    }

    return t(LIFT_HINT_KEYS[part.status], { part: part.id });
  };

  return (
    <div className={styles.burnPartLiftControl}>
      <div
        className={styles.status}
        role="spinbutton"
        tabIndex={0}
        aria-label={t(DEFAULT.BURN_PART_LIFT_LABEL)}
        aria-valuemin={0}
        aria-valuenow={Number(heightText)}
        aria-valuetext={isAboveSheet ? heightLabel : t(DEFAULT.BURN_PART_LIFT_NOT_LIFTED)}
        aria-disabled={!isLiftable}
        onKeyDown={handleLiftKeyDown}
      >
        {isAboveSheet && <strong className={styles.height}>{heightLabel}</strong>}
        <span className={styles.hint}>{getHintText()}</span>
        {isLiftable && (
          <span className={styles.keyHint}>{t(DEFAULT.BURN_PART_LIFT_KEY_HINT, { step: BURN_PART_LIFT_STEP_MM })}</span>
        )}
      </div>
      {putAllBackComponent}
    </div>
  );
};

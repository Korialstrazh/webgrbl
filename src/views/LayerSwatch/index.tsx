/**
 * The colour chip of a layer: a flat colour, or a black to white bar for the shading layer. It fills the box its
 * parent gives it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useId } from 'react';
import type { ReactNode } from 'react';
import { SHADING_BAR_DARK_COLOUR, SHADING_BAR_LIGHT_COLOUR } from '../../utils/layers/layer.constants';
import type { LayerSwatchProps } from './interfaces/LayerSwatchProps';
import styles from './styles.module.scss';

const GRADIENT_START_OFFSET = '0%';
const GRADIENT_END_OFFSET = '100%';
const FULL_SIZE = '100%';

export const LayerSwatch = ({ colour, isShading }: LayerSwatchProps): ReactNode => {
  const gradientId: string = useId();
  const fillPaint: string = isShading ? `url(#${gradientId})` : colour;

  return (
    <svg
      className={styles.swatch}
      width={FULL_SIZE}
      height={FULL_SIZE}
      aria-hidden="true"
    >
      {isShading && (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset={GRADIENT_START_OFFSET} stopColor={SHADING_BAR_DARK_COLOUR} />
            <stop offset={GRADIENT_END_OFFSET} stopColor={SHADING_BAR_LIGHT_COLOUR} />
          </linearGradient>
        </defs>
      )}
      <rect width={FULL_SIZE} height={FULL_SIZE} fill={fillPaint} />
    </svg>
  );
};

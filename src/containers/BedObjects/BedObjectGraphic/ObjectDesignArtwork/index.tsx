/**
 * An object artwork drawn the way its layers burn it: the paths of a Line layer as thin outlines in the layer colour
 * with no fill, the paths of a fill or shading layer filled as drawn, gradients included, and the paths of an off layer
 * dimmed. Each run of paths of one layer is one group, so a layer change restyles groups through their class and stroke
 * attribute; the paths themselves never change. It renders again only when the drawing or the layers change, not while
 * the object is dragged.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Fragment, memo, useId } from 'react';
import type { ReactNode } from 'react';
import { DESIGN_PAINT_ROLE } from '../../../../utils/bed/bed.design.constants';
import type { DesignLayerLook } from '../../../../utils/bed/interfaces/DesignLayerLook';
import type { ObjectDesignGradient } from '../../../../utils/bed/interfaces/ObjectDesignGradient';
import type { ObjectDesignPaint } from '../../../../utils/bed/interfaces/ObjectDesignPaint';
import type { ObjectDesignPaintRun } from '../../../../utils/bed/interfaces/ObjectDesignPaintRun';
import { LAYER_MODE } from '../../../../utils/palette/palette.constants';
import type { SvgGradientStop } from '../../../../utils/svg/geometry/interfaces/SvgGradientStop';
import {
  SVG_GRADIENT_KIND,
  SVG_GRADIENT_UNITS,
  SVG_PAINT_NONE,
} from '../../../../utils/svg/geometry/svg.geometry.constants';
import type { ObjectDesignArtworkProps } from './interfaces/ObjectDesignArtworkProps';
import styles from './styles.module.scss';

// React's ids may hold characters that a url(#id) reference would have to escape.
const NON_ID_CHARACTERS_PATTERN = /[^a-zA-Z0-9]/g;

/** A run on no layer yet, such as before the layers are read, keeps its drawn look and needs no class. */
const getRunClassName = (layerLook: DesignLayerLook | undefined): string | undefined => {
  const runClassNames: (string | undefined)[] = [];

  if (layerLook?.mode === LAYER_MODE.LINE) {
    runClassNames.push(styles.lineRun);
  }

  if (layerLook && !layerLook.isEnabled) {
    runClassNames.push(styles.offRun);
  }

  return runClassNames.length ? runClassNames.join(' ') : undefined;
};

const renderGradientStops = (stops: SvgGradientStop[]): ReactNode =>
  stops.map((stop: SvgGradientStop, stopIndex: number) => (
    <stop key={stopIndex} offset={stop.offset} stopColor={stop.colour} stopOpacity={stop.opacity} />
  ));

// The artwork matrix already holds the gradient's own units, so the numbers always count as user space here.
const renderDesignGradient = ({ definition, artworkMatrix }: ObjectDesignGradient, gradientId: string): ReactNode => {
  const { a, b, c, d, e, f } = artworkMatrix;
  const gradientTransform: string = `matrix(${[a, b, c, d, e, f].join(' ')})`;

  return definition.kind === SVG_GRADIENT_KIND.RADIAL
    ? (
      <radialGradient
        id={gradientId}
        gradientUnits={SVG_GRADIENT_UNITS.USER_SPACE_ON_USE}
        gradientTransform={gradientTransform}
        cx={definition.cx}
        cy={definition.cy}
        r={definition.r}
      >
        {renderGradientStops(definition.stops)}
      </radialGradient>
    )
    : (
      <linearGradient
        id={gradientId}
        gradientUnits={SVG_GRADIENT_UNITS.USER_SPACE_ON_USE}
        gradientTransform={gradientTransform}
        x1={definition.x1}
        y1={definition.y1}
        x2={definition.x2}
        y2={definition.y2}
      >
        {renderGradientStops(definition.stops)}
      </linearGradient>
    );
};

const renderDesignPath = (paint: ObjectDesignPaint, paintKey: string): ReactNode => {
  const paintValue: string = paint.gradient ? `url(#${paintKey})` : paint.colour;

  return (
    <Fragment key={paintKey}>
      {paint.gradient && renderDesignGradient(paint.gradient, paintKey)}
      {paint.role === DESIGN_PAINT_ROLE.FILL
        ? (
          <path
            d={paint.pathData}
            fill={paintValue}
            fillOpacity={paint.opacity}
            fillRule={paint.fillRule}
            stroke={SVG_PAINT_NONE}
          />
        )
        : (
          <path
            d={paint.pathData}
            fill={SVG_PAINT_NONE}
            stroke={paintValue}
            strokeOpacity={paint.opacity}
            strokeWidth={paint.strokeWidthMm}
          />
        )}
    </Fragment>
  );
};

const ObjectDesignArtworkContent = ({ designDrawing, layerLooks }: ObjectDesignArtworkProps): ReactNode => {
  // Each object needs its own ids: one document holds them all, and samples repeat the same artwork.
  const artworkId: string = useId().replace(NON_ID_CHARACTERS_PATTERN, '');

  return (
    <g className={styles.objectDesignArtwork}>
      {designDrawing.runs.map((run: ObjectDesignPaintRun, runIndex: number) => {
        const layerLook: DesignLayerLook | undefined = layerLooks.get(run.layerKey);

        return (
          <g
            key={run.runKey}
            className={getRunClassName(layerLook)}
            data-layer-mode={layerLook?.mode ?? LAYER_MODE.FILL}
            data-layer-enabled={layerLook?.isEnabled ?? true}
            // The outline colour of a Line layer; its paths take it through the stylesheet.
            stroke={layerLook?.colour}
          >
            {run.paints.map((paint: ObjectDesignPaint, paintIndex: number) =>
              renderDesignPath(paint, `design-gradient-${artworkId}-${runIndex}-${paintIndex}`))}
          </g>
        );
      })}
    </g>
  );
};

export const ObjectDesignArtwork = memo(ObjectDesignArtworkContent);

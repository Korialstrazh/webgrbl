/**
 * An object artwork drawn the way its layers burn it: the paths of a Line layer as thin outlines in the layer colour
 * with no fill, the paths of a fill or shading layer filled as drawn, and the paths of an off layer dimmed. Each run of
 * paths of one layer is one group, so a layer change restyles groups through their class and stroke attribute; the
 * paths themselves never change. It renders again only when the drawing or the layers change, not while the object is
 * dragged.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { memo } from 'react';
import type { ReactNode } from 'react';
import { DESIGN_PAINT_ROLE } from '../../../../utils/bed/bed.design.constants';
import type { DesignLayerLook } from '../../../../utils/bed/interfaces/DesignLayerLook';
import type { ObjectDesignPaint } from '../../../../utils/bed/interfaces/ObjectDesignPaint';
import type { ObjectDesignPaintRun } from '../../../../utils/bed/interfaces/ObjectDesignPaintRun';
import { LAYER_MODE } from '../../../../utils/palette/palette.constants';
import { SVG_PAINT_NONE } from '../../../../utils/svg/geometry/svg.geometry.constants';
import type { ObjectDesignArtworkProps } from './interfaces/ObjectDesignArtworkProps';
import styles from './styles.module.scss';

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

const renderDesignPath = (paint: ObjectDesignPaint, paintIndex: number): ReactNode => (
  paint.role === DESIGN_PAINT_ROLE.FILL
    ? (
      <path
        key={paintIndex}
        d={paint.pathData}
        fill={paint.colour}
        fillOpacity={paint.opacity}
        fillRule={paint.fillRule}
        stroke={SVG_PAINT_NONE}
      />
    )
    : (
      <path
        key={paintIndex}
        d={paint.pathData}
        fill={SVG_PAINT_NONE}
        stroke={paint.colour}
        strokeOpacity={paint.opacity}
        strokeWidth={paint.strokeWidthMm}
      />
    ));

const ObjectDesignArtworkContent = ({ designDrawing, layerLooks }: ObjectDesignArtworkProps): ReactNode => (
  <g className={styles.objectDesignArtwork}>
    {designDrawing.runs.map((run: ObjectDesignPaintRun) => {
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
          {run.paints.map(renderDesignPath)}
        </g>
      );
    })}
  </g>
);

export const ObjectDesignArtwork = memo(ObjectDesignArtworkContent);

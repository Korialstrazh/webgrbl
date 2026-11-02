/**
 * Keyboard handles for the bars of an antd Splitter, whose own bars cannot take the focus. Each handle sits over its
 * bar as a focusable separator that names the panel it resizes and reports the bar position in percent; the arrow keys
 * move the bar one step, Home and End to the ends of its range. The handles let the pointer through, so dragging still
 * goes to the antd bars underneath.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { getMovedSplitterSizes } from '../../utils/layout/get.moved.splitter.sizes';
import { getSplitterBarRange } from '../../utils/layout/get.splitter.bar.range';
import { getSplitterKeyTargetPercent } from '../../utils/layout/get.splitter.key.target.percent';
import type { SplitterBarRange } from '../../utils/layout/interfaces/SplitterBarRange';
import { getPercentText } from '../../utils/layout/get.percent.text';
import { ARIA_ORIENTATION } from '../../utils/aria.constants';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import type { SplitterHandlesProps } from './interfaces/SplitterHandlesProps';
import styles from './styles.module.scss';

/** The position of a handle along the splitter; it follows the bar at run time. */
const getHandleStyle = (isVertical: boolean, positionPercent: number): CSSProperties =>
  (isVertical ? { top: getPercentText(positionPercent) } : { left: getPercentText(positionPercent) });

export const SplitterHandles = (props: SplitterHandlesProps): ReactNode => {
  const { sizePercents, limits, isVertical, stepPercent, barLabels, onSizesChange } = props;

  const handleBarKeyDown = (keyboardEvent: KeyboardEvent<HTMLDivElement>, barIndex: number): void => {
    const barRange: SplitterBarRange = getSplitterBarRange(sizePercents, limits, barIndex);
    const targetPercent: number | undefined = getSplitterKeyTargetPercent(
      { key: keyboardEvent.key, isVertical, stepPercent },
      barRange,
    );

    // eslint-disable-next-line no-restricted-syntax -- 0 % is a real bar position, unlike a key that does nothing
    if (targetPercent === undefined) {
      return;
    }

    keyboardEvent.preventDefault();
    onSizesChange(getMovedSplitterSizes({ sizePercents, limits, barIndex, targetPercent }));
  };

  return (
    // Plain elements: antd has no focusable separator, and the layer only positions the handles over the bars.
    <div className={isVertical ? [styles.splitterHandles, styles.vertical].join(' ') : styles.splitterHandles}>
      {barLabels.map((barLabel: string, barIndex: number) => {
        const barRange: SplitterBarRange = getSplitterBarRange(sizePercents, limits, barIndex);

        return (
          <div
            key={barLabel}
            className={styles.handle}
            role="separator"
            tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}
            aria-label={barLabel}
            aria-orientation={isVertical ? ARIA_ORIENTATION.HORIZONTAL : ARIA_ORIENTATION.VERTICAL}
            aria-valuenow={Math.round(barRange.positionPercent)}
            aria-valuemin={Math.round(barRange.minPercent)}
            aria-valuemax={Math.round(barRange.maxPercent)}
            // eslint-disable-next-line no-restricted-syntax -- the bar position changes at run time
            style={getHandleStyle(isVertical, barRange.positionPercent)}
            onKeyDown={(keyboardEvent: KeyboardEvent<HTMLDivElement>) => handleBarKeyDown(keyboardEvent, barIndex)}
          />
        );
      })}
    </div>
  );
};

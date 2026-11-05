/**
 * A one-line layer summary whose parts are kept whole: a narrow row wraps only at the separators, never between a
 * value and its unit. The title shows the whole summary. With icons, each
 * part leads with its icon and no separator is drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { MIDDLE_DOT } from '../../utils/characters.constants';
import type { LayerSummaryTextProps } from './interfaces/LayerSummaryTextProps';
import styles from './styles.module.scss';

// The spaces around the dot are the only places the summary may wrap.
const SUMMARY_PART_SEPARATOR: string = ` ${MIDDLE_DOT} `;

export const LayerSummaryText = ({ parts, iconComponents, className }: LayerSummaryTextProps): ReactNode => {
  const summaryText: string = parts.join(SUMMARY_PART_SEPARATOR);

  if (iconComponents) {
    return (
      <span className={[className, styles.iconSummary].join(' ')} title={summaryText}>
        {parts.map((part: string, partIndex: number) => (
          <span key={part} className={styles.iconPart}>
            <span className={styles.partIcon} aria-hidden>{iconComponents[partIndex]}</span>
            {part}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className} title={summaryText}>
      {parts.map((part: string, partIndex: number) => (
        <Fragment key={part}>
          {partIndex ? SUMMARY_PART_SEPARATOR : undefined}
          <span className={styles.summaryPart}>{part}</span>
        </Fragment>
      ))}
    </span>
  );
};

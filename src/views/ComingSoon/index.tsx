/**
 * Wraps a feature that is not built yet: shows it but makes it inert, with a visible badge and description.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useTranslation } from 'react-i18next';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { DEFAULT } from '../../utils/localization/default.locales';
import styles from './styles.module.scss';

interface ComingSoonProps {
  /** What the feature will do, shown next to the badge. */
  description: string;
  children: ReactNode;
}

// jsdom does not enforce `inert`, so the wrapper also stops these events itself.
const stopBlockedEvent = (event: MouseEvent | KeyboardEvent): void => {
  event.stopPropagation();
  event.preventDefault();
};

export const ComingSoon = ({ description, children }: ComingSoonProps): ReactNode => {
  const { t } = useTranslation();

  return (
    <div className={styles.comingSoon}>
      <p className={styles.notice}>
        <span className={styles.badge}>{t(DEFAULT.COMING_SOON)}</span>
        <span className={styles.description}>{description}</span>
      </p>
      <div
        className={styles.disabled}
        inert
        aria-disabled="true"
        onClickCapture={stopBlockedEvent}
        onKeyDownCapture={stopBlockedEvent}
        onKeyUpCapture={stopBlockedEvent}
      >
        {children}
      </div>
    </div>
  );
};

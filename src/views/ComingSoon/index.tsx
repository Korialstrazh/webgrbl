/**
 * Wraps a feature that is not built yet: shows it, slightly dimmed and inert, with a small neutral "Soon" tag beside
 * it. What the feature will do appears in a tooltip on hover, or when the tag takes the keyboard focus, so the notice
 * never adds a line to a bar; screen readers get it as hidden text.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Tag, Tooltip } from 'antd';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_TAG_VARIANT_FILLED, ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { KEYBOARD_FOCUSABLE_TAB_INDEX } from '../../utils/tab.index.constants';
import styles from './styles.module.scss';

interface ComingSoonProps {
  /** What the feature will do, shown in the tooltip of the tag. */
  description: string;
  children: ReactNode;
}

// jsdom does not enforce `inert`, so the wrapper also stops these events itself.
const stopBlockedEvent = (blockedEvent: MouseEvent | KeyboardEvent): void => {
  blockedEvent.stopPropagation();
  blockedEvent.preventDefault();
};

export const ComingSoon = ({ description, children }: ComingSoonProps): ReactNode => {
  const { t } = useTranslation();

  return (
    // The tooltip sits on the outer wrapper: the inert content takes no pointer events, so a hover over it reaches
    // the wrapper and still shows the description.
    <Tooltip title={description} trigger={ANTD_TOOLTIP_TRIGGER_HOVER_AND_FOCUS}>
      <div className={styles.comingSoon}>
        <div
          className={styles.content}
          inert
          aria-disabled="true"
          onClickCapture={stopBlockedEvent}
          onKeyDownCapture={stopBlockedEvent}
          onKeyUpCapture={stopBlockedEvent}
        >
          {children}
        </div>
        <Tag className={styles.soonTag} variant={ANTD_TAG_VARIANT_FILLED} tabIndex={KEYBOARD_FOCUSABLE_TAB_INDEX}>
          {t(DEFAULT.COMING_SOON)}
          <span className={styles.description}>{description}</span>
        </Tag>
      </div>
    </Tooltip>
  );
};

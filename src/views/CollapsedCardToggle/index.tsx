/**
 * The heading-line toggle of a machine card that cannot act while no laser is connected: a short hint, such as
 * a plug badge with the reason in its tooltip, and a chevron that opens the card anyway, disabled, for a user who
 * wants to see it first.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { IconActionButton } from '../IconActionButton';
import { PlugBadge } from '../PlugBadge';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../utils/antd.constants';
import type { CollapsedCardToggleProps } from './interfaces/CollapsedCardToggleProps';
import styles from './styles.module.scss';

export const CollapsedCardToggle = (props: CollapsedCardToggleProps): ReactNode => {
  const { isCollapsed, hintText, controlsId, toggleLabel, onToggle } = props;

  return (
    <span className={styles.collapsedSummary}>
      {/* Kept while the card is open, so the disabled controls below it still say why they are disabled. */}
      <PlugBadge reasonText={hintText} />
      <IconActionButton
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={toggleLabel}
        iconComponent={isCollapsed ? <DownOutlined /> : <UpOutlined />}
        aria-expanded={!isCollapsed}
        aria-controls={controlsId}
        onClick={onToggle}
      />
    </span>
  );
};

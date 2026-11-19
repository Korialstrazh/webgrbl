/**
 * The heading-line toggle of a machine card that cannot act while no laser is connected: a short hint, such as
 * a plug badge with the reason in its tooltip, and a chevron that opens the card anyway, disabled, for a user who
 * wants to see it first. Every part is antd: the plug is a Button or badge under a Tooltip, the chevron an icon Button,
 * and the two sit in a Flex row.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { ReactNode } from 'react';
import { IconActionButton } from '../IconActionButton';
import { PlugBadge } from '../PlugBadge';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_FLEX_ALIGN_CENTER,
  ANTD_FLEX_COMPONENT_SPAN,
  ANTD_FLEX_GAP_SMALL,
} from '../../utils/antd.constants';
import type { CollapsedCardToggleProps } from './interfaces/CollapsedCardToggleProps';
import styles from './styles.module.scss';

export const CollapsedCardToggle = (props: CollapsedCardToggleProps): ReactNode => {
  const { isCollapsed, hintText, controlsId, toggleLabel, onToggle, onPlugClick } = props;

  return (
    <Flex
      component={ANTD_FLEX_COMPONENT_SPAN}
      align={ANTD_FLEX_ALIGN_CENTER}
      gap={ANTD_FLEX_GAP_SMALL}
      className={styles.collapsedSummary}
    >
      {/* Kept while the card is open, so the disabled controls below it still say why they are disabled. */}
      <PlugBadge reasonText={hintText} onClick={onPlugClick} />
      <IconActionButton
        type={ANTD_BUTTON_TYPE_TEXT}
        size={ANTD_BUTTON_SIZE_SMALL}
        labelText={toggleLabel}
        iconComponent={isCollapsed ? <DownOutlined /> : <UpOutlined />}
        aria-expanded={!isCollapsed}
        aria-controls={controlsId}
        onClick={onToggle}
      />
    </Flex>
  );
};

/**
 * The toolbar above the material library list: the search and the "Only for this machine" filter on one line, under
 * it the chips that name the material the list is kept to (with the one way to see every material again) and the
 * layer the rows apply to, and then Add preset and New material, side by side as both add to the library.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { AppstoreAddOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Tag } from 'antd';
import type { CheckboxChangeEvent } from 'antd';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MaterialLibraryFiltersProps } from '../interfaces/MaterialLibraryFiltersProps';
import styles from './styles.module.scss';

const SEARCH_INPUT_TYPE = 'search';

export const MaterialLibraryFilters = (props: MaterialLibraryFiltersProps): ReactNode => {
  const {
    searchText, isOnlyActiveMachine, hasActiveMachine, filteredMaterial, targetLayerName, isAddAllowed,
    onSearch, onOnlyActiveMachineChange, onClearMaterialFilter, onAdd, onNewMaterial,
  } = props;
  const { t } = useTranslation();
  const hasChips: boolean = Boolean(filteredMaterial || targetLayerName);

  return (
    <>
      <div className={styles.filters}>
        <Input
          className={styles.searchInput}
          type={SEARCH_INPUT_TYPE}
          prefix={<SearchOutlined aria-hidden />}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_SEARCH)}
          placeholder={t(DEFAULT.MATERIAL_LIBRARY_SEARCH)}
          value={searchText}
          onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => onSearch(changeEvent.target.value)}
        />
        <Checkbox
          className={styles.machineFilter}
          checked={isOnlyActiveMachine}
          disabled={!hasActiveMachine}
          onChange={(changeEvent: CheckboxChangeEvent) => onOnlyActiveMachineChange(changeEvent.target.checked)}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_ONLY_THIS_MACHINE)}
        </Checkbox>
      </div>
      {hasChips && (
        <div className={styles.filterChips}>
          {filteredMaterial && (
            <Tag
              className={styles.filterChip}
              closable={{ 'aria-label': t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_FILTER_CLEAR) }}
              onClose={onClearMaterialFilter}
            >
              {t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_FILTER, {
                name: filteredMaterial.name,
                thickness: filteredMaterial.thicknessMm,
              })}
            </Tag>
          )}
          {targetLayerName && (
            <Tag className={[styles.filterChip, styles.layerChip].join(' ')}>
              {t(DEFAULT.MATERIAL_LIBRARY_LAYER_TARGET, { layer: targetLayerName })}
            </Tag>
          )}
        </div>
      )}
      <div className={styles.addActions}>
        {/* The icons carry labels of their own, so each button names itself to keep its name to its text. */}
        <Button
          icon={<PlusOutlined />}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_ADD)}
          disabled={!isAddAllowed}
          onClick={onAdd}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_ADD)}
        </Button>
        <Button
          icon={<AppstoreAddOutlined />}
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_NEW_MATERIAL)}
          onClick={onNewMaterial}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_NEW_MATERIAL)}
        </Button>
      </div>
    </>
  );
};

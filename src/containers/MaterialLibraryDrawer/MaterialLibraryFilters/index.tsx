/**
 * The toolbar above the material library list: the search and the "Only for this machine" filter on one line, under
 * it the chips that name the material the list is kept to (with the one way to see every material again) and the
 * layer the rows apply to, and then Add preset, shown once it can be used, and New material, which the empty list
 * offers itself until a material exists.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { AppstoreAddOutlined, EditOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Tag } from 'antd';
import type { CheckboxChangeEvent } from 'antd';
import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_SIZE_SMALL, ANTD_BUTTON_TYPE_TEXT } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { IconActionButton } from '../../../views/IconActionButton';
import { MaterialDialog } from '../../MaterialDialog';
import type { MaterialLibraryFiltersProps } from '../interfaces/MaterialLibraryFiltersProps';
import styles from './styles.module.scss';

const SEARCH_INPUT_TYPE = 'search';

export const MaterialLibraryFilters = (props: MaterialLibraryFiltersProps): ReactNode => {
  const {
    searchText, isOnlyActiveMachine, hasActiveMachine, hasMaterials, filteredMaterial, targetLayerName,
    isAddAllowed, onSearch, onOnlyActiveMachineChange, onClearMaterialFilter, onAdd, onNewMaterial,
  } = props;
  const { t } = useTranslation();
  const hasChips: boolean = Boolean(filteredMaterial || targetLayerName);
  // The pencil beside the material chip edits that material in place, in the Add material form.
  const [isMaterialEditOpen, setIsMaterialEditOpen] = useState<boolean>(false);

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
              className={[styles.filterChip, styles.materialFilterChip].join(' ')}
              icon={<FilterOutlined aria-hidden />}
              closable={{ 'aria-label': t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_FILTER_CLEAR) }}
              onClose={onClearMaterialFilter}
            >
              {t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_FILTER, {
                name: filteredMaterial.name,
                thickness: filteredMaterial.thicknessMm,
              })}
            </Tag>
          )}
          {filteredMaterial && (
            <IconActionButton
              type={ANTD_BUTTON_TYPE_TEXT}
              size={ANTD_BUTTON_SIZE_SMALL}
              labelText={t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_EDIT, { name: filteredMaterial.name })}
              iconComponent={<EditOutlined />}
              onClick={() => setIsMaterialEditOpen(true)}
            />
          )}
          {targetLayerName && (
            <Tag className={[styles.filterChip, styles.layerChip].join(' ')}>
              {t(DEFAULT.MATERIAL_LIBRARY_LAYER_TARGET, { layer: targetLayerName })}
            </Tag>
          )}
        </div>
      )}
      {hasMaterials && (
        <div className={styles.addActions}>
          {/* The icons carry labels of their own, so each button names itself to keep its name to its text. */}
          {isAddAllowed && (
            <Button icon={<PlusOutlined />} aria-label={t(DEFAULT.MATERIAL_LIBRARY_ADD)} onClick={onAdd}>
              {t(DEFAULT.MATERIAL_LIBRARY_ADD)}
            </Button>
          )}
          <Button
            icon={<AppstoreAddOutlined />}
            aria-label={t(DEFAULT.MATERIAL_LIBRARY_NEW_MATERIAL)}
            onClick={onNewMaterial}
          >
            {t(DEFAULT.MATERIAL_LIBRARY_NEW_MATERIAL)}
          </Button>
        </div>
      )}
      <MaterialDialog
        isOpen={isMaterialEditOpen && Boolean(filteredMaterial)}
        editedMaterial={filteredMaterial}
        onClose={() => setIsMaterialEditOpen(false)}
      />
    </>
  );
};

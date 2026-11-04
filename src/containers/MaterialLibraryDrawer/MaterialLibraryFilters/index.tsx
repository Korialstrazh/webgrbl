/**
 * The toolbar above the material library table: the search, the "Only for this machine" filter and Add preset on one
 * line, and under it a chip that names the material the list is kept to, with the one way to see every material again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Tag } from 'antd';
import type { CheckboxChangeEvent } from 'antd';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ANTD_BUTTON_TYPE_DEFAULT, ANTD_BUTTON_TYPE_PRIMARY } from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import type { MaterialLibraryFiltersProps } from '../interfaces/MaterialLibraryFiltersProps';
import styles from './styles.module.scss';

const SEARCH_INPUT_TYPE = 'search';

export const MaterialLibraryFilters = (props: MaterialLibraryFiltersProps): ReactNode => {
  const {
    searchText, isOnlyActiveMachine, hasActiveMachine, filteredMaterial, isAddAllowed, isAddMainAction,
    onSearch, onOnlyActiveMachineChange, onClearMaterialFilter, onAdd,
  } = props;
  const { t } = useTranslation();

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
          checked={isOnlyActiveMachine}
          disabled={!hasActiveMachine}
          onChange={(changeEvent: CheckboxChangeEvent) => onOnlyActiveMachineChange(changeEvent.target.checked)}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_ONLY_THIS_MACHINE)}
        </Checkbox>
        <Button
          className={styles.addButton}
          type={isAddMainAction ? ANTD_BUTTON_TYPE_PRIMARY : ANTD_BUTTON_TYPE_DEFAULT}
          icon={<PlusOutlined />}
          // The icon carries a label of its own, so the button names itself to keep its accessible name to its text.
          aria-label={t(DEFAULT.MATERIAL_LIBRARY_ADD)}
          disabled={!isAddAllowed}
          onClick={onAdd}
        >
          {t(DEFAULT.MATERIAL_LIBRARY_ADD)}
        </Button>
      </div>
      {filteredMaterial && (
        <div className={styles.filterChips}>
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
        </div>
      )}
    </>
  );
};

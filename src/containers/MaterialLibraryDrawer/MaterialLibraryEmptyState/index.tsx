/**
 * What the material library list shows without rows: why there are none, and the one thing to do about it. With no
 * material there is a New material button right here, as a preset needs one; without an active machine it points
 * at Machine profiles in the top bar and offers to get out of the way.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { EmptyState } from '../../../views/EmptyState';
import { MaterialSheetIcon } from '../../../views/MaterialSheetIcon';
import type { MaterialLibraryEmptyStateProps } from '../interfaces/MaterialLibraryEmptyStateProps';

export const MaterialLibraryEmptyState = (props: MaterialLibraryEmptyStateProps): ReactNode => {
  const {
    hasMaterials, hasActiveMachine, searchText, filteredMaterial, onClearSearch, onClearMaterialFilter,
    onNewMaterial, onClose,
  } = props;
  const { t } = useTranslation();

  if (!hasMaterials) {
    return (
      <EmptyState
        iconComponent={<MaterialSheetIcon />}
        titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_NO_MATERIALS_TITLE)}
        bodyText={t(DEFAULT.MATERIAL_LIBRARY_NO_MATERIALS)}
        actionLabel={t(DEFAULT.MATERIAL_LIBRARY_NEW_MATERIAL)}
        onAction={onNewMaterial}
      />
    );
  }

  if (!hasActiveMachine) {
    return (
      <EmptyState
        iconComponent={<MaterialSheetIcon />}
        titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_NO_MACHINE_TITLE)}
        bodyText={t(DEFAULT.MATERIAL_LIBRARY_NO_ACTIVE_MACHINE)}
        actionLabel={t(DEFAULT.MATERIAL_LIBRARY_CLOSE)}
        onAction={onClose}
      />
    );
  }

  if (searchText.trim()) {
    return (
      <EmptyState
        iconComponent={<SearchOutlined />}
        titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_SEARCH_TITLE, { search: searchText.trim() })}
        bodyText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_SEARCH_TEXT)}
        actionLabel={t(DEFAULT.MATERIAL_LIBRARY_CLEAR_SEARCH)}
        onAction={onClearSearch}
      />
    );
  }

  if (filteredMaterial) {
    return (
      <EmptyState
        iconComponent={<FilterOutlined />}
        titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_MATERIAL_TITLE, {
          name: filteredMaterial.name,
          thickness: filteredMaterial.thicknessMm,
        })}
        bodyText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_MATERIAL_TEXT)}
        actionLabel={t(DEFAULT.MATERIAL_LIBRARY_MATERIAL_FILTER_CLEAR)}
        onAction={onClearMaterialFilter}
      />
    );
  }

  return (
    <EmptyState
      iconComponent={<MaterialSheetIcon />}
      titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_TITLE)}
      bodyText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_TEXT)}
    />
  );
};

/**
 * What the material library table shows without rows: why there are none, and the one thing to do about it. The
 * drawer leaves the Material panel and the top bar in view, so it points at them and offers to get out of the way.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BookOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { EmptyState } from '../../../views/EmptyState';
import type { MaterialLibraryEmptyStateProps } from '../interfaces/MaterialLibraryEmptyStateProps';

export const MaterialLibraryEmptyState = (props: MaterialLibraryEmptyStateProps): ReactNode => {
  const {
    hasMaterials, hasActiveMachine, searchText, filteredMaterial, onClearSearch, onClearMaterialFilter, onClose,
  } = props;
  const { t } = useTranslation();

  if (!hasMaterials) {
    return (
      <EmptyState
        iconComponent={<BookOutlined />}
        titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_NO_MATERIALS_TITLE)}
        bodyText={t(DEFAULT.MATERIAL_LIBRARY_NO_MATERIALS)}
        actionLabel={t(DEFAULT.MATERIAL_LIBRARY_CLOSE)}
        onAction={onClose}
      />
    );
  }

  if (!hasActiveMachine) {
    return (
      <EmptyState
        iconComponent={<BookOutlined />}
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
      iconComponent={<BookOutlined />}
      titleText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_TITLE)}
      bodyText={t(DEFAULT.MATERIAL_LIBRARY_EMPTY_TEXT)}
    />
  );
};

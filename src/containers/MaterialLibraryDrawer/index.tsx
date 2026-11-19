/**
 * The material library: saved laser settings per material and machine. It opens as a drawer at the left edge of the
 * bed region, directly beside the Material panel it belongs to, so the design panel, the machine panel and STOP stay
 * in view and usable while it is open. The header holds the file actions; the ticks they export live here, beside
 * the editor that sets them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { useState } from 'react';
import type { Key, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ANTD_DRAWER_PLACEMENT_LEFT } from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MaterialPreset } from '../../utils/materials/interfaces/MaterialPreset';
import { selectMaterialPresets } from '../../utils/states/material.preset.state';
import { BedRegionDrawer } from '../BedRegionDrawer';
import type { MaterialLibraryDrawerProps } from './interfaces/MaterialLibraryDrawerProps';
import { MATERIAL_LIBRARY_DRAWER_OVERLAY_ID, MATERIAL_LIBRARY_DRAWER_WIDTH } from './material.library.drawer.constants';
import { MaterialLibraryEditor } from './MaterialLibraryEditor';
import { PresetFileActions } from './PresetFileActions';
import styles from './styles.module.scss';

export const MaterialLibraryDrawer = (props: MaterialLibraryDrawerProps): ReactNode => {
  const { isOpen, onClose, initialLayerKey, initialMaterialId } = props;
  const { t } = useTranslation();
  const presets: MaterialPreset[] = useSelector(selectMaterialPresets);
  const [tickedPresetIds, setTickedPresetIds] = useState<Key[]>([]);
  // Looked up in the stored list, so that a deleted preset is never exported.
  const tickedPresets: MaterialPreset[] =
    presets.filter(({ id }: MaterialPreset): boolean => tickedPresetIds.includes(id));

  const closeLibrary = (): void => {
    setTickedPresetIds([]);
    onClose();
  };

  return (
    <BedRegionDrawer
      isOpen={isOpen}
      overlayIdPrefix={MATERIAL_LIBRARY_DRAWER_OVERLAY_ID}
      title={t(DEFAULT.MATERIAL_LIBRARY_TITLE)}
      placement={ANTD_DRAWER_PLACEMENT_LEFT}
      size={MATERIAL_LIBRARY_DRAWER_WIDTH}
      extra={<PresetFileActions selectedPresets={tickedPresets} />}
      destroyOnHidden
      onClose={closeLibrary}
    >
      <div className={styles.libraryBody}>
        <MaterialLibraryEditor
          initialLayerKey={initialLayerKey}
          initialMaterialId={initialMaterialId}
          tickedPresetIds={tickedPresetIds}
          onTick={setTickedPresetIds}
          onClose={closeLibrary}
        />
      </div>
    </BedRegionDrawer>
  );
};

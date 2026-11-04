/**
 * The preset buttons of the layer settings drawer: Save as material preset stores the layer for the project material
 * and the active machine, and Use a material preset opens the library for this layer. When a preset for the same
 * material, operation and machine exists, saving asks whether to update it or add a new one, so a second click never
 * leaves two rows that look the same.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BookOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ANTD_BUTTON_TYPE_DEFAULT } from '../../../utils/antd.constants';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getLayerPresetOperation } from '../../../utils/materials/get.layer.preset.operation';
import { getMatchingMaterialPreset } from '../../../utils/materials/get.matching.material.preset';
import type { Material } from '../../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import { newMaterialPresetFromLayer } from '../../../utils/materials/new.material.preset.from.layer';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile } from '../../../utils/states/machine.profile.state';
import { MaterialPresetSaved, selectMaterialPresets } from '../../../utils/states/material.preset.state';
import { selectActiveMaterial } from '../../../utils/states/material.selectors';
import type { AppDispatch } from '../../../utils/states/new.store';
import { MaterialLibraryDialog } from '../../MaterialLibraryDialog';
import { MATERIAL_PRESET_OPERATION_LABEL_KEY } from '../../MaterialLibraryDialog/material.library.dialog.constants';
import type { LayerPresetButtonsProps } from '../interfaces/LayerPresetButtonsProps';
import styles from './styles.module.scss';

/** The words of the messages that name a preset: its material, thickness, operation and machine. */
type PresetNameParameters = Record<'name' | 'thickness' | 'operation' | 'machine', string | number>;

export const LayerPresetButtons = ({ layer }: LayerPresetButtonsProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const machineProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const presets: MaterialPreset[] = useSelector(selectMaterialPresets);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isUpdateAsked, setIsUpdateAsked] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string | undefined>(undefined);
  const layerKey: string = getLayerKey(layer);
  // A preset at 0 W could never be saved again in the library, so it is not offered.
  const isSaveAllowed: boolean = Boolean(activeMaterial && machineProfile && layer.settings.maxPowerPercent);
  const matchingPreset: MaterialPreset | undefined = activeMaterial && machineProfile
    ? getMatchingMaterialPreset(presets, {
      materialId: activeMaterial.id,
      machineProfileId: machineProfile.id,
      operation: getLayerPresetOperation(layer),
    })
    : undefined;

  const getPresetNameParameters = (material: Material, profile: MachineProfile): PresetNameParameters => ({
    name: material.name,
    thickness: material.thicknessMm,
    operation: t(MATERIAL_PRESET_OPERATION_LABEL_KEY[getLayerPresetOperation(layer)]),
    machine: profile.name,
  });

  const savePreset = (storedPreset: MaterialPreset | undefined): void => {
    if (activeMaterial && machineProfile) {
      const layerPreset: MaterialPreset = newMaterialPresetFromLayer(layer, activeMaterial.id, machineProfile);
      // Updating keeps the id and the notes of the stored preset; only the numbers come from the layer.
      const savedPreset: MaterialPreset = storedPreset
        ? { ...layerPreset, id: storedPreset.id, notes: storedPreset.notes }
        : layerPreset;

      dispatch(new MaterialPresetSaved({ preset: savedPreset }));
      setStatusText(t(
        storedPreset ? DEFAULT.LAYER_SETTINGS_PRESET_UPDATED : DEFAULT.LAYER_SETTINGS_PRESET_SAVED,
        getPresetNameParameters(activeMaterial, machineProfile),
      ));
    }

    setIsUpdateAsked(false);
  };

  const handleSaveClick = (): void => {
    if (matchingPreset) {
      setIsUpdateAsked(true);
    } else {
      savePreset(undefined);
    }
  };

  return (
    <>
      <div className={styles.actions}>
        <Popconfirm
          open={isUpdateAsked}
          title={activeMaterial && machineProfile
            && t(DEFAULT.LAYER_SETTINGS_PRESET_EXISTS, getPresetNameParameters(activeMaterial, machineProfile))}
          description={t(DEFAULT.LAYER_SETTINGS_PRESET_EXISTS_QUESTION)}
          okText={t(DEFAULT.LAYER_SETTINGS_PRESET_UPDATE)}
          cancelText={t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE_NEW)}
          onConfirm={() => savePreset(matchingPreset)}
          onCancel={() => savePreset(undefined)}
          // The button opens the question itself, after its check; a click outside or Escape only closes it.
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              setIsUpdateAsked(false);
            }
          }}
        >
          {/* The icons carry labels of their own, so each button names itself to keep its name to its text. */}
          <Button
            type={ANTD_BUTTON_TYPE_DEFAULT}
            icon={<SaveOutlined />}
            aria-label={t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE)}
            disabled={!isSaveAllowed}
            onClick={handleSaveClick}
          >
            {t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE)}
          </Button>
        </Popconfirm>
        <Button
          type={ANTD_BUTTON_TYPE_DEFAULT}
          icon={<BookOutlined />}
          aria-label={t(DEFAULT.LAYER_SETTINGS_PRESET_APPLY)}
          onClick={() => setIsLibraryOpen(true)}
        >
          {t(DEFAULT.LAYER_SETTINGS_PRESET_APPLY)}
        </Button>
      </div>
      {!activeMaterial && <p className={styles.note} role="note">{t(DEFAULT.LAYER_SETTINGS_PRESET_NEEDS_MATERIAL)}</p>}
      <p className={styles.status} role="status">{statusText}</p>
      <MaterialLibraryDialog
        isOpen={isLibraryOpen}
        initialLayerKey={layerKey}
        onClose={() => setIsLibraryOpen(false)}
      />
    </>
  );
};

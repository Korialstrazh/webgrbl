/**
 * The preset buttons of the layer settings drawer, each an icon with a short caption: Save as material preset stores
 * the layer for the project material and the active machine, and Use a material preset opens the library for this
 * layer. When a preset for the same material, operation and machine exists, saving asks in a popover under the button
 * whether to update it, add a new one or do nothing, so a second click never leaves two rows that look the same. The
 * confirmation line under the buttons clears itself after a moment, and at once when the question opens.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { FileAddOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_BUTTON_TYPE_DEFAULT,
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_BUTTON_TYPE_TEXT,
  ANTD_POPOVER_PLACEMENT_BOTTOM_LEFT,
} from '../../../utils/antd.constants';
import { INLINE_FEEDBACK_LIFETIME_MS } from '../../../utils/feedback.constants';
import type { ExpiringValue } from '../../../utils/hooks/interfaces/ExpiringValue';
import { useExpiringValue } from '../../../utils/hooks/use.expiring.value';
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
import { IconActionButton } from '../../../views/IconActionButton';
import { MaterialSheetIcon } from '../../../views/MaterialSheetIcon';
import { MaterialLibraryDrawer } from '../../MaterialLibraryDrawer';
import { MATERIAL_PRESET_OPERATION_LABEL_KEY } from '../../MaterialLibraryDrawer/material.library.drawer.constants';
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
  const { value: statusText, setValue: setStatusText }: ExpiringValue<string> =
    useExpiringValue<string>(INLINE_FEEDBACK_LIFETIME_MS);
  // The question renders into the button row, so it stays inside the drawer instead of floating over the layer list.
  const actionsRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
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
      // A stale confirmation under an open question would read as its answer.
      setStatusText(undefined);
      setIsUpdateAsked(true);
    } else {
      savePreset(undefined);
    }
  };

  const updateQuestionComponent: ReactNode = activeMaterial && machineProfile && (
    <div className={styles.updateQuestion}>
      <p className={styles.updateQuestionTitle}>
        {t(DEFAULT.LAYER_SETTINGS_PRESET_EXISTS, getPresetNameParameters(activeMaterial, machineProfile))}
      </p>
      <p className={styles.updateQuestionText}>{t(DEFAULT.LAYER_SETTINGS_PRESET_EXISTS_QUESTION)}</p>
      <div className={styles.updateQuestionActions}>
        <Button
          type={ANTD_BUTTON_TYPE_PRIMARY}
          size={ANTD_BUTTON_SIZE_SMALL}
          onClick={() => savePreset(matchingPreset)}
        >
          {t(DEFAULT.LAYER_SETTINGS_PRESET_UPDATE)}
        </Button>
        <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => savePreset(undefined)}>
          {t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE_NEW)}
        </Button>
        <Button type={ANTD_BUTTON_TYPE_TEXT} size={ANTD_BUTTON_SIZE_SMALL} onClick={() => setIsUpdateAsked(false)}>
          {t(DEFAULT.LAYER_SETTINGS_PRESET_CANCEL)}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div ref={actionsRef} className={styles.actions}>
        <Popover
          open={isUpdateAsked}
          content={updateQuestionComponent}
          placement={ANTD_POPOVER_PLACEMENT_BOTTOM_LEFT}
          getPopupContainer={(triggerNode: HTMLElement): HTMLElement => actionsRef.current ?? triggerNode}
          // The button opens the question itself, after its check; a click outside or Escape only closes it.
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              setIsUpdateAsked(false);
            }
          }}
        >
          <span>
            <IconActionButton
              type={ANTD_BUTTON_TYPE_DEFAULT}
              labelText={t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE)}
              captionText={t(DEFAULT.LAYER_SETTINGS_PRESET_SAVE)}
              block
              iconComponent={<FileAddOutlined aria-hidden />}
              blockedReasonText={activeMaterial ? undefined : t(DEFAULT.LAYER_SETTINGS_PRESET_NEEDS_MATERIAL)}
              isDisabled={!isSaveAllowed}
              onClick={handleSaveClick}
            />
          </span>
        </Popover>
        <IconActionButton
          type={ANTD_BUTTON_TYPE_DEFAULT}
          labelText={t(DEFAULT.LAYER_SETTINGS_PRESET_APPLY)}
          captionText={t(DEFAULT.LAYER_SETTINGS_PRESET_APPLY)}
          block
          iconComponent={<MaterialSheetIcon aria-hidden />}
          onClick={() => setIsLibraryOpen(true)}
        />
      </div>
      <p className={styles.status} role="status">{statusText}</p>
      <MaterialLibraryDrawer
        isOpen={isLibraryOpen}
        initialLayerKey={layerKey}
        onClose={() => setIsLibraryOpen(false)}
      />
    </>
  );
};

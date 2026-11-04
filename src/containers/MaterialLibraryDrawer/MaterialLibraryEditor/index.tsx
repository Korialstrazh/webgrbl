/**
 * The content of the material library: search, the machine filter, a material filter chip when it was opened for
 * one material, the table of presets and the edit pane. It owns
 * the draft the pane edits, so it knows whether there is something to save, keeps the saved preset open, and shows
 * one confirmation line under the actions, which clears itself after a moment. A new preset is for the project
 * material and the active machine, with no power filled in, so a value nobody chose is never saved.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../utils/layers/get.layer.palette.entry';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { INLINE_FEEDBACK_LIFETIME_MS } from '../../../utils/feedback.constants';
import type { ExpiringValue } from '../../../utils/hooks/interfaces/ExpiringValue';
import { useExpiringValue } from '../../../utils/hooks/use.expiring.value';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMaterialPresetRows } from '../../../utils/materials/get.material.preset.rows';
import type { Material } from '../../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import type { MaterialPresetRow } from '../../../utils/materials/interfaces/MaterialPresetRow';
import { isSameMaterialPreset } from '../../../utils/materials/is.same.material.preset';
import { MATERIAL_PRESET_OPERATION } from '../../../utils/materials/material.preset.constants';
import type { MaterialPresetOperation } from '../../../utils/materials/material.preset.constants';
import { newMaterialPreset } from '../../../utils/materials/new.material.preset';
import { PASSES_MIN } from '../../../utils/palette/palette.constants';
import type { PaletteEntry } from '../../../utils/palette/interfaces/PaletteEntry';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile, selectMachineProfiles } from '../../../utils/states/machine.profile.state';
import {
  MaterialPresetDeleted,
  MaterialPresetSaved,
  selectMaterialPresets,
} from '../../../utils/states/material.preset.state';
import { selectActiveMaterial } from '../../../utils/states/material.selectors';
import { selectMaterials } from '../../../utils/states/material.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { selectPaletteEntries } from '../../../utils/states/palette.state';
import { selectProjectLayers } from '../../../utils/states/project.document.state';
import type { ApplyPresetToLayer } from '../interfaces/ApplyPresetToLayer';
import type { MaterialLibraryEditorProps } from '../interfaces/MaterialLibraryEditorProps';
import type { MaterialPresetChange } from '../interfaces/MaterialPresetFormProps';
import { MATERIAL_PRESET_OPERATION_LABEL_KEY } from '../material.library.drawer.constants';
import { MaterialLibraryEmptyState } from '../MaterialLibraryEmptyState';
import { MaterialLibraryFilters } from '../MaterialLibraryFilters';
import { MaterialPresetForm } from '../MaterialPresetForm';
import { MaterialPresetTable } from '../MaterialPresetTable';
import { PresetLayerApply } from '../PresetLayerApply';
import { useApplyPresetToLayer } from '../use.apply.preset.to.layer';
import styles from './styles.module.scss';

const NEW_PRESET_SPEED_MM_PER_MIN = 1000;

export const MaterialLibraryEditor = (props: MaterialLibraryEditorProps): ReactNode => {
  const { initialLayerKey, initialMaterialId, tickedPresetIds, onTick, onClose } = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const materials: Material[] = useSelector(selectMaterials);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const presets: MaterialPreset[] = useSelector(selectMaterialPresets);
  const profiles: MachineProfile[] = useSelector(selectMachineProfiles);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const layers: ProjectLayer[] = useSelector(selectProjectLayers);
  const paletteEntries: PaletteEntry[] = useSelector(selectPaletteEntries);
  const applyPresetToLayer: ApplyPresetToLayer = useApplyPresetToLayer(activeProfile?.maxPowerWatts ?? 0);
  const [pickedLayerKey, setPickedLayerKey] = useState<string | undefined>(initialLayerKey);
  const [searchText, setSearchText] = useState<string>('');
  const [materialFilterId, setMaterialFilterId] = useState<string | undefined>(initialMaterialId);
  const [isOnlyActiveMachine, setIsOnlyActiveMachine] = useState<boolean>(true);
  const [draftPreset, setDraftPreset] = useState<MaterialPreset | undefined>(undefined);
  const { value: feedbackText, setValue: setFeedbackText }: ExpiringValue<string> =
    useExpiringValue<string>(INLINE_FEEDBACK_LIFETIME_MS);
  const { value: appliedPresetId, setValue: setAppliedPresetId }: ExpiringValue<string> =
    useExpiringValue<string>(INLINE_FEEDBACK_LIFETIME_MS);
  const [firstMaterial]: (Material | undefined)[] = materials;
  const filteredMaterial: Material | undefined =
    materials.find(({ id }: Material): boolean => id === materialFilterId);
  // A new preset is for the material the list is filtered to, as that is the material the user came for.
  const newPresetMaterial: Material | undefined = filteredMaterial ?? activeMaterial ?? firstMaterial;
  const storedPreset: MaterialPreset | undefined =
    presets.find(({ id }: MaterialPreset): boolean => id === draftPreset?.id);
  const isDraftChanged: boolean = Boolean(draftPreset) && !(storedPreset && draftPreset
    && isSameMaterialPreset(storedPreset, draftPreset));
  const draftProfile: MachineProfile | undefined =
    profiles.find(({ id }: MachineProfile): boolean => id === draftPreset?.machineProfileId);
  const initialLayer: ProjectLayer | undefined =
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === initialLayerKey);
  const initialLayerName: string | undefined =
    initialLayer && getLayerDisplayName(initialLayer, getLayerPaletteEntry(initialLayer, paletteEntries));

  // Applying uses the stored values, not unsaved edits. Only presets of the active laser apply: the watts of another
  // laser would give another result on this one.
  const applicablePreset: MaterialPreset | undefined =
    storedPreset?.machineProfileId === activeProfile?.id ? storedPreset : undefined;

  const getOperationLabel = (operation: MaterialPresetOperation): string =>
    t(MATERIAL_PRESET_OPERATION_LABEL_KEY[operation]);

  // With no active machine there is nothing to keep to, so the list and the checkbox both say every machine.
  const listedProfileId: string | undefined = isOnlyActiveMachine ? activeProfile?.id : undefined;

  const rows: MaterialPresetRow[] = getMaterialPresetRows(presets, materials, {
    searchText,
    machineProfileId: listedProfileId,
    materialId: filteredMaterial?.id,
    preferredMaterialId: activeMaterial?.id,
    getOperationLabel,
  });

  const getProfileName = (profileId: string): string =>
    profiles.find(({ id }: MachineProfile): boolean => id === profileId)?.name
      ?? t(DEFAULT.MATERIAL_LIBRARY_MACHINE_DELETED);

  /** The heading names the stored preset, so it does not change under the user while the draft is edited. */
  const getHeadingText = (): string => {
    const material: Material | undefined =
      materials.find(({ id }: Material): boolean => id === storedPreset?.materialId);

    return storedPreset && material
      ? t(DEFAULT.MATERIAL_LIBRARY_PRESET_NAME, {
        name: material.name,
        thickness: material.thicknessMm,
        operation: getOperationLabel(storedPreset.operation),
      })
      : t(DEFAULT.MATERIAL_LIBRARY_NEW_PRESET);
  };

  const openPreset = (preset: MaterialPreset | undefined): void => {
    setDraftPreset(preset);
    setFeedbackText(undefined);
  };

  const addPreset = (): void => {
    if (newPresetMaterial && activeProfile) {
      openPreset(newMaterialPreset({
        materialId: newPresetMaterial.id,
        machineProfileId: activeProfile.id,
        operation: MATERIAL_PRESET_OPERATION.CUT,
        powerWatts: Number.NaN,
        speedMmPerMin: NEW_PRESET_SPEED_MM_PER_MIN,
        passes: PASSES_MIN,
        notes: '',
      }));
    }
  };

  const saveDraft = (): void => {
    if (draftPreset) {
      const savedPreset: MaterialPreset = { ...draftPreset, notes: draftPreset.notes.trim() };

      dispatch(new MaterialPresetSaved({ preset: savedPreset }));
      setDraftPreset(savedPreset);
      setFeedbackText(t(DEFAULT.MATERIAL_LIBRARY_SAVED));
    }
  };

  const deleteDraft = (): void => {
    if (draftPreset) {
      dispatch(new MaterialPresetDeleted({ presetId: draftPreset.id }));
      setDraftPreset(undefined);
      setFeedbackText(t(DEFAULT.MATERIAL_LIBRARY_DELETED));
    }
  };

  /** A row confirms its own apply in place, so the confirmation line stays for the edit pane's actions. */
  const applyRowPreset = (preset: MaterialPreset): void => {
    if (initialLayerKey && applyPresetToLayer(preset, initialLayerKey)) {
      setAppliedPresetId(preset.id);
    }
  };

  return (
    <div className={styles.materialLibraryEditor}>
      <div className={styles.listPane}>
        <MaterialLibraryFilters
          searchText={searchText}
          isOnlyActiveMachine={Boolean(listedProfileId)}
          hasActiveMachine={Boolean(activeProfile)}
          filteredMaterial={filteredMaterial}
          isAddAllowed={Boolean(newPresetMaterial && activeProfile)}
          isAddMainAction={!draftPreset}
          onSearch={setSearchText}
          onOnlyActiveMachineChange={setIsOnlyActiveMachine}
          onClearMaterialFilter={() => setMaterialFilterId(undefined)}
          onAdd={addPreset}
        />
        {initialLayerName && (
          <p className={styles.layerNote} role="note">
            {t(DEFAULT.MATERIAL_LIBRARY_LAYER_NOTE, { layer: initialLayerName })}
          </p>
        )}
        <div className={styles.tableScroller}>
          <MaterialPresetTable
            rows={rows}
            editedPresetId={draftPreset?.id}
            tickedPresetIds={tickedPresetIds}
            isMachineColumnShown={!listedProfileId}
            activeProfile={activeProfile}
            rowApply={initialLayerName && activeProfile ? {
              layerName: initialLayerName,
              machineProfileId: activeProfile.id,
              maxPowerWatts: activeProfile.maxPowerWatts,
              appliedPresetId,
              onApply: applyRowPreset,
            } : undefined}
            emptyStateComponent={
              <MaterialLibraryEmptyState
                hasMaterials={Boolean(firstMaterial)}
                hasActiveMachine={Boolean(activeProfile)}
                searchText={searchText}
                filteredMaterial={filteredMaterial}
                onClearSearch={() => setSearchText('')}
                onClearMaterialFilter={() => setMaterialFilterId(undefined)}
                onClose={onClose}
              />
            }
            getOperationLabel={getOperationLabel}
            getProfileName={getProfileName}
            onTick={onTick}
            onPick={openPreset}
          />
        </div>
      </div>
      <aside className={styles.editPane}>
        {draftPreset ? (
          <MaterialPresetForm
            key={draftPreset.id}
            preset={draftPreset}
            isStored={Boolean(storedPreset)}
            isChanged={isDraftChanged}
            // A preset whose machine is gone can only be deleted: no power passes the check against 0 W.
            maxPowerWatts={draftProfile?.maxPowerWatts ?? 0}
            headingText={getHeadingText()}
            onChange={(change: MaterialPresetChange) => setDraftPreset({ ...draftPreset, ...change })}
            onSave={saveDraft}
            onCancel={() => openPreset(undefined)}
            onDelete={deleteDraft}
          />
        ) : <p className={styles.pickHint}>{t(DEFAULT.MATERIAL_LIBRARY_PICK_HINT)}</p>}
        <p className={styles.feedback} role="status">
          {feedbackText && <CheckCircleOutlined className={styles.feedbackIcon} aria-hidden />}
          {feedbackText}
        </p>
        {applicablePreset && activeProfile && (
          <PresetLayerApply
            preset={applicablePreset}
            maxPowerWatts={activeProfile.maxPowerWatts}
            pickedLayerKey={pickedLayerKey}
            isFormChanged={isDraftChanged}
            onPickLayer={setPickedLayerKey}
            onApplied={setFeedbackText}
          />
        )}
      </aside>
    </div>
  );
};

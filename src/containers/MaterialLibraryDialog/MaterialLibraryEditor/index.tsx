/**
 * The content of the material library: search, the machine filter, the table of presets and the edit panel. A new
 * preset is for the active machine, with no power filled in, so a value nobody chose is never saved.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Checkbox, Input, Table } from 'antd';
import type { CheckboxChangeEvent, TableColumnsType } from 'antd';
import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMaterialPresetRows } from '../../../utils/materials/get.material.preset.rows';
import type { Material } from '../../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../../utils/materials/interfaces/MaterialPreset';
import type { MaterialPresetRow } from '../../../utils/materials/interfaces/MaterialPresetRow';
import { MATERIAL_PRESET_OPERATION } from '../../../utils/materials/material.preset.constants';
import type { MaterialPresetOperation } from '../../../utils/materials/material.preset.constants';
import { newMaterialPreset } from '../../../utils/materials/new.material.preset';
import { PASSES_MIN } from '../../../utils/palette/palette.constants';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import { selectActiveMachineProfile, selectMachineProfiles } from '../../../utils/states/machine.profile.state';
import { selectMaterialPresets } from '../../../utils/states/material.preset.state';
import { selectMaterials } from '../../../utils/states/material.state';
import { MATERIAL_PRESET_OPERATION_LABEL_KEY } from '../material.library.dialog.constants';
import { MaterialPresetForm } from '../MaterialPresetForm';
import styles from './styles.module.scss';

const NEW_PRESET_SPEED_MM_PER_MIN = 1000;
const ROW_SELECTION_TYPE_RADIO = 'radio' as const;
const TABLE_SIZE_SMALL = 'small' as const;
const SEARCH_INPUT_TYPE = 'search';
const MATERIAL_NAME_FIELD: keyof MaterialPresetRow = 'materialName';
const COLUMN_KEY = {
  MATERIAL: 'material',
  THICKNESS: 'thickness',
  OPERATION: 'operation',
  POWER: 'power',
  SPEED: 'speed',
  PASSES: 'passes',
  MACHINE: 'machine',
} as const;

const getPresetRowKey = ({ preset }: MaterialPresetRow): string => preset.id;

export const MaterialLibraryEditor = (): ReactNode => {
  const { t } = useTranslation();
  const materials: Material[] = useSelector(selectMaterials);
  const presets: MaterialPreset[] = useSelector(selectMaterialPresets);
  const profiles: MachineProfile[] = useSelector(selectMachineProfiles);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const [searchText, setSearchText] = useState<string>('');
  const [isOnlyActiveMachine, setIsOnlyActiveMachine] = useState<boolean>(true);
  const [editedPreset, setEditedPreset] = useState<MaterialPreset | undefined>(undefined);
  const [firstMaterial] = materials;
  const editedProfile: MachineProfile | undefined = profiles.find(
    ({ id }: MachineProfile): boolean => id === editedPreset?.machineProfileId,
  );

  const getOperationLabel = (operation: MaterialPresetOperation): string =>
    t(MATERIAL_PRESET_OPERATION_LABEL_KEY[operation]);

  const rows: MaterialPresetRow[] = getMaterialPresetRows(presets, materials, {
    searchText,
    machineProfileId: isOnlyActiveMachine ? activeProfile?.id : undefined,
    getOperationLabel,
  });

  const getProfileName = (profileId: string): string | undefined =>
    profiles.find(({ id }: MachineProfile): boolean => id === profileId)?.name;

  const addPreset = (): void => {
    if (firstMaterial && activeProfile) {
      setEditedPreset(newMaterialPreset({
        materialId: firstMaterial.id,
        machineProfileId: activeProfile.id,
        operation: MATERIAL_PRESET_OPERATION.CUT,
        powerWatts: Number.NaN,
        speedMmPerMin: NEW_PRESET_SPEED_MM_PER_MIN,
        passes: PASSES_MIN,
        notes: '',
      }));
    }
  };

  const columns: TableColumnsType<MaterialPresetRow> = [
    { key: COLUMN_KEY.MATERIAL, title: t(DEFAULT.MATERIAL_LIBRARY_MATERIAL), dataIndex: MATERIAL_NAME_FIELD },
    {
      key: COLUMN_KEY.THICKNESS,
      title: t(DEFAULT.MATERIAL_LIBRARY_THICKNESS),
      render: ({ thicknessMm }: MaterialPresetRow) =>
        t(DEFAULT.MATERIAL_LIBRARY_THICKNESS_VALUE, { thickness: thicknessMm }),
    },
    {
      key: COLUMN_KEY.OPERATION,
      title: t(DEFAULT.MATERIAL_LIBRARY_OPERATION),
      render: ({ preset }: MaterialPresetRow) => getOperationLabel(preset.operation),
    },
    {
      key: COLUMN_KEY.POWER,
      title: t(DEFAULT.MATERIAL_LIBRARY_POWER),
      render: ({ preset }: MaterialPresetRow) => preset.powerWatts,
    },
    {
      key: COLUMN_KEY.SPEED,
      title: t(DEFAULT.MATERIAL_LIBRARY_SPEED),
      render: ({ preset }: MaterialPresetRow) => preset.speedMmPerMin,
    },
    {
      key: COLUMN_KEY.PASSES,
      title: t(DEFAULT.MATERIAL_LIBRARY_PASSES),
      render: ({ preset }: MaterialPresetRow) => preset.passes,
    },
    // With every machine listed, the same material can appear for several lasers.
    ...(isOnlyActiveMachine ? [] : [{
      key: COLUMN_KEY.MACHINE,
      title: t(DEFAULT.MATERIAL_LIBRARY_MACHINE),
      render: ({ preset }: MaterialPresetRow) => getProfileName(preset.machineProfileId),
    }]),
  ];

  return (
    <div className={styles.materialLibraryEditor}>
      <div className={styles.listPane}>
        <div className={styles.filters}>
          <Input
            type={SEARCH_INPUT_TYPE}
            aria-label={t(DEFAULT.MATERIAL_LIBRARY_SEARCH)}
            placeholder={t(DEFAULT.MATERIAL_LIBRARY_SEARCH)}
            value={searchText}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => setSearchText(changeEvent.target.value)}
          />
          <Checkbox
            checked={isOnlyActiveMachine}
            onChange={(changeEvent: CheckboxChangeEvent) => setIsOnlyActiveMachine(changeEvent.target.checked)}
          >
            {t(DEFAULT.MATERIAL_LIBRARY_ONLY_THIS_MACHINE)}
          </Checkbox>
          <Button disabled={!firstMaterial || !activeProfile} onClick={addPreset}>
            {t(DEFAULT.MATERIAL_LIBRARY_ADD)}
          </Button>
        </div>
        {!firstMaterial && <p role="note">{t(DEFAULT.MATERIAL_LIBRARY_NO_MATERIALS)}</p>}
        <div className={styles.tableScroller}>
          <Table<MaterialPresetRow>
            size={TABLE_SIZE_SMALL}
            pagination={false}
            rowKey={getPresetRowKey}
            columns={columns}
            dataSource={rows}
            locale={{ emptyText: t(DEFAULT.MATERIAL_LIBRARY_EMPTY) }}
            rowSelection={{
              type: ROW_SELECTION_TYPE_RADIO,
              selectedRowKeys: editedPreset ? [editedPreset.id] : [],
              onChange: (_rowKeys: React.Key[], selectedRows: MaterialPresetRow[]) =>
                setEditedPreset(selectedRows[0]?.preset),
            }}
            onRow={({ preset }: MaterialPresetRow) => ({ onClick: () => setEditedPreset(preset) })}
          />
        </div>
      </div>
      <aside className={styles.editPane}>
        {editedPreset && editedProfile ? (
          <MaterialPresetForm
            key={editedPreset.id}
            preset={editedPreset}
            maxPowerWatts={editedProfile.maxPowerWatts}
            onDone={() => setEditedPreset(undefined)}
          />
        ) : <p>{t(DEFAULT.MATERIAL_LIBRARY_PICK_HINT)}</p>}
      </aside>
    </div>
  );
};

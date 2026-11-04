/**
 * The material of the project, in the design panel: a select that names each material with its thickness, so materials
 * of one name can be told apart, with an entry that adds one. Each option also says how many presets the material has
 * on the active machine and whether it had a burn test there: the two are different things, so both are named, and
 * the option never contradicts the preset summary under the select. Picking the add entry changes nothing in the
 * select: the dialog it opens selects the new material on save.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { MIDDLE_DOT } from '../../utils/characters.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getMaterialPresetCount } from '../../utils/materials/get.material.preset.count';
import { getMaterialTestDateText } from '../../utils/materials/get.material.test.date.text';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MaterialPreset } from '../../utils/materials/interfaces/MaterialPreset';
import type { MaterialTestResult } from '../../utils/materials/interfaces/MaterialTestResult';
import { selectActiveMachineProfile } from '../../utils/states/machine.profile.state';
import { selectMaterialPresets } from '../../utils/states/material.preset.state';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { selectMaterials } from '../../utils/states/material.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { MaterialDialog } from '../MaterialDialog';
import styles from './styles.module.scss';

// Material ids are random UUIDs, so they never match this.
const ADD_MATERIAL_OPTION_VALUE = 'add-material';
const OPTION_DETAIL_SEPARATOR = ` ${MIDDLE_DOT} `;

export const ProjectMaterialSelect = (): ReactNode => {
  const { t, i18n } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const materials: Material[] = useSelector(selectMaterials);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const activeProfileId: string | undefined = useSelector(selectActiveMachineProfile)?.id;
  const presets: MaterialPreset[] = useSelector(selectMaterialPresets);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState<boolean>(false);

  const getTestDetailText = ({ testResults }: Material): string => {
    const testResult: MaterialTestResult | undefined = testResults.find(
      ({ machineProfileId }: MaterialTestResult): boolean => machineProfileId === activeProfileId,
    );

    return testResult
      ? t(DEFAULT.BURN_PREVIEW_MATERIAL_DETAIL_TESTED, {
        date: getMaterialTestDateText(testResult.testedAtIso, i18n.language),
      })
      : t(DEFAULT.BURN_PREVIEW_MATERIAL_DETAIL_UNTESTED);
  };

  /** The preset count comes first, when there is one, then the burn test; a material with no presets names no count. */
  const getMaterialDetailText = (material: Material): string => {
    const presetCount: number = activeProfileId
      ? getMaterialPresetCount(presets, { materialId: material.id, machineProfileId: activeProfileId })
      : 0;
    const detailParts: string[] = [];

    if (presetCount) {
      detailParts.push(t(DEFAULT.BURN_PREVIEW_MATERIAL_DETAIL_PRESETS, { count: presetCount }));
    }

    detailParts.push(getTestDetailText(material));

    return detailParts.join(OPTION_DETAIL_SEPARATOR);
  };

  const changeMaterial = (optionValue: string): void => {
    if (optionValue === ADD_MATERIAL_OPTION_VALUE) {
      setIsMaterialDialogOpen(true);
    } else {
      dispatch(new ProjectMaterialSelected({ materialId: optionValue }));
    }
  };

  return (
    <>
      <Select<string>
        className={styles.materialSelect}
        aria-label={t(DEFAULT.BURN_PREVIEW_MATERIAL_LABEL)}
        placeholder={t(DEFAULT.BURN_PREVIEW_MATERIAL_PLACEHOLDER)}
        // null, not undefined: with undefined antd lets the select keep the add entry it was clicked on.
        value={activeMaterial?.id ?? null}
        options={[
          ...materials.map((material: Material) => ({
            value: material.id,
            label: t(DEFAULT.BURN_PREVIEW_MATERIAL_OPTION, { name: material.name, thickness: material.thicknessMm }),
            detail: getMaterialDetailText(material),
          })),
          { value: ADD_MATERIAL_OPTION_VALUE, label: t(DEFAULT.BURN_PREVIEW_ADD_MATERIAL) },
        ]}
        optionRender={({ label, value, data }) => (
          <span className={styles.materialOption}>
            <span className={styles.materialOptionText}>
              <span className={styles.materialOptionName}>{label}</span>
              {data.detail && <span className={styles.materialOptionDetail}>{data.detail}</span>}
            </span>
            {value === activeMaterial?.id && <CheckOutlined className={styles.currentMark} />}
          </span>
        )}
        onChange={changeMaterial}
      />
      <MaterialDialog isOpen={isMaterialDialogOpen} onClose={() => setIsMaterialDialogOpen(false)} />
    </>
  );
};

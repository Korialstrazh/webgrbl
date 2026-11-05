/**
 * Adds a material: the name starts empty with the focus on it, and the thickness at the default. Save waits for both
 * to pass their checks, stores the material and makes it the material of the project, or hands it to the caller that
 * asked for it instead, such as the material library; a field the user has changed shows its failed check below it.
 * A name and thickness that match a saved material are allowed, with an offer to use that one. It starts over on
 * every open.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ColumnHeightOutlined, TagOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import type { InputRef } from 'antd';
import { useId, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_SIZE_SMALL,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
} from '../../utils/antd.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getMatchingMaterial } from '../../utils/materials/get.matching.material';
import { getMaterialFieldErrors } from '../../utils/materials/get.material.field.errors';
import type { Material } from '../../utils/materials/interfaces/Material';
import type { MaterialFieldErrors } from '../../utils/materials/interfaces/MaterialFieldErrors';
import {
  DEFAULT_MATERIAL_THICKNESS_MM,
  MATERIAL_NAME_LENGTH_MAX,
  MATERIAL_NAME_LENGTH_MIN,
  MATERIAL_THICKNESS_MM_MAX,
  MATERIAL_THICKNESS_MM_MIN,
} from '../../utils/materials/material.constants';
import { newMaterial } from '../../utils/materials/new.material';
import { selectActiveMaterial } from '../../utils/states/material.selectors';
import { MaterialSaved, selectMaterials } from '../../utils/states/material.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ProjectMaterialSelected } from '../../utils/states/project.document.state';
import { isFiniteNumber } from '../../utils/type.guards/is.finite.number';
import { IconNumberField } from '../../views/IconNumberField';
import { BedRegionModal } from '../BedRegionModal';
import type { MaterialDialogProps } from './interfaces/MaterialDialogProps';
import { MATERIAL_DIALOG_OVERLAY_ID } from './material.dialog.constants';
import styles from './styles.module.scss';

type MaterialDialogContentProps = Pick<MaterialDialogProps, 'onClose' | 'onMaterialChosen'>;

const FIELD_ID_SEPARATOR = '-';
const NAME_FIELD_ID_SUFFIX = 'name';
const THICKNESS_FIELD_ID_SUFFIX = 'thickness';

const hasMaterialFieldError = ({ nameErrorKey, thicknessErrorKey }: MaterialFieldErrors): boolean =>
  Boolean(nameErrorKey || thicknessErrorKey);

const MaterialDialogContent = ({ onClose, onMaterialChosen }: MaterialDialogContentProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const [materialName, setMaterialName] = useState<string>('');
  const [isNameChanged, setIsNameChanged] = useState<boolean>(false);
  const [thicknessMm, setThicknessMm] = useState<number>(DEFAULT_MATERIAL_THICKNESS_MM);
  const materials: Material[] = useSelector(selectMaterials);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const nameInputRef: RefObject<InputRef | null> = useRef<InputRef>(null);
  const fieldErrors: MaterialFieldErrors = getMaterialFieldErrors(materialName, thicknessMm);
  const isSaveAllowed: boolean = !hasMaterialFieldError(fieldErrors);
  const nameErrorKey: string | undefined = isNameChanged ? fieldErrors.nameErrorKey : undefined;
  const matchingMaterial: Material | undefined = isSaveAllowed
    ? getMatchingMaterial(materials, { name: materialName, thicknessMm })
    : undefined;
  const nameFieldId: string = [formId, NAME_FIELD_ID_SUFFIX].join(FIELD_ID_SEPARATOR);
  const thicknessFieldId: string = [formId, THICKNESS_FIELD_ID_SUFFIX].join(FIELD_ID_SEPARATOR);

  const chooseMaterial = (materialId: string): void => {
    if (onMaterialChosen) {
      onMaterialChosen(materialId);
    } else {
      dispatch(new ProjectMaterialSelected({ materialId }));
    }

    onClose();
  };

  const saveMaterial = (): void => {
    const material: Material = newMaterial({ name: materialName.trim(), thicknessMm });

    dispatch(new MaterialSaved({ material }));

    // Choosing a material changes no layer value, so the first one a project gets can safely become its material.
    if (!activeMaterial) {
      dispatch(new ProjectMaterialSelected({ materialId: material.id }));
    }

    chooseMaterial(material.id);
  };

  return (
    <BedRegionModal
      isOpen
      overlayIdPrefix={MATERIAL_DIALOG_OVERLAY_ID}
      title={t(DEFAULT.MATERIAL_DIALOG_TITLE)}
      okText={t(DEFAULT.MATERIAL_DIALOG_SAVE)}
      cancelText={t(DEFAULT.MATERIAL_DIALOG_CANCEL)}
      okButtonProps={{ disabled: !isSaveAllowed }}
      onOk={saveMaterial}
      // The dialog takes the focus for itself when it opens, so the field asks for it back after that.
      afterOpenChange={(isDialogOpen: boolean) => {
        if (isDialogOpen) {
          nameInputRef.current?.focus();
        }
      }}
      onClose={onClose}
    >
      <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
        <Form.Item
          validateStatus={nameErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
          help={nameErrorKey && t(nameErrorKey, {
            min: MATERIAL_NAME_LENGTH_MIN,
            max: MATERIAL_NAME_LENGTH_MAX,
          })}
        >
          <Input
            ref={nameInputRef}
            id={nameFieldId}
            autoFocus
            prefix={<TagOutlined aria-hidden />}
            aria-label={t(DEFAULT.MATERIAL_DIALOG_NAME)}
            placeholder={t(DEFAULT.MATERIAL_DIALOG_NAME)}
            value={materialName}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
              setMaterialName(changeEvent.target.value);
              setIsNameChanged(true);
            }}
          />
        </Form.Item>
        <Form.Item
          validateStatus={fieldErrors.thicknessErrorKey && ANTD_FORM_ITEM_STATUS_ERROR}
          help={fieldErrors.thicknessErrorKey && t(fieldErrors.thicknessErrorKey, {
            min: MATERIAL_THICKNESS_MM_MIN,
            max: MATERIAL_THICKNESS_MM_MAX,
          })}
        >
          {/* An emptied input holds NaN, which the checks reject; the input then shows nothing. */}
          <IconNumberField
            inputId={thicknessFieldId}
            labelText={t(DEFAULT.MATERIAL_DIALOG_THICKNESS)}
            iconComponent={<ColumnHeightOutlined />}
            unitText={t(DEFAULT.FIELD_UNIT_MM)}
            value={isFiniteNumber(thicknessMm) ? thicknessMm : null}
            onChange={(value: number | null) => setThicknessMm(value ?? Number.NaN)}
          />
        </Form.Item>
      </Form>
      {/* The room stays reserved, so the text going away does not move the buttons. */}
      <p className={styles.saveHint} role="note">{isSaveAllowed ? undefined : t(DEFAULT.MATERIAL_DIALOG_SAVE_HINT)}</p>
      {matchingMaterial && (
        <div className={styles.duplicateNote} role="note">
          <span>{t(DEFAULT.MATERIAL_DIALOG_DUPLICATE_NOTE, { name: matchingMaterial.name })}</span>
          <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => chooseMaterial(matchingMaterial.id)}>
            {t(DEFAULT.MATERIAL_DIALOG_USE_EXISTING)}
          </Button>
        </div>
      )}
    </BedRegionModal>
  );
};

export const MaterialDialog = ({ isOpen, onClose, onMaterialChosen }: MaterialDialogProps): ReactNode =>
  (isOpen ? <MaterialDialogContent onClose={onClose} onMaterialChosen={onMaterialChosen} /> : null);

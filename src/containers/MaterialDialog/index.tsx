/**
 * Adds a material: the name starts empty with the focus on it, and the thickness at the default. The name is required:
 * Save stays off, with the reason shown beside the buttons, until both fields pass their checks; then it stores the material and makes it the material of the project, or hands it to the caller that
 * asked for it instead, such as the material library; a field the user has changed shows its failed check below it.
 * A name and thickness that match a saved material are allowed, with an offer to use that one. It starts over on
 * every open. Given a material to edit, the same form renames it and changes its thickness in place: the id stays, so
 * presets and the project's material keep pointing at it, and a name and thickness another material already has are
 * refused. Cancel leaves the material as it was.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { CheckOutlined, ColumnHeightOutlined, ExclamationCircleOutlined, TagOutlined } from '@ant-design/icons';
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
import { AppModal } from '../AppModal';
import type { MaterialDialogProps } from './interfaces/MaterialDialogProps';
import { MATERIAL_DIALOG_OVERLAY_ID, MATERIAL_DIALOG_WIDTH } from './material.dialog.constants';
import { InputCaption } from '../../views/InputCaption';
import styles from './styles.module.scss';

type MaterialDialogContentProps = Pick<MaterialDialogProps, 'onClose' | 'onMaterialChosen' | 'editedMaterial'>;

const FIELD_ID_SEPARATOR = '-';
const NAME_FIELD_ID_SUFFIX = 'name';
const THICKNESS_FIELD_ID_SUFFIX = 'thickness';
const SAVE_HINT_ID_SUFFIX = 'save-hint';

const hasMaterialFieldError = ({ nameErrorKey, thicknessErrorKey }: MaterialFieldErrors): boolean =>
  Boolean(nameErrorKey || thicknessErrorKey);

const MaterialDialogContent = (props: MaterialDialogContentProps): ReactNode => {
  const { onClose, onMaterialChosen, editedMaterial }: MaterialDialogContentProps = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const [materialName, setMaterialName] = useState<string>(editedMaterial?.name ?? '');
  // The name is checked once the user leaves the field, never while it is still empty and untouched.
  const [isNameTouched, setIsNameTouched] = useState<boolean>(false);
  const [thicknessMm, setThicknessMm] =
    useState<number>(editedMaterial?.thicknessMm ?? DEFAULT_MATERIAL_THICKNESS_MM);
  const materials: Material[] = useSelector(selectMaterials);
  const activeMaterial: Material | undefined = useSelector(selectActiveMaterial);
  const nameInputRef: RefObject<InputRef | null> = useRef<InputRef>(null);
  // While editing, the material itself is no match: keeping its name is fine.
  const otherMaterials: Material[] = editedMaterial
    ? materials.filter(({ id }: Material): boolean => id !== editedMaterial.id)
    : materials;
  const fieldErrors: MaterialFieldErrors = getMaterialFieldErrors(materialName, thicknessMm);
  const isFieldValid: boolean = !hasMaterialFieldError(fieldErrors);
  const matchingMaterial: Material | undefined = isFieldValid
    ? getMatchingMaterial(otherMaterials, { name: materialName, thicknessMm })
    : undefined;
  const isNameTaken: boolean = Boolean(editedMaterial && matchingMaterial);
  const isSaveAllowed: boolean = isFieldValid && !isNameTaken;
  const nameErrorKey: string | undefined = isNameTaken
    ? DEFAULT.MATERIAL_DIALOG_NAME_TAKEN
    : isNameTouched ? fieldErrors.nameErrorKey : undefined;
  const nameFieldId: string = [formId, NAME_FIELD_ID_SUFFIX].join(FIELD_ID_SEPARATOR);
  const thicknessFieldId: string = [formId, THICKNESS_FIELD_ID_SUFFIX].join(FIELD_ID_SEPARATOR);
  const saveHintId: string = [formId, SAVE_HINT_ID_SUFFIX].join(FIELD_ID_SEPARATOR);
  // The taken name already shows its own error under the field, so only a missing value needs a reason here.
  const saveHintKey: string | undefined = fieldErrors.nameErrorKey
    ? DEFAULT.MATERIAL_DIALOG_SAVE_HINT
    : fieldErrors.thicknessErrorKey ? DEFAULT.MATERIAL_DIALOG_SAVE_HINT_THICKNESS : undefined;

  const chooseMaterial = (materialId: string): void => {
    if (onMaterialChosen) {
      onMaterialChosen(materialId);
    } else {
      dispatch(new ProjectMaterialSelected({ materialId }));
    }

    onClose();
  };

  const saveMaterial = (): void => {
    // Save is off while a field is wrong; Enter in a field must not get past that either.
    if (!isSaveAllowed) {
      return;
    }

    if (editedMaterial) {
      // The same id, so presets and the project's material stay linked, and the views that show it update at once.
      dispatch(new MaterialSaved({ material: { ...editedMaterial, name: materialName.trim(), thicknessMm } }));
      onClose();

      return;
    }

    const material: Material = newMaterial({ name: materialName.trim(), thicknessMm });

    dispatch(new MaterialSaved({ material }));

    // Choosing a material changes no layer value, so the first one a project gets can safely become its material.
    if (!activeMaterial) {
      dispatch(new ProjectMaterialSelected({ materialId: material.id }));
    }

    chooseMaterial(material.id);
  };

  return (
    // Over the whole window with one full scrim, like every other dialog.
    <AppModal
      isOpen
      overlayIdPrefix={MATERIAL_DIALOG_OVERLAY_ID}
      maxWidth={MATERIAL_DIALOG_WIDTH}
      title={t(editedMaterial ? DEFAULT.MATERIAL_DIALOG_EDIT_TITLE : DEFAULT.MATERIAL_DIALOG_TITLE)}
      okText={t(DEFAULT.MATERIAL_DIALOG_SAVE)}
      cancelText={t(DEFAULT.MATERIAL_DIALOG_CANCEL)}
      okButtonProps={{
        icon: <CheckOutlined aria-hidden />,
        disabled: !isSaveAllowed,
        'aria-describedby': saveHintKey && saveHintId,
      }}
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
            prefix={<InputCaption iconComponent={<TagOutlined />} captionText={t(DEFAULT.FIELD_CAPTION_NAME)} />}
            aria-label={t(DEFAULT.MATERIAL_DIALOG_NAME)}
            aria-required
            value={materialName}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
              setMaterialName(changeEvent.target.value);
            }}
            onBlur={() => setIsNameTouched(true)}
          />
        </Form.Item>
        <Form.Item
          className={styles.lastField}
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
            captionText={t(DEFAULT.FIELD_CAPTION_THICKNESS)}
            unitText={t(DEFAULT.FIELD_UNIT_MM)}
            hasTooltip={false}
            value={isFiniteNumber(thicknessMm) ? thicknessMm : null}
            onChange={(value: number | null) => setThicknessMm(value ?? Number.NaN)}
          />
        </Form.Item>
      </Form>
      {/* Only while Save is off, so no empty row sits above the buttons; it says why Save cannot be pressed. */}
      {saveHintKey && (
        <p id={saveHintId} className={styles.saveHint} role="note">
          <ExclamationCircleOutlined aria-hidden />
          <span>{t(saveHintKey)}</span>
        </p>
      )}
      {matchingMaterial && !editedMaterial && (
        <div className={styles.duplicateNote} role="note">
          <span>{t(DEFAULT.MATERIAL_DIALOG_DUPLICATE_NOTE, { name: matchingMaterial.name })}</span>
          <Button size={ANTD_BUTTON_SIZE_SMALL} onClick={() => chooseMaterial(matchingMaterial.id)}>
            {t(DEFAULT.MATERIAL_DIALOG_USE_EXISTING)}
          </Button>
        </div>
      )}
    </AppModal>
  );
};

export const MaterialDialog = ({ isOpen, onClose, onMaterialChosen, editedMaterial }: MaterialDialogProps): ReactNode =>
  (isOpen ? (
    <MaterialDialogContent onClose={onClose} onMaterialChosen={onMaterialChosen} editedMaterial={editedMaterial} />
  ) : null);

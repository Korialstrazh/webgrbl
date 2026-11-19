/**
 * The form of one machine profile. It edits a draft and stores it only on Save, after the profile checks pass; a
 * failed check shows its message under the field. "Read from laser" fills the draft with the values the
 * laser reports validly and shows what was read, with a warning when the laser reports laser mode off.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  ApiOutlined,
  BorderOuterOutlined,
  CloudOutlined,
  HomeOutlined,
  SettingOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Form, Input, Select, Switch, Tooltip } from 'antd';
import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_COLLAPSE_SIZE_SMALL,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
} from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getClampedPointerPowerPercent } from '../../../utils/machine/get.clamped.pointer.power.percent';
import { getMachineProfileErrors } from '../../../utils/profiles/get.machine.profile.errors';
import { getReportedProfileFields } from '../../../utils/profiles/get.reported.profile.fields';
import { getValidlyReportedProfileValues } from '../../../utils/profiles/get.validly.reported.profile.values';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfileFieldError } from '../../../utils/profiles/interfaces/MachineProfileFieldError';
import type { ReportedMachineProfileValues } from '../../../utils/profiles/interfaces/ReportedMachineProfileValues';
import { MACHINE_ORIGIN_CORNER } from '../../../utils/profiles/machine.profile.constants';
import type { MachineOriginCorner } from '../../../utils/profiles/machine.profile.constants';
import { selectGrblSettings, selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { selectLaserPointerPowerPercent } from '../../../utils/states/laser.pointer.state';
import {
  ActiveMachineProfileSelected,
  MachineProfileSaved,
  selectActiveMachineProfile,
} from '../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import { MACHINE_ORIGIN_CORNER_LABEL_KEY } from '../machine.profiles.dialog.constants';
import type { MachineProfileChanges } from './interfaces/MachineProfileChanges';
import type { ProfileFieldStatus } from './interfaces/ProfileFieldStatus';
import type { ProfileFormProps } from './interfaces/ProfileFormProps';
import type { ProfileNumberFieldDefinition } from './interfaces/ProfileNumberFieldDefinition';
import { LaserReadingAlerts } from './LaserReadingAlerts';
import { ADVANCED_NUMBER_FIELDS, BED_NUMBER_FIELDS, MACHINE_NUMBER_FIELDS } from './profile.form.fields';
import { IconNumberField } from '../../../views/IconNumberField';
import { LaserMachineIcon } from '../../../views/LaserMachineIcon';
import { InputCaption } from '../../../views/InputCaption';
import styles from './styles.module.scss';

const FIELD_ID_SEPARATOR = '-';

const ADVANCED_PANEL_KEY = 'advanced';

/** Whether a failed check is on a field inside the collapsed Advanced panel, which must then open to show it. */
const hasAdvancedFieldError = (errors: MachineProfileFieldError[]): boolean =>
  errors.some(({ field }: MachineProfileFieldError): boolean =>
    ADVANCED_NUMBER_FIELDS.some((definition: ProfileNumberFieldDefinition): boolean => definition.field === field));

const NAME_FIELD: keyof MachineProfile = 'name';
const ORIGIN_CORNER_FIELD: keyof MachineProfile = 'originCorner';

/** An emptied number input holds NaN in the draft, which the profile checks reject; the input then shows nothing. */
const getInputNumberValue = (value: number | undefined): number | null => isFiniteNumber(value) ? value : null;

/** An emptied pointer power falls back to the session's; any other value is kept inside the pointer range. */
const getProfileWithClampedPointerPower = (profile: MachineProfile): MachineProfile => {
  const { pointerPowerPercent, ...otherFields } = profile;

  return isFiniteNumber(pointerPowerPercent)
    ? { ...otherFields, pointerPowerPercent: getClampedPointerPowerPercent(pointerPowerPercent) }
    : otherFields;
};

export const ProfileForm = ({ profile }: ProfileFormProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const isConnected: boolean = useSelector(selectIsConnected);
  const grblSettings: Record<number, string> = useSelector(selectGrblSettings);
  const activeProfile: MachineProfile | undefined = useSelector(selectActiveMachineProfile);
  const sessionPointerPowerPercent: number = useSelector(selectLaserPointerPowerPercent);
  // A profile saved before it stored a pointer power starts from the power in use now, as the pointer does.
  const [draft, setDraft] = useState<MachineProfile>({
    ...profile,
    pointerPowerPercent: profile.pointerPowerPercent ?? sessionPointerPowerPercent,
  });
  const [fieldErrors, setFieldErrors] = useState<MachineProfileFieldError[]>([]);
  const [reportedLaserValues, setReportedLaserValues] = useState<ReportedMachineProfileValues | undefined>(undefined);
  const [openAdvancedKeys, setOpenAdvancedKeys] = useState<string[]>([]);

  const changeDraft = (changes: MachineProfileChanges): void => {
    setDraft({ ...draft, ...changes });
  };

  const getFieldId = (field: keyof MachineProfile): string => [formId, field].join(FIELD_ID_SEPARATOR);

  const getFieldStatus = (field: keyof MachineProfile): ProfileFieldStatus => {
    const fieldError: MachineProfileFieldError | undefined =
      fieldErrors.find((error: MachineProfileFieldError): boolean => error.field === field);

    return fieldError
      ? { validateStatus: ANTD_FORM_ITEM_STATUS_ERROR, help: t(fieldError.messageKey, fieldError.messageParameters) }
      : {};
  };

  const saveDraft = (): void => {
    const draftErrors: MachineProfileFieldError[] = getMachineProfileErrors(draft);

    setFieldErrors(draftErrors);

    if (hasAdvancedFieldError(draftErrors)) {
      setOpenAdvancedKeys([ADVANCED_PANEL_KEY]);
    }

    if (draftErrors.length) {
      return;
    }

    dispatch(new MachineProfileSaved({ profile: getProfileWithClampedPointerPower(draft) }));

    // Only the first choice is made for the user: a save never replaces the laser they already picked.
    if (!activeProfile) {
      dispatch(new ActiveMachineProfileSelected({ profileId: draft.id }));
    }
  };

  const readDraftFromLaser = (): void => {
    // Only validly reported values reach the draft; every field the laser did not report keeps the draft's value.
    const reportedValues: ReportedMachineProfileValues = getValidlyReportedProfileValues(grblSettings);

    changeDraft(getReportedProfileFields(reportedValues));
    setReportedLaserValues(reportedValues);
  };

  const renderNumberFields = (definitions: readonly ProfileNumberFieldDefinition[]): ReactNode =>
    definitions.map((definition: ProfileNumberFieldDefinition) => {
      const { field, labelKey, hintKey, iconComponent, unitKey, captionKey, min, max, step } = definition;

      return (
        <Form.Item key={field} {...getFieldStatus(field)}>
          <IconNumberField
            inputId={getFieldId(field)}
            labelText={t(labelKey)}
            hintText={hintKey && t(hintKey)}
            iconComponent={iconComponent}
            captionText={captionKey && t(captionKey)}
            unitText={unitKey && t(unitKey)}
            min={min}
            max={max}
            step={step}
            value={getInputNumberValue(draft[field])}
            onChange={(value: number | null) => changeDraft({ [field]: value ?? Number.NaN })}
          />
        </Form.Item>
      );
    });

  return (
    <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
      <div className={styles.profileForm}>
        <section className={styles.group} aria-label={t(DEFAULT.MACHINE_PROFILES_GROUP_MACHINE)}>
          <h3 className={styles.groupTitle}>
            <LaserMachineIcon aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GROUP_MACHINE)}
          </h3>
          <Form.Item {...getFieldStatus(NAME_FIELD)}>
            <Input
              id={getFieldId(NAME_FIELD)}
              prefix={<InputCaption iconComponent={<TagOutlined />} captionText={t(DEFAULT.FIELD_CAPTION_NAME)} />}
              aria-label={t(DEFAULT.MACHINE_PROFILES_FIELD_NAME)}
              value={draft.name}
              onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
                changeDraft({ name: changeEvent.target.value });
              }}
            />
          </Form.Item>
          <div className={styles.numberFields}>{renderNumberFields(MACHINE_NUMBER_FIELDS)}</div>
        </section>
        <section className={styles.group} aria-label={t(DEFAULT.MACHINE_PROFILES_GROUP_BED)}>
          <h3 className={styles.groupTitle}>
            <BorderOuterOutlined aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GROUP_BED)}
          </h3>
          <div className={styles.numberFields}>
            {renderNumberFields(BED_NUMBER_FIELDS)}
            <Form.Item>
              <Tooltip title={t(DEFAULT.MACHINE_PROFILES_FIELD_ORIGIN_CORNER)}>
                <Select
                  id={getFieldId(ORIGIN_CORNER_FIELD)}
                  prefix={<BorderOuterOutlined aria-hidden />}
                  aria-label={t(DEFAULT.MACHINE_PROFILES_FIELD_ORIGIN_CORNER)}
                  value={draft.originCorner}
                  options={Object.values(MACHINE_ORIGIN_CORNER).map((originCorner: MachineOriginCorner) => ({
                    value: originCorner,
                    label: t(MACHINE_ORIGIN_CORNER_LABEL_KEY[originCorner]),
                  }))}
                  onChange={(originCorner: MachineOriginCorner) => changeDraft({ originCorner })}
                />
              </Tooltip>
            </Form.Item>
          </div>
        </section>
        <section className={styles.group} aria-label={t(DEFAULT.MACHINE_PROFILES_GROUP_OPTIONS)}>
          <h3 className={styles.groupTitle}>
            <SettingOutlined aria-hidden />
            {t(DEFAULT.MACHINE_PROFILES_GROUP_OPTIONS)}
          </h3>
          <div className={styles.switchFields}>
            <label className={styles.switchField}>
              <Switch
                checked={draft.hasAirAssist}
                onChange={(hasAirAssist: boolean) => changeDraft({ hasAirAssist })}
              />
              <CloudOutlined aria-hidden />
              {t(DEFAULT.MACHINE_PROFILES_FIELD_AIR_ASSIST)}
            </label>
            <label className={styles.switchField}>
              <Switch
                checked={draft.hasHomingSwitches}
                onChange={(hasHomingSwitches: boolean) => changeDraft({ hasHomingSwitches })}
              />
              <HomeOutlined aria-hidden />
              {t(DEFAULT.MACHINE_PROFILES_FIELD_HOMING)}
            </label>
          </div>
        </section>
        {/* Rendered while collapsed, so an error on a field inside can open it with the field already in place. */}
        <Collapse
          className={styles.advanced}
          ghost
          size={ANTD_COLLAPSE_SIZE_SMALL}
          activeKey={openAdvancedKeys}
          onChange={(panelKeys: string[]) => setOpenAdvancedKeys(panelKeys)}
          items={[{
            key: ADVANCED_PANEL_KEY,
            label: t(DEFAULT.MACHINE_PROFILES_GROUP_ADVANCED),
            forceRender: true,
            children: <div className={styles.numberFields}>{renderNumberFields(ADVANCED_NUMBER_FIELDS)}</div>,
          }]}
        />
        {reportedLaserValues && <LaserReadingAlerts reportedValues={reportedLaserValues} />}
        <div className={styles.actions}>
          <Tooltip title={isConnected ? undefined : t(DEFAULT.MACHINE_PROFILES_READ_NEEDS_CONNECTION)}>
            {/* A plain wrapper: a disabled button fires no hover events, so the tooltip listens on the wrapper. */}
            <span className={styles.readButtonWrapper}>
              <Button disabled={!isConnected} icon={<ApiOutlined aria-hidden />} onClick={readDraftFromLaser}>
                {t(DEFAULT.MACHINE_PROFILES_READ_FROM_LASER)}
              </Button>
            </span>
          </Tooltip>
          <Button type={ANTD_BUTTON_TYPE_PRIMARY} onClick={saveDraft}>{t(DEFAULT.MACHINE_PROFILES_SAVE)}</Button>
        </div>
      </div>
    </Form>
  );
};

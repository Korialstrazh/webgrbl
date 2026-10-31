/**
 * The form of one machine profile. It edits a draft and stores it only on Save, after the profile checks pass; a
 * failed check shows its message under the field. "Read from connected laser" fills the draft with the values the
 * laser reports validly and shows what was read, with a warning when the laser reports laser mode off.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Button, Form, Input, InputNumber, Select, Switch } from 'antd';
import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ANTD_BUTTON_TYPE_PRIMARY,
  ANTD_FORM_ITEM_STATUS_ERROR,
  ANTD_FORM_LAYOUT_VERTICAL,
} from '../../../utils/antd.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getMachineProfileErrors } from '../../../utils/profiles/get.machine.profile.errors';
import { getReportedProfileFields } from '../../../utils/profiles/get.reported.profile.fields';
import { getValidlyReportedProfileValues } from '../../../utils/profiles/get.validly.reported.profile.values';
import type { MachineProfile } from '../../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfileFieldError } from '../../../utils/profiles/interfaces/MachineProfileFieldError';
import type { ReportedMachineProfileValues } from '../../../utils/profiles/interfaces/ReportedMachineProfileValues';
import { MACHINE_ORIGIN_CORNER } from '../../../utils/profiles/machine.profile.constants';
import type { MachineOriginCorner } from '../../../utils/profiles/machine.profile.constants';
import { selectGrblSettings, selectIsConnected } from '../../../utils/states/grbl.connection.state';
import { MachineProfileSaved } from '../../../utils/states/machine.profile.state';
import type { AppDispatch } from '../../../utils/states/new.store';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import { MACHINE_ORIGIN_CORNER_LABEL_KEY } from '../machine.profiles.dialog.constants';
import type { MachineProfileChanges } from './interfaces/MachineProfileChanges';
import type { ProfileFieldStatus } from './interfaces/ProfileFieldStatus';
import type { ProfileFormProps } from './interfaces/ProfileFormProps';
import type { ProfileNumberFieldDefinition } from './interfaces/ProfileNumberFieldDefinition';
import { LaserReadingAlerts } from './LaserReadingAlerts';
import styles from './styles.module.scss';

const FIELD_ID_SEPARATOR = '-';

const PROFILE_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  { field: 'maxPowerWatts', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_MAX_POWER },
  { field: 'workAreaXMm', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_X },
  { field: 'workAreaYMm', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_Y },
  { field: 'sValueMax', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX },
  { field: 'jogFeedRate', labelKey: DEFAULT.MACHINE_PROFILES_FIELD_JOG_FEED_RATE },
];

const NAME_FIELD: keyof MachineProfile = 'name';
const ORIGIN_CORNER_FIELD: keyof MachineProfile = 'originCorner';

/** An emptied number input holds NaN in the draft, which the profile checks reject; the input then shows nothing. */
const getInputNumberValue = (value: number): number | null => isFiniteNumber(value) ? value : null;

export const ProfileForm = ({ profile }: ProfileFormProps): ReactNode => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const formId: string = useId();
  const isConnected: boolean = useSelector(selectIsConnected);
  const grblSettings: Record<number, string> = useSelector(selectGrblSettings);
  const [draft, setDraft] = useState<MachineProfile>(profile);
  const [fieldErrors, setFieldErrors] = useState<MachineProfileFieldError[]>([]);
  const [reportedLaserValues, setReportedLaserValues] = useState<ReportedMachineProfileValues | undefined>(undefined);

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

    if (draftErrors.length) {
      return;
    }

    dispatch(new MachineProfileSaved({ profile: draft }));
  };

  const readDraftFromLaser = (): void => {
    // Only validly reported values reach the draft; every field the laser did not report keeps the draft's value.
    const reportedValues: ReportedMachineProfileValues = getValidlyReportedProfileValues(grblSettings);

    changeDraft(getReportedProfileFields(reportedValues));
    setReportedLaserValues(reportedValues);
  };

  return (
    <Form layout={ANTD_FORM_LAYOUT_VERTICAL} component={false}>
      <div className={styles.profileForm}>
        <Form.Item
          label={t(DEFAULT.MACHINE_PROFILES_FIELD_NAME)}
          htmlFor={getFieldId(NAME_FIELD)}
          {...getFieldStatus(NAME_FIELD)}
        >
          <Input
            id={getFieldId(NAME_FIELD)}
            value={draft.name}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => changeDraft({ name: changeEvent.target.value })}
          />
        </Form.Item>
        <div className={styles.numberFields}>
          {PROFILE_NUMBER_FIELDS.map(({ field, labelKey }: ProfileNumberFieldDefinition) => (
            <Form.Item key={field} label={t(labelKey)} htmlFor={getFieldId(field)} {...getFieldStatus(field)}>
              <InputNumber
                id={getFieldId(field)}
                className={styles.numberInput}
                value={getInputNumberValue(draft[field])}
                onChange={(value: number | null) => changeDraft({ [field]: value ?? Number.NaN })}
              />
            </Form.Item>
          ))}
        </div>
        <Form.Item label={t(DEFAULT.MACHINE_PROFILES_FIELD_ORIGIN_CORNER)} htmlFor={getFieldId(ORIGIN_CORNER_FIELD)}>
          <Select
            id={getFieldId(ORIGIN_CORNER_FIELD)}
            value={draft.originCorner}
            options={Object.values(MACHINE_ORIGIN_CORNER).map((originCorner: MachineOriginCorner) => ({
              value: originCorner,
              label: t(MACHINE_ORIGIN_CORNER_LABEL_KEY[originCorner]),
            }))}
            onChange={(originCorner: MachineOriginCorner) => changeDraft({ originCorner })}
          />
        </Form.Item>
        <label className={styles.switchField}>
          <Switch checked={draft.hasAirAssist} onChange={(hasAirAssist: boolean) => changeDraft({ hasAirAssist })} />
          {t(DEFAULT.MACHINE_PROFILES_FIELD_AIR_ASSIST)}
        </label>
        <label className={styles.switchField}>
          <Switch
            checked={draft.hasHomingSwitches}
            onChange={(hasHomingSwitches: boolean) => changeDraft({ hasHomingSwitches })}
          />
          {t(DEFAULT.MACHINE_PROFILES_FIELD_HOMING)}
        </label>
        {reportedLaserValues && <LaserReadingAlerts reportedValues={reportedLaserValues} />}
        <div className={styles.actions}>
          <Button disabled={!isConnected} onClick={readDraftFromLaser}>
            {t(DEFAULT.MACHINE_PROFILES_READ_FROM_LASER)}
          </Button>
          <Button type={ANTD_BUTTON_TYPE_PRIMARY} onClick={saveDraft}>{t(DEFAULT.MACHINE_PROFILES_SAVE)}</Button>
        </div>
      </div>
    </Form>
  );
};

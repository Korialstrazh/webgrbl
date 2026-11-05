import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MachineProfilesDialog } from '.';
import {
  GRBL_CONNECTION_STATUS,
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_STATUS_POLL_INTERVAL_MS,
  SIMULATED_LASER_PORT_ID,
} from '../../utils/grbl/grbl.constants';
import type { GrblFirmwareIdentity } from '../../utils/grbl/interfaces/GrblFirmwareIdentity';
import { ANSWER_SETTLE_MS } from '../../utils/grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { MachineProfile } from '../../utils/profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../../utils/profiles/interfaces/MachineProfilesDocument';
import { MACHINE_PROFILES_DOCUMENT_VERSION } from '../../utils/profiles/machine.profile.constants';
import { MACHINE_PROFILES_STORAGE } from '../../utils/profiles/machine.profiles.storage';
import { newMachineProfile } from '../../utils/profiles/new.machine.profile';
import {
  ConnectionEstablished,
  ConnectionStatusChanged,
  ConnectRequested,
  DisconnectRequested,
  SerialPortSelected,
} from '../../utils/states/grbl.connection.state';
import type { AppToast } from '../../utils/states/interfaces/AppToast';
import {
  ActiveMachineProfileSelected,
  MachineProfileSaved,
  selectActiveMachineProfile,
  selectMachineProfiles,
  selectMachineProfilesDocument,
} from '../../utils/states/machine.profile.state';
import { newStore } from '../../utils/states/new.store';
import type { AppStore } from '../../utils/states/new.store';
import { TOAST_SEVERITY } from '../../utils/states/toast.constants';
import { selectToasts } from '../../utils/states/toast.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';

const NAME_LABEL = 'Name';
const MAX_POWER_LABEL = 'Laser power (W)';
const WORK_AREA_X_LABEL = 'Work area width (mm)';
const WORK_AREA_Y_LABEL = 'Work area height (mm)';
const S_VALUE_MAX_LABEL = 'Maximum S value ($30)';
const SAVE_LABEL = 'Save';
const DELETE_CONFIRM_LABEL = 'Yes, delete';
const NEW_PROFILE_LABEL = 'New profile';
const READ_FROM_LASER_LABEL = 'Read from connected laser';
const IMPORT_LABEL = 'Import profiles file';
const EXPORT_LABEL = 'Export';
const ACTIVE_PATTERN = /Active/;
const SPARE_PROFILE_NAME = 'Spare laser';
const WORKSHOP_NAME = 'Workshop laser';
const GARAGE_NAME = 'Garage laser';
const FIRST_SAVED_NAME = 'First saved name';
const SECOND_SAVED_NAME = 'Second saved name';
const IMPORTED_NAME = 'Imported laser';
const EDITED_WORK_AREA_X_MM = 300;
const EDITED_MAX_POWER_WATTS = 20;
const TOO_WIDE_WORK_AREA_MM = 6000;
const WORK_AREA_X_ERROR_TEXT = 'Work area width must be greater than 0 and at most 5000 mm';
const NAME_ERROR_TEXT = 'Enter a name for the machine';
const STORED_WORK_AREA_X_MM = 600;
const STORED_WORK_AREA_Y_MM = 500;
const STORED_S_VALUE_MAX = 255;
const SIMULATOR_WORK_AREA_MM = 400;
const SIMULATOR_S_VALUE_MAX = 1000;
const READ_SUMMARY_TEXT = 'Read from the laser. Press Save to keep these values.';
const READ_WIDTH_TEXT = 'Work area width (mm): 400';
const READ_HEIGHT_TEXT = 'Work area height (mm): 400';
const READ_S_VALUE_MAX_TEXT = 'Maximum S value ($30): 1000';
const READ_PARTIAL_HEIGHT_TEXT = 'Work area height (mm): 200';
const READ_HOMING_ON_TEXT = 'Homing switches: yes';
const READ_NOTHING_TEXT = 'The laser reported none of these settings, so the form was not changed.';
const PARTIAL_WORK_AREA_Y_MM = 200;
const DRAFT_WORK_AREA_X_MM = 300;
const LASER_MODE_OFF_PATTERN = /reports laser mode off/;
const LASER_MODE_OFF_TEXT = 'This laser reports laser mode off ($32=0), so it may burn spots where it slows down. Send '
  + '$32=1 in the console to turn it on.';
const STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const EXPORT_FILE_NAME = 'webgrbl-machine-profiles.json';
const EXPORT_OBJECT_URL = 'blob:machine-profiles';
const MALFORMED_JSON = '{"version": 1, "profiles": [';
const NOT_A_PROFILES_DOCUMENT_JSON = '{"profiles": "none"}';
const IMPORT_FILE_NAME = 'profiles.json';
const FIRMWARE_IDENTITY: GrblFirmwareIdentity = { firmwareName: 'Grbl', version: '1.1h', vendorText: '' };
const LASER_MODE_OFF_SETTINGS: Record<number, string> = { 130: '400', 131: '400', 30: '1000', 22: '0', 32: '0' };
const SETTINGS_WITHOUT_X_TRAVEL_AND_LASER_MODE: Record<number, string> = { 131: '200', 22: '1' };
const SETTINGS_WITHOUT_PROFILE_VALUES: Record<number, string> = { 0: '10' };
const RX_BUFFER_SIZE = 127;

const renderDialog = (store: AppStore, onClose: () => void = vi.fn()): void => {
  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <MachineProfilesDialog isOpen onClose={onClose} />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
};

const saveProfile = (store: AppStore, overrides: Partial<MachineProfile>): MachineProfile => {
  const profile: MachineProfile = newMachineProfile(overrides);

  act(() => {
    store.dispatch(new MachineProfileSaved({ profile }));
  });

  return profile;
};

const changeField = (label: string, value: string | number): void => {
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } });
};

const clickButton = (label: string): void => {
  fireEvent.click(screen.getByRole('button', { name: label }));
};

const getToastsWithKey = (store: AppStore, messageKey: string): AppToast[] =>
  selectToasts(store.getState()).filter((toast: AppToast) => toast.messageKey === messageKey);

const importFileText = async (text: string): Promise<void> => {
  const file: File = new File([text], IMPORT_FILE_NAME, { type: 'application/json' });

  await act(async () => {
    fireEvent.change(screen.getByLabelText(IMPORT_LABEL), { target: { files: [file] } });
  });
};

const newDocumentText = (profiles: MachineProfile[]): string => JSON.stringify({
  version: MACHINE_PROFILES_DOCUMENT_VERSION,
  activeProfileId: undefined,
  profiles,
} satisfies MachineProfilesDocument);

describe(MachineProfilesDialog.name, () => {
  it('creates and saves a profile without activating it', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    changeField(NAME_LABEL, WORKSHOP_NAME);
    changeField(WORK_AREA_X_LABEL, EDITED_WORK_AREA_X_MM);
    clickButton(SAVE_LABEL);

    expect(selectMachineProfiles(store.getState())).toEqual([
      expect.objectContaining({ name: WORKSHOP_NAME, workAreaXMm: EDITED_WORK_AREA_X_MM }),
    ]);
    expect(selectActiveMachineProfile(store.getState())).toBeUndefined();
  });

  it('sets the selected profile active', () => {
    const store: AppStore = newStore();

    saveProfile(store, { name: WORKSHOP_NAME });
    renderDialog(store);
    clickButton(`Make ${WORKSHOP_NAME} active`);

    expect(selectActiveMachineProfile(store.getState())?.name).toBe(WORKSHOP_NAME);
    expect(screen.getByRole('button', { name: ACTIVE_PATTERN })).toHaveTextContent(WORKSHOP_NAME);
  });

  it('edits and saves an existing profile in place', () => {
    const store: AppStore = newStore();
    const workshopProfile: MachineProfile = saveProfile(store, { name: WORKSHOP_NAME });

    renderDialog(store);
    changeField(MAX_POWER_LABEL, EDITED_MAX_POWER_WATTS);
    clickButton(SAVE_LABEL);

    expect(selectMachineProfiles(store.getState())).toEqual([
      { ...workshopProfile, maxPowerWatts: EDITED_MAX_POWER_WATTS },
    ]);
  });

  it('keeps a new profile out of the store until it is saved', () => {
    const store: AppStore = newStore();
    const workshopProfile: MachineProfile = saveProfile(store, { name: WORKSHOP_NAME });

    renderDialog(store);
    clickButton(NEW_PROFILE_LABEL);
    changeField(NAME_LABEL, GARAGE_NAME);

    expect(selectMachineProfiles(store.getState())).toEqual([workshopProfile]);

    clickButton(SAVE_LABEL);

    expect(selectMachineProfiles(store.getState()).map((profile: MachineProfile) => profile.name))
      .toEqual([WORKSHOP_NAME, GARAGE_NAME]);
  });

  it('discards unsaved edits when another profile is selected', () => {
    const store: AppStore = newStore();

    saveProfile(store, { name: WORKSHOP_NAME });
    saveProfile(store, { name: GARAGE_NAME });
    renderDialog(store);
    changeField(NAME_LABEL, IMPORTED_NAME);
    fireEvent.click(screen.getByRole('button', { name: GARAGE_NAME }));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(WORKSHOP_NAME) }));

    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue(WORKSHOP_NAME);
  });

  it('blocks Save on an invalid field and shows the localized errors', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    changeField(NAME_LABEL, '');
    changeField(WORK_AREA_X_LABEL, TOO_WIDE_WORK_AREA_MM);
    clickButton(SAVE_LABEL);

    expect(screen.getByText(WORK_AREA_X_ERROR_TEXT)).toBeInTheDocument();
    expect(screen.getByText(NAME_ERROR_TEXT)).toBeInTheDocument();
    expect(selectMachineProfiles(store.getState())).toEqual([]);
  });

  it('saves a new profile twice in one session without duplicating it', () => {
    const store: AppStore = newStore();

    renderDialog(store);
    clickButton(NEW_PROFILE_LABEL);
    changeField(NAME_LABEL, FIRST_SAVED_NAME);
    clickButton(SAVE_LABEL);
    const firstSavedId: string | undefined = selectMachineProfiles(store.getState()).at(0)?.id;
    changeField(NAME_LABEL, SECOND_SAVED_NAME);
    clickButton(SAVE_LABEL);

    const profiles: MachineProfile[] = selectMachineProfiles(store.getState());

    expect(profiles).toHaveLength(1);
    expect(profiles.at(0)?.name).toBe(SECOND_SAVED_NAME);
    expect(profiles.at(0)?.id).toBe(firstSavedId);
  });

  it('deletes the selected profile after the confirmation', () => {
    const store: AppStore = newStore();
    const spareProfile: MachineProfile = newMachineProfile({ name: SPARE_PROFILE_NAME });

    saveProfile(store, { name: WORKSHOP_NAME });
    act(() => {
      store.dispatch(new MachineProfileSaved({ profile: spareProfile }));
    });
    renderDialog(store);
    clickButton(`Delete ${WORKSHOP_NAME}`);
    clickButton(DELETE_CONFIRM_LABEL);

    expect(selectMachineProfiles(store.getState())).toEqual([spareProfile]);
  });

  it('keeps Delete disabled for the only profile', () => {
    const store: AppStore = newStore();

    saveProfile(store, { name: WORKSHOP_NAME });
    renderDialog(store);

    expect(screen.getByRole('button', { name: `Delete ${WORKSHOP_NAME}` })).toBeDisabled();
  });

  describe('with the simulated laser', () => {
    let store: AppStore;

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(async () => {
      await act(async () => {
        store.dispatch(new DisconnectRequested());
        await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
      });
      vi.useRealTimers();
    });

    it('reads 400 x 400 mm and S max 1000 from the laser into the form, and stores them only on Save', async () => {
      const storedProfile: MachineProfile = newMachineProfile({
        name: WORKSHOP_NAME,
        workAreaXMm: STORED_WORK_AREA_X_MM,
        workAreaYMm: STORED_WORK_AREA_Y_MM,
        sValueMax: STORED_S_VALUE_MAX,
      });

      MACHINE_PROFILES_STORAGE.storeDocument({
        version: MACHINE_PROFILES_DOCUMENT_VERSION,
        activeProfileId: storedProfile.id,
        profiles: [storedProfile],
      });
      store = newStore();
      renderDialog(store);

      expect(screen.getByRole('button', { name: READ_FROM_LASER_LABEL })).toBeDisabled();

      await act(async () => {
        store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
        store.dispatch(new ConnectRequested());
        await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
      });
      clickButton(READ_FROM_LASER_LABEL);

      expect(screen.getByLabelText(WORK_AREA_X_LABEL)).toHaveValue(String(SIMULATOR_WORK_AREA_MM));
      expect(screen.getByLabelText(WORK_AREA_Y_LABEL)).toHaveValue(String(SIMULATOR_WORK_AREA_MM));
      expect(screen.getByLabelText(S_VALUE_MAX_LABEL)).toHaveValue(String(SIMULATOR_S_VALUE_MAX));
      expect(screen.getByText(READ_SUMMARY_TEXT)).toBeInTheDocument();
      expect(screen.getByText(READ_WIDTH_TEXT)).toBeInTheDocument();
      expect(screen.getByText(READ_HEIGHT_TEXT)).toBeInTheDocument();
      expect(screen.getByText(READ_S_VALUE_MAX_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(LASER_MODE_OFF_PATTERN)).not.toBeInTheDocument();
      expect(selectActiveMachineProfile(store.getState())).toEqual(storedProfile);

      clickButton(SAVE_LABEL);

      expect(selectActiveMachineProfile(store.getState())).toEqual({
        ...storedProfile,
        workAreaXMm: SIMULATOR_WORK_AREA_MM,
        workAreaYMm: SIMULATOR_WORK_AREA_MM,
        sValueMax: SIMULATOR_S_VALUE_MAX,
      });
    });
  });

  describe('with reported settings', () => {
    const connectWithSettings = (store: AppStore, settings: Record<number, string>): void => {
      act(() => {
        store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
        store.dispatch(new ConnectionEstablished({
          connectionInfo: {
            identity: FIRMWARE_IDENTITY,
            rxBufferSize: RX_BUFFER_SIZE,
            settings,
            buildInfoLines: [],
          },
        }));
      });
    };

    it('warns in the dialog when the laser reports laser mode off', () => {
      const store: AppStore = newStore();

      renderDialog(store);
      connectWithSettings(store, LASER_MODE_OFF_SETTINGS);
      clickButton(READ_FROM_LASER_LABEL);

      expect(screen.getByText(LASER_MODE_OFF_TEXT)).toBeInTheDocument();
    });

    it('reads only the reported values and gives no laser mode warning without $32', () => {
      const store: AppStore = newStore();

      renderDialog(store);
      connectWithSettings(store, SETTINGS_WITHOUT_X_TRAVEL_AND_LASER_MODE);
      changeField(WORK_AREA_X_LABEL, DRAFT_WORK_AREA_X_MM);
      clickButton(READ_FROM_LASER_LABEL);

      expect(screen.getByLabelText(WORK_AREA_X_LABEL)).toHaveValue(String(DRAFT_WORK_AREA_X_MM));
      expect(screen.getByLabelText(WORK_AREA_Y_LABEL)).toHaveValue(String(PARTIAL_WORK_AREA_Y_MM));
      expect(screen.getByText(READ_PARTIAL_HEIGHT_TEXT)).toBeInTheDocument();
      expect(screen.getByText(READ_HOMING_ON_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(READ_WIDTH_TEXT)).not.toBeInTheDocument();
      expect(screen.queryByText(LASER_MODE_OFF_PATTERN)).not.toBeInTheDocument();
    });

    it('says nothing was read and leaves the form unchanged when the laser reports no profile values', () => {
      const store: AppStore = newStore();

      renderDialog(store);
      connectWithSettings(store, SETTINGS_WITHOUT_PROFILE_VALUES);
      changeField(WORK_AREA_X_LABEL, DRAFT_WORK_AREA_X_MM);
      clickButton(READ_FROM_LASER_LABEL);

      expect(screen.getByText(READ_NOTHING_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(READ_SUMMARY_TEXT)).not.toBeInTheDocument();
      expect(screen.getByLabelText(WORK_AREA_X_LABEL)).toHaveValue(String(DRAFT_WORK_AREA_X_MM));
    });
  });

  it('merges an imported file and gives a profile whose id is taken a new id', async () => {
    const store: AppStore = newStore();
    const workshopProfile: MachineProfile = saveProfile(store, { name: WORKSHOP_NAME });
    const importedProfile: MachineProfile = newMachineProfile({ name: IMPORTED_NAME });
    const clashingProfile: MachineProfile = { ...workshopProfile, name: GARAGE_NAME };

    renderDialog(store);
    await importFileText(newDocumentText([clashingProfile, importedProfile]));

    await waitFor(() => {
      expect(selectMachineProfiles(store.getState())).toHaveLength(3);
    });

    const [firstProfile, clashedProfile, addedProfile] = selectMachineProfiles(store.getState());

    expect(firstProfile).toEqual(workshopProfile);
    expect(clashedProfile).toEqual({ ...clashingProfile, id: expect.any(String) });
    expect(clashedProfile?.id).not.toBe(workshopProfile.id);
    expect(addedProfile).toEqual(importedProfile);
    expect(screen.getByRole('button', { name: IMPORTED_NAME })).toBeInTheDocument();
  });

  it.each([
    { fileKind: 'malformed JSON', text: MALFORMED_JSON },
    { fileKind: 'JSON that is not a profiles document', text: NOT_A_PROFILES_DOCUMENT_JSON },
  ])('rejects $fileKind with an error toast and changes nothing', async ({ text }) => {
    const store: AppStore = newStore();

    saveProfile(store, { name: WORKSHOP_NAME });

    const documentBefore: MachineProfilesDocument = selectMachineProfilesDocument(store.getState());

    renderDialog(store);
    await importFileText(text);

    await waitFor(() => {
      expect(getToastsWithKey(store, DEFAULT.TOAST_PROFILE_IMPORT_INVALID)).toEqual([
        expect.objectContaining({ severity: TOAST_SEVERITY.ERROR }),
      ]);
    });
    expect(selectMachineProfilesDocument(store.getState())).toBe(documentBefore);
  });

  describe('export', () => {
    const { createObjectURL, revokeObjectURL } = URL;

    afterEach(() => {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
      vi.restoreAllMocks();
    });

    it('downloads the profiles as a JSON file that reads back to the same profiles', async () => {
      const store: AppStore = newStore();
      const workshopProfile: MachineProfile = saveProfile(store, { name: WORKSHOP_NAME });
      const garageProfile: MachineProfile = saveProfile(store, { name: GARAGE_NAME });
      const exportedBlobs: Blob[] = [];
      const downloadFileNames: string[] = [];

      // jsdom has no object URLs and would try to navigate on the download link's click.
      URL.createObjectURL = (blob: Blob): string => {
        exportedBlobs.push(blob);

        return EXPORT_OBJECT_URL;
      };
      URL.revokeObjectURL = vi.fn();
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function recordDownload(
        this: HTMLAnchorElement,
      ): void {
        downloadFileNames.push(this.download);
      });

      renderDialog(store);
      clickButton(EXPORT_LABEL);

      expect(exportedBlobs).toHaveLength(1);
      expect(downloadFileNames).toEqual([EXPORT_FILE_NAME]);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(EXPORT_OBJECT_URL);

      const exportedText: string = await exportedBlobs[0]?.text() ?? '';

      expect(JSON.parse(exportedText)).toEqual({
        version: MACHINE_PROFILES_DOCUMENT_VERSION,
        profiles: [workshopProfile, garageProfile],
      });
    });
  });

  it('marks the active profile in the list', () => {
    const store: AppStore = newStore();
    const garageProfile: MachineProfile = saveProfile(store, { name: GARAGE_NAME });

    saveProfile(store, { name: WORKSHOP_NAME });
    act(() => {
      store.dispatch(new ActiveMachineProfileSelected({ profileId: garageProfile.id }));
    });
    renderDialog(store);

    const activeItem: HTMLElement = screen.getByRole('button', { name: ACTIVE_PATTERN });

    expect(within(activeItem).getByText(GARAGE_NAME)).toBeInTheDocument();
    expect(screen.getByLabelText(NAME_LABEL)).toHaveValue(GARAGE_NAME);
  });
});

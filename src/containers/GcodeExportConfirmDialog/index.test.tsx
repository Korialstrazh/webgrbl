import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { GcodeExportConfirmDialog } from '.';
import * as downloadModule from '../../utils/browser/download.text.file';
import { newProjectObject } from '../../utils/project/new.project.object';
import type { AppStore } from '../../utils/states/new.store';
import { GcodeExportRequested, selectIsGcodeExportConfirmationOpen } from '../../utils/states/toolpath.state';
import { AntdTestProvider } from '../../utils/test.support/antd.test.provider';
import { BedRegionTestHost } from '../../utils/test.support/bed.region.test.host';
import { newGcodeExportTestStore } from '../../utils/test.support/new.gcode.export.test.store';

const DIALOG_TITLE = 'Export G-code with warnings?';
const OBJECT_NAME = 'Name tag';
const TEXT_WARNING = 'Text is not converted to paths. In Inkscape use Path > Object to Path.';
const IMAGE_WARNING = 'Images are not engraved yet.';
const CONFIRM_LABEL = 'Export anyway';
const CANCEL_LABEL = 'Cancel';
const TEXT_AND_IMAGE_SVG_TEXT = '<svg xmlns="http://www.w3.org/2000/svg" width="10mm" height="10mm" viewBox="0 0 10 10">'
  + '<rect fill="none" stroke="#ff0000" width="10" height="10"/><text x="1" y="5">Hi</text>'
  + '<image width="2" height="2" href="data:image/png;base64,AAAA"/></svg>';

const renderDialogWithWarnings = async (): Promise<AppStore> => {
  const store: AppStore = await newGcodeExportTestStore({
    objects: [newProjectObject({ name: OBJECT_NAME, svgText: TEXT_AND_IMAGE_SVG_TEXT })],
  });

  render(
    <Provider store={store}>
      <AntdTestProvider>
        <BedRegionTestHost>
          <GcodeExportConfirmDialog />
        </BedRegionTestHost>
      </AntdTestProvider>
    </Provider>,
  );
  act(() => {
    store.dispatch(new GcodeExportRequested({ isWarningConfirmed: false }));
  });
  await screen.findByRole('dialog', { name: DIALOG_TITLE });

  return store;
};

describe(GcodeExportConfirmDialog.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists each affected object with its warning texts', async () => {
    vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

    await renderDialogWithWarnings();

    expect(screen.getByText(`${OBJECT_NAME}: ${TEXT_WARNING}`)).toBeInTheDocument();
    expect(screen.getByText(`${OBJECT_NAME}: ${IMAGE_WARNING}`)).toBeInTheDocument();
  });

  it('downloads nothing and closes on Cancel', async () => {
    const downloadSpy = vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);
    const store: AppStore = await renderDialogWithWarnings();

    fireEvent.click(screen.getByRole('button', { name: CANCEL_LABEL }));

    expect(selectIsGcodeExportConfirmationOpen(store.getState())).toBe(false);
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('downloads the G-code on Export anyway', async () => {
    const downloadSpy = vi.spyOn(downloadModule, 'downloadTextFile').mockImplementation(() => undefined);

    await renderDialogWithWarnings();
    fireEvent.click(screen.getByRole('button', { name: CONFIRM_LABEL }));

    await vi.waitFor((): void => {
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });
  });
});

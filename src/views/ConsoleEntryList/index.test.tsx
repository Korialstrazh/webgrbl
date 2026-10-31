import { render, screen } from '@testing-library/react';
import { ConsoleEntryList } from '.';
import { GRBL_REALTIME_COMMAND } from '../../utils/grbl/grbl.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { GRBL_CONSOLE_VIEW_DIRECTION } from '../../utils/states/grbl.console.view.direction';
import type { GrblConsoleViewEntry } from '../../utils/states/interfaces/GrblConsoleViewEntry';

const ENTRY_TIMESTAMP = 1_000;
const SENT_TEXT = 'G0X1';
const RECEIVED_TEXT = 'ok';
const SENT_PREFIX = '>';
const RECEIVED_PREFIX = '<';
const FEED_HOLD_LABEL = 'Feed hold';
const FEED_HOLD_TEXT = '!';
const RAW_ERROR_DETAIL = 'port exploded';
const LIST_ITEM_ROLE = 'listitem';
const SENT_ITEM_INDEX = 0;
const RECEIVED_ITEM_INDEX = 1;

const NEW_ENTRY: GrblConsoleViewEntry = {
  entryId: 0,
  direction: GRBL_CONSOLE_VIEW_DIRECTION.SENT,
  text: SENT_TEXT,
  realtimeCommand: undefined,
  isStatusReport: false,
  timestamp: ENTRY_TIMESTAMP,
  messageKey: undefined,
  messageParameters: undefined,
};

describe(ConsoleEntryList.name, () => {
  it('shows sent and received lines with their prefix and a class per direction', () => {
    render(
      <ConsoleEntryList
        entries={[
          NEW_ENTRY,
          { ...NEW_ENTRY, entryId: 1, direction: GRBL_CONSOLE_VIEW_DIRECTION.RECEIVED, text: RECEIVED_TEXT },
        ]}
      />,
    );

    const listItems: HTMLElement[] = screen.getAllByRole(LIST_ITEM_ROLE);
    const directionClassNames: Set<string> = new Set(listItems.map((listItem: HTMLElement) => listItem.className));

    expect(listItems[SENT_ITEM_INDEX]).toHaveTextContent(`${SENT_PREFIX}${SENT_TEXT}`);
    expect(listItems[RECEIVED_ITEM_INDEX]).toHaveTextContent(`${RECEIVED_PREFIX}${RECEIVED_TEXT}`);
    expect(directionClassNames.size).toBe(listItems.length);
  });

  it('labels realtime entries and translates app-added lines', () => {
    render(
      <ConsoleEntryList
        entries={[
          {
            ...NEW_ENTRY,
            direction: GRBL_CONSOLE_VIEW_DIRECTION.REALTIME,
            text: FEED_HOLD_TEXT,
            realtimeCommand: GRBL_REALTIME_COMMAND.FEED_HOLD,
          },
          {
            ...NEW_ENTRY,
            entryId: 1,
            direction: GRBL_CONSOLE_VIEW_DIRECTION.ERROR,
            text: '',
            messageKey: DEFAULT.CONSOLE_RAW_ERROR,
            messageParameters: { detail: RAW_ERROR_DETAIL },
          },
        ]}
      />,
    );

    expect(screen.getByText(FEED_HOLD_LABEL)).toBeInTheDocument();
    expect(screen.getByText(RAW_ERROR_DETAIL)).toBeInTheDocument();
  });
});

# Connection and console

webgrbl talks to a GRBL laser over the Web Serial API. This page covers using it as a user and driving the engine from code. Design details: `docs/wiki/architecture/grbl-engine.md`.

## What it does

- Connects to a GRBL 1.1 machine (or a built-in simulated laser), runs the handshake (`$I`, `$$`) and shows live machine status.
- Shows a console of everything sent and received, and lets you type commands.
- Provides Stop, Reset and Unlock buttons.
- Exposes `GrblController` for streaming and checking G-code programs.

## Connect

1. Click the connection pill in the top bar to open its popover and pick a baud rate (115200 by default).
2. In the popover press **Choose port...** to pick a real USB serial port in the browser dialog, or **Simulated laser (no hardware)** to use the built-in fake machine, then press **Connect**. No port is chosen for you, not even the simulated laser, so Connect stays disabled until you pick one. The top-bar pill and the Status card both open this popover with **Connect...**.
3. When the handshake succeeds the pill shows the firmware, and the machine panel shows the machine state and position.

Chrome and Edge are required (Web Serial). A connection that gets no banner within 10 s fails with a toast.

### Linux

The user must be in the `dialout` group to open serial ports:

```
sudo usermod -aG dialout $USER
```

Then log out and back in. Only one application or browser tab can hold a port at a time; close other tabs, LaserGRBL-style tools and serial monitors if the port will not open.

## Console

- Open the console with the **Console** toggle in the status strip at the bottom; it opens over the bed.
- Type a command and press **Enter** to send it (for example `$$`, `$I` or `$J=G91X10F1000`).
- **ArrowUp** / **ArrowDown** step through the command history (last 100 entries). Typing after a recall starts the history again from the newest command.
- Commands may only contain plain ASCII letters, digits and symbols. A command with any other character (for example an umlaut or an accented letter) is not sent and the console shows an error: such bytes would reach GRBL as realtime commands, for example a laser power override. Characters inside a `;` or `( )` comment are fine, as comments are never sent.
- The status-report toggle hides the `?` polls and `<...>` replies, which otherwise fill the console every 250 ms.
- The console keeps the last 2,000 entries.

## Stop, Reset, Unlock

- Pressing **Escape** in the main view stops the machine like the STOP button, while connected. With a drawer open it also closes the drawer; with a popover or dialog open it only closes that. See [workbench-shell.md](workbench-shell.md).
- **Stop** sends a feed hold (which also cancels a jog), waits until the machine has come to rest (at most 2 s), then soft-resets. The position is kept and no alarm is raised.
- **Reset** soft-resets at once. Moving machines lose steps and raise `ALARM:3`, so home again afterwards.
- **Unlock** sends `$X` to clear an Alarm lock.

Leaving the page while the machine is running asks for confirmation. Disconnecting always performs a Stop first (about 50 ms when the machine is idle), so the laser never keeps moving after the port is closed.

If the controller resets itself (a homing failure, its reset button, a power dip), a warning toast says so: GRBL dropped what it had received, so any running job is stopped and the app forgets the commands GRBL will never answer.

## Using the engine from code

`GrblController` has no React or Redux dependency. Give it a `SerialTransport`: `WebSerialTransport` for hardware or `SimulatedLaserTransport` for tests and demos.

```ts
import { GrblController } from './utils/grbl/grbl.controller';
import { SimulatedLaserTransport } from './utils/grbl/simulated.laser.transport';

const controller = new GrblController(new SimulatedLaserTransport());

const removeListener = controller.addEventListener((event) => {
  if (event.kind === 'status-report') {
    console.log(event.status);
  } else if (event.kind === 'program-stopped-on-error') {
    console.warn(`Line ${event.lineNumber} failed with error ${event.errorCode}`);
  }
});

await controller.connect(); // resolves with GrblConnectionInfo, rejects if the handshake fails

const lines = ['G21', 'G90', 'G1 X10 F1000', 'G1 Y10'];

// Validate first in GRBL check mode: nothing moves. Resolves with the line errors found.
const lineErrors = await controller.checkProgram(lines);

if (lineErrors.length === 0) {
  const result = await controller.streamProgram(lines, { isStopOnErrorEnabled: true });
  console.log(result.isCompleted, result.lineErrors);
}

await controller.stopMachine(); // hold, wait for rest, soft reset; the position is kept
removeListener();
await controller.disconnect();
```

Notes:

- `lineNumber` in results and events is the 1-based index into the `lines` array you passed; blank and comment lines are skipped when sending but keep their number.
- Only one program or check runs at a time; a second call rejects with `GrblControllerBusyError`. While disconnected they reject with `GrblConnectionClosedError`.
- With `isStopOnErrorEnabled: true` the first `error:N` stops the machine and emits `program-stopped-on-error`; the promise resolves with `isCompleted: false`. With `false`, errors are collected and streaming continues.
- Lines with a character outside printable ASCII are never sent. They are reported as line errors with `NON_ASCII_LINE_ERROR_CODE` (-1, a client-side code, not a GRBL one). With stop-on-error on, such a line refuses the whole program before anything is sent; with it off, the line is skipped and reported. `checkProgram` lists them among its results. `sendConsoleCommand` throws `GrblNonAsciiLineError` instead.
- A reset the controller did by itself ends a running program with `isCompleted: false` and emits `controller-reset`.
- `disconnect()` runs the stop sequence first whenever the controller is connected.
- Other controls: `sendConsoleCommand(text)`, `resetMachine()`, `unlockMachine()`, `sendFeedHold()`, `sendCycleResume()`, `getLatestStatus()`.

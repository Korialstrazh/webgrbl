---
title: Connection & Firmware Variants (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Connection & Firmware Variants

How LaserGRBL reaches the engraver: the transports (USB serial, Telnet, WebSocket, built-in emulator), the connect/disconnect flow and handshake, firmware detection and the per-firmware "cores" (Grbl, Smoothieware, Marlin, VigoWork), plus the connection-adjacent tools: Wi-Fi discovery and setup, firmware flashing, CH340 driver install and communication logs. Job streaming over an open connection is in [[lg-streaming]].

## Key Takeaways

- Every transport implements one tiny interface (`IComWrapper`: `Configure`, `Open`, `Close(auto)`, `IsOpen`, `Write(byte | byte[] | string)`, `ReadLineBlocking`, `HasData`). The core is line-oriented on RX (split on `\n`, trimmed) and byte/string-oriented on TX. Mirror this as a transport abstraction in webgrbl.
- "Connected" is not "port open": status goes `Disconnected → Connecting → <first status report state>`. The machine is considered connected only after the first `<...>` status report (or Marlin `X:` line) is parsed. No report within 10 s closes the port.
- On open LaserGRBL sends a soft reset `0x18` (default on, not for Smoothie), then `?`, then starts the status poll timer. 500 ms after the first real status it reads `$$` and `$I` on a private side queue.
- Firmware identity comes from the welcome line (`Grbl 1.1h ['$' for help]`, `GrblHAL ...`, `Grbl-Vigo:...`, `SimpleLaser ...`, a generic `<Name> X.Yz` regex) plus vendor lines (`Ortur ...`, `Aufero ...`, `OLF ...`, `[Machine:...]`, `[Software:...]`). The last known version is persisted and selects the error/alarm/setting text dictionaries.
- RX buffer size defaults to 127 bytes and grows only from trusted sources: `[OPT:...,<rx>]` from `$I` (forced) or the first `Bf:` status field if it is a known value (128/254/255/256/10240).
- The firmware "core" is a global setting that needs an app restart. Smoothie and Marlin force synchronous streaming and hide Grbl config/unlock. Marlin polls with `M114`. VigoWork uses a proprietary `0x88` status query and synthesises acks from counters.
- There is no automatic reconnect. A lost link (read exception, socket closed) closes the connection and flags `UnexpectedDisconnect` if a job was running. The next "Send" then offers the Resume dialog ([[lg-streaming]]).
- Browser constraints: Web Serial covers USB serial, but there is no raw TCP (Telnet needs a bridge), WebSocket works natively, and the OS-level tools (driver install, avrdude, ARP/ping LAN scan, `netsh` SSID lookup) need browser-native replacements or must be dropped.

## Features

### LG-CONN-01 Connection panel & protocol selection

- **What it does:** Picks the transport and shows only the fields that transport needs, in the left "connection" panel.
- **Where in the UI:** Settings dialog (Grbl > Settings), tab "Protocol", combo "Connection Protocol". The connection panel (`ConnectLogForm`) at the top left shows COM + Baud for serial, a single address box for Telnet ("IP:PORT") or WebSocket ("Socket URL"), and a read-only "Emulated Grbl v1.1#" label for the emulator.
- **Options & defaults:** `ComWrapper Protocol` = `UsbSerial` (choices: `UsbSerial`, `UsbSerial2`, `RJCPSerial`, `Telnet`, `LaserWebESP8266`, `Emulator`). `Telnet Address` = `127.0.0.1:23`. `Websocket URL` = `ws://127.0.0.1:81/`. `Serial Speed` = `115200`.
- **Behaviour & gotchas:** Changing the protocol in Settings takes effect on the next UI tick while disconnected (the panel polls the setting and re-applies). Every edit of port/baud/address is persisted immediately and pushed to the core via `Core.Configure(wrapper, params)`. A new wrapper instance is created only when the type changes. All inputs are disabled while connected. A small "info" button next to the combo opens `https://lasergrbl.com/configuration/#protocol`.
- **Upstream source:** [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`UpdateConf`, `ApplyConfig`, `RestoreConf`), [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) (`InitProtocolCB`), [`LaserGRBL/ComWrapper/IComWrapper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/IComWrapper.cs) (`WrapperType`)
- **webgrbl notes:** Status: done — see [[grbl-engine]]. Collapse the three serial variants into one "USB Serial (Web Serial)" choice and keep "WebSocket", "Emulator" and "Telnet via bridge". Put the protocol picker in the connection panel itself rather than buried in Settings. Persist per-protocol last values (IndexedDB/localStorage). Consider named connection profiles (machine + transport + baud) so users with several lasers switch in one click.

### LG-CONN-02 Serial port selection & baud rate

- **What it does:** Lists the OS COM ports and the selectable baud rates.
- **Where in the UI:** Connection panel: "COM" combo and "Baud" combo.
- **Options & defaults:** Baud list `4800, 9600, 19200, 38400, 57600, 115200, 230400, 256000, 460800, 921600`. Default `115200` (persisted as `Serial Speed`). Port default = last entry of the OS list, or the previously selected port if still present. Line settings are fixed: 8 data bits, no parity, 1 stop bit, no handshake, newline `\n`, write timeout 1000 ms.
- **Behaviour & gotchas:**
  - While disconnected, the port list is re-enumerated on each UI timer tick whenever the OS port count changes (hot-plug).
  - Port names that end in a non-digit get the last char stripped (issue #31, broken drivers that append garbage).
  - If opening fails with an IO error on a two-digit port (`COM23`), it retries once with the last digit removed, then rethrows the original error.
  - After opening, the in/out buffers are discarded.
- **Upstream source:** [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`InitPortCB`, `InitSpeedCB`, `TimerUpdate`), [`LaserGRBL/ComWrapper/UsbSerial.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/UsbSerial.cs) (`Open`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Web Serial has no port enumeration before a user gesture. Use `navigator.serial.requestPort()` (optionally with USB vendor filters for CH340 `0x1a86`, CP210x `0x10c4`, FTDI `0x0403`) and `getPorts()` for previously granted ports. Listen to `connect`/`disconnect` events instead of polling.
  - Ports have no COM names. Show USB VID/PID plus a user-assigned nickname.
  - `port.open({ baudRate, dataBits: 8, parity: 'none', stopBits: 1, flowControl: 'none', bufferSize })`. Raise `bufferSize` above the default 255 so long status bursts are not dropped.
  - Web Serial is Chromium-desktop only. Detect support and explain the fallbacks (WebSocket/bridge).

### LG-CONN-03 Serial driver variants & CH340 read workaround

- **What it does:** Offers three interchangeable serial implementations, kept as workarounds for buggy Windows USB-serial drivers.
- **Where in the UI:** Settings > Protocol > Connection Protocol: `UsbSerial` (default), `UsbSerial2`, `RJCPSerial`.
- **Options & defaults:** None beyond protocol choice.
- **Behaviour & gotchas:**
  - `UsbSerial` is .NET `SerialPort` with a Dispose fix for issue #990. `UsbSerial2` is an in-tree copy of the SerialPort sources (`ComWrapper/MySerial/`). `RJCPSerial` is the RJCP `SerialPortStream` library. Behaviour is otherwise identical: same 8N1 config, DTR/RTS handling, issue-#31 retry and logging.
  - CH340 self-fix: if the blocking `ReadLine` throws more than 5 IO exceptions, the RX loop switches to "poll `HasData()` first, then read" mode. It logs the CH340 driver version, which a background WMI query reads at startup from `Win32_PnPSignedDriver` (CH340 / wch.cn).
  - Any non-IO read exception closes the connection (`CloseCom(false)`).
- **Upstream source:** [`LaserGRBL/ComWrapper/UsbSerial.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/UsbSerial.cs), [`LaserGRBL/ComWrapper/UsbSerial2.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/UsbSerial2.cs), [`LaserGRBL/ComWrapper/RJCPSerial.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/RJCPSerial.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`WaitComLineOrDisconnect`, `GetCH340Version`)
- **webgrbl notes:** Status: not started. Not applicable as user-facing choices: Web Serial is a single implementation. Implement RX as a `ReadableStream` piped through a `TextDecoderStream` and a line splitter (`TransformStream`), and treat any read rejection or `done` as connection lost. Log the USB VID/PID instead of the driver version.

### LG-CONN-04 Telnet (raw TCP) transport

- **What it does:** Talks to Grbl over a raw TCP socket, for ESP8266/ESP32 Wi-Fi bridges, Ortur/Longer Wi-Fi boards, or ser2net.
- **Where in the UI:** Protocol `Telnet`. Connection panel address box labelled "IP:PORT".
- **Options & defaults:** `Telnet Address` = `127.0.0.1:23`. Accepts `ipv4:port`, `hostname:port` (DNS, first address), `[ipv6]:port`. A port is mandatory ("No port specified" error otherwise).
- **Behaviour & gotchas:**
  - Plain `TcpClient`, ASCII encoding, flush after every write. Despite the name there is no telnet option negotiation.
  - The RX read loop sleeps 1 ms when no line is available.
  - Hard reset (DTR/RTS) is not possible. Only soft reset `Ctrl-X` is reported in the open log.
  - The defaults `23` (Ortur, or `$305` from the machine config) and `8847` (Longer) come from [[#LG-CONN-18 Wi-Fi setup for Ortur / Longer machines|LG-CONN-18]] and [[#LG-CONN-17 Wi-Fi discovery (LAN scan)|LG-CONN-17]].
- **Upstream source:** [`LaserGRBL/ComWrapper/Telnet.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/Telnet.cs) (`Telnet`, `IPHelper.Parse`)
- **webgrbl notes:** Status: not started. Browsers cannot open raw TCP sockets: Direct Sockets is limited to Isolated Web Apps. Options:
  - Ship or document a tiny local WebSocket↔TCP bridge (websockify-style, or a webgrbl companion) and connect to it with the WebSocket transport.
  - Recommend firmware that natively serves WebSocket (FluidNC, ESP3D, grblHAL web builds).
  - Plain `ws://` from an `https://` PWA is blocked as mixed content, except for `localhost`. A LAN bridge needs `wss://` with a trusted cert, or the app must be served over http on the LAN. Document this clearly.

### LG-CONN-05 WebSocket transport (LaserWebESP8266)

- **What it does:** Connects to a Grbl-over-WebSocket bridge (the LaserWeb ESP8266 firmware convention, also used by the built-in WebSocket emulator).
- **Where in the UI:** Protocol `LaserWebESP8266`. Connection panel address box labelled "Socket URL".
- **Options & defaults:** `Websocket URL` = `ws://127.0.0.1:81/`.
- **Behaviour & gotchas:**
  - Text frames are sent for strings, and single bytes are sent as one-char text frames (realtime commands such as `?` and `0x18`). Byte arrays go as binary frames.
  - Incoming frames are decoded (text, or raw bytes via default encoding) and split on `\n`. An incomplete trailing fragment is kept and prefixed to the next frame.
  - The RX loop polls an internal queue every 1 ms. There is no reconnect or keep-alive logic.
- **Upstream source:** [`LaserGRBL/ComWrapper/LaserWebESP8266.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/LaserWebESP8266.cs) (`cln_OnMessage`, `ReadLineBlocking`); WebSocket library in `ComWrapper/WebSocket/` (websocket-sharp).
- **webgrbl notes:** Status: not started. The native `WebSocket` API covers this fully. Keep the frame-reassembly logic. Send realtime bytes as binary frames (`Uint8Array`), not as text: text frames encode bytes ≥ 0x80 (override commands `0x90`–`0x9D`, jog cancel `0x85`) as multi-byte UTF-8, which breaks them. Mind the mixed-content rule (`wss://` from an https origin). Add ping/heartbeat and an auto-reconnect option. Also consider FluidNC/ESP3D-specific WebSocket dialects as named presets.

### LG-CONN-06 Built-in Grbl emulator

- **What it does:** A fake Grbl v1.1 machine for trying LaserGRBL without hardware. It answers realistically and simulates motion time.
- **Where in the UI:** Protocol `Emulator` (connection panel shows "Emulated Grbl v1.1#"). Connecting opens a floating "Grbl Emulator v1.1#" window that cannot be closed and shows the last 30 emulator log lines. A hidden menu "ESP8266 > Grbl Emulator" (`MNEsp8266`, `Visible=false` in this build) starts a WebSocket emulator server at `ws://127.0.0.1:81/` for testing [[#LG-CONN-05 WebSocket transport (LaserWebESP8266)|LG-CONN-05]].
- **Options & defaults:** Emulated config is persisted to `%AppData%/LaserGRBL/GrblEmulator.v11.bin`. Defaults: `$0=10 $1=25 $2..$6=0 $10=1 $11=0.010 $12=0.002 $13=0 $20..$23=0 $24=25 $25=500 $26=250 $27=1 $30=1000 $31=0 $32=0 $100..$102=250 $110..$112=500 $120..$122=10 $130..$132=200`.
- **Behaviour & gotchas:**
  - On open it sends `Grbl 1.1# ['$' for help]`. The `#` build char makes LaserGRBL report vendor "Emulator".
  - Single-byte writes are realtime: `0x18` resets (clears the RX queue, re-sends the welcome), `?` returns a status, `!`/`~` set/clear Hold. A status looks like `<Idle|MPos:x,y,z>` with `|WCO:...` added once a WCO exists. State is Check / Hold / Run (RX queue not empty) / Idle.
  - Commands: `$$` (ok + all settings), `$n=v` (ok/error), `$C` toggles check mode (ok + `[Enabled]`/`[Disabled]`), `$H` (2 s sleep, position 0), `$I` (`[VER:1.1#.20220607:]`, `[OPT:V,15,1024]`, so the buffer auto-enlarges to 1024), `$J=...` jog, otherwise the G-code is parsed through `StatePositionBuilder.AnalyzeCommand`.
  - Motion time is accumulated and slept in chunks over 15 ms, so `ok`s pace like a real machine. Lines `version\n` and `{fb:n}\n` are swallowed.
  - Compile-time switches can inject random `error:2` or missing `ok`s (both off).
- **Upstream source:** [`LaserGRBL/GrblEmulator/Grblv11Emulator.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblEmulator/Grblv11Emulator.cs), [`LaserGRBL/GrblEmulator/WebsocketEmulator.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblEmulator/WebsocketEmulator.cs), [`LaserGRBL/GrblEmulator/EmulatorUI.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblEmulator/EmulatorUI.cs), [`LaserGRBL/ComWrapper/Emulator.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/Emulator.cs)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - High value for a PWA. Implement the emulator in TS, in a Web Worker behind the same transport interface, so demos, onboarding, e2e tests and offline trials work with zero hardware.
  - Model the real RX buffer (127 B) and the 15/16-block planner, so flow control is actually exercised, and add fault injection (drop `ok`, random `error:N`, `ALARM:1`, unexpected reset, disconnect) as a dev panel.
  - Persist the emulated config in IndexedDB.

### LG-CONN-07 Connect / disconnect flow

- **What it does:** Opens the transport, starts the RX/TX worker threads, waits for the machine, and tears everything down on disconnect.
- **Where in the UI:** Connection panel power-plug toggle button (tooltip connect/disconnect). Menu Grbl > Connect / Disconnect (only one is visible at a time). Hotkeys: F12 = Connect/Disconnect toggle; separate Connect and Disconnect actions are unbound by default ([[lg-app-features]] hotkeys).
- **Options & defaults:** See [[#LG-CONN-08 Reset on connect (soft / hard)|LG-CONN-08]] and [[#LG-CONN-10 Post-connect configuration & machine-info query|LG-CONN-10]].
- **Behaviour & gotchas:**
  - **Connect (`OpenCom`):**
    1. Reset the CH340 fix flags and the buffer size to 127.
    2. Set status `Connecting` and record the start time.
    3. Open the transport.
    4. Start the RX and TX threads. On its first run TX does `StartTX`: `InternalReset(softResetSetting)`, which clears the queues and the console log, zeroes the buffer counter, resets overrides to 100 and sends `0x18` if enabled. The Smoothie core skips this. Then `InitializeBoard()` (`?`, or firmware-specific) and the status poll timer starts.
  - **Error on open:** status back to `Disconnected`, the transport is closed, and a message box titled "Cannot connect to device" shows the exception text.
  - **Connected:** the first parsed status report moves the state out of `Connecting`. That transition resets the failed-connection counter, schedules the config refresh, plays the "Connect" sound, and fires laser-life tracking (`LaserLifeHandler.OnConnect`, see [[lg-app-features]]).
  - **Disconnect (`CloseCom(user)`):**
    1. If a job is running, ask "File transfer in progress. Disconnect anyway?" (default No).
    2. Raise issue `ManualDisconnect` or `UnexpectedDisconnect` if running.
    3. Close the transport, zero the buffer counter, end the job timer, stop the threads, and clear the queues (the console log is kept).
    4. Status `Disconnected` plays the "Disconnect" sound and zeroes F/S.
  - App exit (with a job running) asks "exit anyway?", then `Exiting()` closes the connection.
  - The window title shows `LaserGRBL vX.Y.Z (for <Core>)` for non-Grbl cores.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`OpenCom`, `CloseCom`, `StartTX`, `InternalReset`, `SetStatus`, `HKConnectDisconnect`, `Exiting`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`BtnConnectDisconnectClick`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MnConnect_Click`, `MnDisconnect_Click`, `MainFormFormClosing`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Model the connection as an explicit state machine (`disconnected → opening → handshaking → connected → closing`) in a worker, with the UI subscribing to it.
  - Web Serial `requestPort()` must run inside a user gesture, so connect is always click-initiated. Auto-reconnect to a previously granted port is possible via `getPorts()`.
  - Block tab close with `beforeunload` while a job runs, and suggest the Screen Wake Lock API to keep the device awake (LaserGRBL uses a Windows "awake" API).
  - Do not clear the console on connect, unlike LaserGRBL. Add a separator line instead.

### LG-CONN-08 Reset on connect (soft / hard)

- **What it does:** Optionally resets the controller when the connection opens, so the session starts from a clean state.
- **Where in the UI:** Settings > Protocol: "Soft Reset [Ctrl-X]" ("send a soft-reset when the connection to grbl is opened") and "Hard Reset [DTR+RTS]" ("send a hard-reset ... [Position is lost!]").
- **Options & defaults:** `Reset Grbl On Connect` = `true` (sends `0x18` right after open). `HardReset Grbl On Connect` = `false` (opens the serial port with DTR and RTS asserted, which reboots Arduino-style boards via auto-reset).
- **Behaviour & gotchas:**
  - Firmware `Marlin` always opens with DTR asserted, regardless of the setting.
  - Smoothie never gets the soft reset on connect.
  - Hard reset only applies to the serial wrappers. Telnet and WebSocket log only `Ctrl-X`.
  - The open log line lists what was used, e.g. `Open COM3 @ 115200 baud DTR, RTS, Ctrl-X (UsbSerial)`.
  - Note the soft reset happens before `?`, so the welcome banner normally arrives right after connect and triggers version detection ([[#LG-CONN-09 Handshake: welcome & vendor message parsing|LG-CONN-09]]).
- **Upstream source:** [`LaserGRBL/ComWrapper/UsbSerial.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/UsbSerial.cs) (`Open`, `GetResetDiagnosticString`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`StartTX`, `SendBoardResetCommand`), [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs)
- **webgrbl notes:** Status: done — see [[grbl-engine]]. Web Serial supports `port.setSignals({ dataTerminalReady, requestToSend })`. Note that most boards auto-reset on open anyway because the OS raises DTR, and Web Serial cannot prevent the initial DTR edge on all platforms. Document "position is lost on connect" for Arduino boards. Offer a "reset now" button separately from the connect option.

### LG-CONN-09 Handshake: welcome & vendor message parsing

- **What it does:** Detects firmware family, version, vendor and model from the lines the board prints at boot or reset.
- **Where in the UI:** Indirect: the version drives feature availability, menus (Ortur/Longer menus), CSV-decoded console messages and the Settings warnings.
- **Options & defaults:** The detected version is persisted as `Last GrblVersion known` and reused at next start, before connecting.
- **Behaviour & gotchas:** RX lines are tested in this order (first match wins):
  1. `ok…` / `error…`: command reply ([[lg-streaming]]).
  2. `<...>`: status report.
  3. `GrblHAL X.Yb`: version from fixed char positions (8, 10, 11), `IsHAL=true`.
  4. `Grbl-Vigo:1.1f|Build:...`: vendor `Grbl-Vigo`, vendor version = text after the 2nd `:`.
  5. `Ortur …` / `Aufero …`: model line. Vendor info = line minus `Ready` and `!`, trimmed. Ortur = vendor contains "Ortur" or "Aufero".
  6. `OLF…`: Ortur firmware number (trim `.`, space, `:`), parsed as int for `OrturFWVersionNumber`.
  7. `[Machine:…]`: Longer model. Immediately sets version 1.1f.
  8. `[Software:…]`: Longer firmware string, sets version 1.1f.
  9. `SimpleLaser X.Yb`: vendor `SimpleLaser`.
  10. `Grbl X.Yb`: standard. Major/minor/build read from char positions 5, 7, 8, so only single-digit major and minor parse.
  11. Unknown welcome, only while no welcome has been seen: regex `(?<fw>[a-zA-Z]+)\s+(?<maj>\d+)\.(?<min>\d+)(?<build>\D)($|\s)`, vendor = `fw`.
  12. Any line containing `ok`: "broken ok" ([[lg-streaming]]).
  13. `ALARM:`: alarm.
  14. `[MSG:Get IP x.x.x.x]` / `[MSG:Connected with x.x.x.x]`: Wi-Fi IP capture ([[#LG-CONN-18 Wi-Fi setup for Ortur / Longer machines|LG-CONN-18]]).
  15. Otherwise a generic console message.

  Every welcome line also runs `DetectUnexpectedReset` (issue `UnexpectedReset` if a job was running) and `OnStartupMessage`: it clears the queue and pending lists (the log is kept), zeroes the buffer counter, ends the job timer and resets overrides to 100. This also covers a spontaneous board reset. Derived flags: `IsOrtur`, `IsLonger` (vendor contains "Longer" or "NanoDuo"), `IsHAL`, `IsLuckyWiFi` (Ortur Laser Master 3, Longer Nano, NanoDuo), `VendorName` (Ortur, Emulator for build `#`, Unknown). If no welcome was seen, the version is guessed from the first status report: `|` without `Pin:` means 1.1, `|` with `Pin:` means 1.0c, otherwise 0.9.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageReceivedLine`, `Manage*WelcomeMessage`, `ManageOrturModelMessage`, `ManageLonger*Message`, `OnStartupMessage`, `StatusReportVersion`, `GrblVersionInfo`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Port as a pure, unit-tested `classifyLine(line) → event` function with a fixture corpus of real banners (Grbl 0.9/1.1, grblHAL, FluidNC `Grbl 3.x [FluidNC ...]`, Ortur, Longer, Vigo, SimpleLaser, Smoothie, Marlin).
  - Use regexes instead of fixed char offsets so multi-digit versions (`Grbl 1.10`, grblHAL `1.1f.20240101`) work.
  - Persist the last machine identity per connection profile, not globally.

### LG-CONN-10 Post-connect configuration & machine-info query

- **What it does:** After connecting, reads the Grbl settings and build options, without showing them in the console.
- **Where in the UI:** Settings > Protocol: "Query $I at connect" ("detect some information from the machine (i.e. the machine rx buffer size)").
- **Options & defaults:** `Query MachineInfo ($I) at connect` = `true`.
- **Behaviour & gotchas:**
  1. On the `Connecting → connected` transition, a thread-pool job sleeps 500 ms (to let the startup messages finish).
  2. It runs `RefreshConfig(OnConnect)`: only if connected, no job running and state Idle or Alarm. The core temporarily swaps its send queue and log to private ones, enqueues `$$`, and waits up to 10 s for the reply ("No response received from grbl!" on timeout). It then collects lines until it has `ExpectedCount + 1` rows (34 for 1.1, 31 for 0.9, 23 otherwise), or 500 ms without a new line, or 5 s in total. `$n=v` lines are parsed into the configuration, which is saved to settings.
  3. It runs `RefreshMachineInfo()` the same way with `$I`: target 3 rows, same 500 ms / 5 s limits. `[VER:...]` is parsed but currently unused. `[OPT:<letters>,<blocks>,<rxbuffer>]`: if rxbuffer > 127, the buffer size is set to it (trusted, forced).
  - Marlin and Smoothie: Marlin overrides both refreshes to no-ops. Smoothie keeps them, but `$$` usually fails harmlessly.
  - Errors are only logged, never shown.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RefreshConfigOnConnect`, `RefreshConfig`, `RefreshMachineInfo`, `ManageOptMessage`, `EnlargeBuffer`, `GrblConfST.ExpectedCount`)
- **webgrbl notes:** Status: done — see [[grbl-engine]]. Implement as an async `request(cmd, {collectUntil, timeoutMs})` helper on the protocol layer that resolves on the `ok`. That is cleaner than queue swapping, and it can also serve [[lg-grbl-configuration]]. Also parse `$I` `[VER:]` for build date/name and `[OPT:]` letters (e.g. `V` variable spindle, `M` mist, `L` homing init lock) to gate UI. Run `$#` and `$G` too for WCO/modal state if useful.

### LG-CONN-11 Connection timeout, failed-connection help & connection-lost behaviour

- **What it does:** Detects a link that opens but never talks, guides users who repeatedly fail, and reacts to a dropped link.
- **Where in the UI:** Information message box "Error connecting your engraver..." with a help link. Issue-detector dialog ([[lg-streaming]]).
- **Options & defaults:** Connect timeout 10 000 ms (hard-coded). Help prompt after 3 consecutive failed connects (hard-coded).
- **Behaviour & gotchas:**
  - While in `Connecting`, the TX thread closes the port after 10 s without a status report. The RX loop then sees the closed port and the state returns to `Disconnected`.
  - Each `Connecting → Disconnected` increments `FailedConnectionCount`. At ≥ 3 the main form shows a help box linking `https://lasergrbl.com/usage/arduino-connection/` (serial) or `https://lasergrbl.com/usage/wifi-with-esp8266/` (Telnet/WebSocket).
  - A read exception (other than CH340-style IO errors), a socket close or the emulator closing triggers `CloseCom(false)`. That raises issue `UnexpectedDisconnect` if a job was running (plus Telegram notification and "Fatal" sound) and shows the Issue Detector dialog.
  - No automatic reconnect or retry. The user reconnects manually, and the next "Send" offers the Resume Job dialog with "Resume from last command sent" preselected.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ThreadTX`, `OnConnectTimeout`, `SetStatus`, `WaitComLineOrDisconnect`, `HasIncomingData`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`OnMachineStatus`)
- **webgrbl notes:** Status: done — see [[grbl-engine]].
  - Web Serial fires `navigator.serial` `disconnect` on unplug. Use it for an immediate "connection lost" banner.
  - Add opt-in auto-reconnect for previously granted ports (`getPorts()` + `connect` event), but never auto-resume a job.
  - Show the troubleshooting help inline (non-modal) with platform-specific hints: Linux `dialout` group, Chromium flags, CH340 on macOS. Make the 10 s handshake timeout configurable for slow-booting ESP32 boards.

### LG-CONN-12 Firmware type (core) selection

- **What it does:** Chooses the protocol dialect: `Grbl` (default, also covers grblHAL/Ortur/Longer/SimpleLaser), `Smoothie`, `Marlin`, `VigoWork`.
- **Where in the UI:** Settings > Protocol > "Firmware type" combo (info button → `https://lasergrbl.com/configuration/#firmware-type`).
- **Options & defaults:** `Firmware Type` = `Grbl`.
- **Behaviour & gotchas:**
  - The core object is built once at startup (`GrblCore`, `SmoothieCore`, `MarlinCore` or `VigoCore`). Changing the type asks "requires restart now" and calls `Application.Restart()`.
  - The core class controls: status query method, reset command, initial board wake-up, forced streaming mode, buffer size, response parsing, the Grbl Configuration and Unlock UI visibility (`UIShowGrblConfig`, `UIShowUnlockButtons`), true jogging support, and the homing/unlock commands. Details are in [[#LG-CONN-13 Smoothieware core|LG-CONN-13]]–[[#LG-CONN-15 VigoWork core|LG-CONN-15]].
  - Grbl-only version gates (all require ≥ 1.1): realtime overrides, `$J=` jogging, CSV code decoding, laser mode, auto cooling.
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (constructor core factory, `RefreshFormTitle`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`Firmware` enum, `SupportRTO`, `SupportTrueJogging`, `SupportCSV`, `SupportOverride`, `SupportLaserMode`), [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) (`InitCoreCB`, `BtnSave_Click`)
- **webgrbl notes:** Status: not started. Implement dialects as strategy objects (`GrblDialect`, `MarlinDialect`, ...) selected per connection profile and swappable without reload. Auto-suggest the dialect from the banner, e.g. switch to Marlin if `start`/`echo:` lines appear. Consider adding FluidNC (Grbl-compatible plus `$Config`) and grblHAL-specific extensions as first-class dialects.

### LG-CONN-13 Smoothieware core

- **What it does:** Drives Smoothieboard firmware through its Grbl-compatible mode.
- **Where in the UI:** Firmware type `Smoothie`. The Grbl Configuration menu and Unlock buttons are hidden.
- **Options & defaults:** Streaming mode forced to `Synchronous` (the setting is ignored).
- **Behaviour & gotchas:**
  - No soft reset on connect. `InitializeBoard` sends `\n` (byte 10) before the first `?`.
  - Reset sends the text line `reset\r\n` instead of `0x18`, written directly and bypassing the queue.
  - Status `F:` field parsed as `F:feed,spindle`.
  - `$X` unlock is a no-op. No `$J=` jogging: the old G-code jog emulation is used ([[lg-machine-control]]).
  - Status polling with `?` works as in Grbl.
- **Upstream source:** [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs)
- **webgrbl notes:** Status: not started. Low priority (few users). If supported, keep it as a dialect with these overrides. Smoothie also exposes a USB CDC port that Web Serial handles fine.

### LG-CONN-14 Marlin core

- **What it does:** Drives Marlin-based lasers, which have no realtime status channel.
- **Where in the UI:** Firmware type `Marlin`. The Grbl Configuration menu and Unlock buttons are hidden.
- **Options & defaults:** Streaming forced `Synchronous`. DTR always asserted on open.
- **Behaviour & gotchas:**
  - Position query: writes `M114\n` raw (not through the queue) on each poll tick, but only when the state is not `Run`. The reply `X:10.00 Y:0.00 Z:0.00 E:0.00 Count X:...` (any line starting `X:`) sets MPos and forces the state to `Idle`, or `Run` while a program is active.
  - Gotcha: the raw `M114`'s own `ok` can be consumed as the ack of a pending queued command.
  - No reset command (`SendBoardResetCommand` is empty), no `$X`, no `$$`/`$I` refresh, no `$J=` jogging.
  - Hang detection uses the activity timer: no reply or move for > 10 s, > 10 poll periods and no status for > 5 s.
  - At program end the state is forced to `Idle` (`ForceStatusIdle`), because Marlin is not polled during a run.
  - Realtime bytes (`!`, `~`, overrides) are still sent if triggered, but Marlin ignores them.
- **Upstream source:** [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs)
- **webgrbl notes:** Status: not started. If supported:
  - Send `M114` through the same ack-tracked queue to avoid the stray-`ok` bug.
  - Consider `M154 S1` (auto position report) where available.
  - Hide hold/resume/override UI, or map hold to `M0`/`M108`.
  - Parse `echo:` / `start` banner lines for auto-detection.

### LG-CONN-15 VigoWork core

- **What it does:** Supports VigoTec engravers running the proprietary "Grbl-Vigo" firmware.
- **Where in the UI:** Firmware type `VigoWork`.
- **Options & defaults:** Buffer size fixed at 127.
- **Behaviour & gotchas:**
  - Status query is the realtime byte `0x88` (instead of `?`). Status replies look like `<VSta:n|SBuf:received,managed,error|LTC:...>`.
  - Acks are synthesised: for each increment of `managed` the core calls the ok handler, and for each increment of `error` it injects `error:99`. A counter decrease is treated as a firmware reset and zeroes the old counters.
  - Job begin enqueues the magic line `>Ofk9gsd8IKjKBahP0OGS9BrhZCPeWCBALCbyGf` before the header. Job end enqueues `G0X0Y0M5` and `>NPredMjdFaeaJajf6OHy:hkRUygcpBXwtV` after the footer.
  - Outside a job, sent commands are marked `ok` immediately and do not count toward the buffer.
  - `VSta` transitioning 2→0 ends "in job" mode.
  - Standard `<...>` reports and `ok` lines are still handled by the base core.
- **Upstream source:** [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs)
- **webgrbl notes:** Status: not started. Niche, legacy hardware. Defer. If implemented, isolate it entirely in a dialect plugin, and document that the magic strings are copied as-is from LaserGRBL without known semantics.

### LG-CONN-16 Version-dependent message dictionaries

- **What it does:** Picks localized-text CSV tables (setting names/units/descriptions, error and alarm texts) that match the detected firmware.
- **Where in the UI:** Console decoding ([[lg-streaming]]), Grbl configuration dialog ([[lg-grbl-configuration]]).
- **Options & defaults:** Fallback is `setting_codes.v1.1.csv`, `error_codes.csv`, `alarm_codes.csv`.
- **Behaviour & gotchas:**
  - Selection rules:

    | Machine | Settings CSV | Error/alarm CSV |
    | --- | --- | --- |
    | Ortur + HAL | `setting_codes.ortur.GrblHal.csv` | `*.ortur.GrblHal.csv` |
    | Ortur OLF ≥ 170 | `ortur.v1.7.x` | default |
    | Ortur OLF ≥ 150 | `ortur.v1.5.x` | default |
    | Other Ortur | `ortur.v1.4.x` | default |
    | Longer `NanoDuo` | `longer.nanoduo` | `*.longer.nanoduo.csv` |
    | Anything else | `setting_codes.v{major}.{minor}.csv` (v0.8, v0.9, v1.1 exist) | default |

  - Reloaded whenever the detected version changes, and at startup from the persisted last version.
  - Decoding is only applied when the version is ≥ 1.1 (`SupportCSV`).
- **Upstream source:** [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`CSVD.LoadAppropriateCSV`), [`LaserGRBL/CSV/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/) (`error_codes.csv`, `alarm_codes.csv`, `setting_codes.*.csv`)
- **webgrbl notes:** Status: not started. Import these tables as typed JSON modules or i18n resources, keyed by firmware profile, and bundle them so they work offline. Add grblHAL and FluidNC tables. Unlike LaserGRBL, decode codes for 0.9 too, since the numeric error codes are still meaningful there.

### LG-CONN-17 Wi-Fi discovery (LAN scan)

- **What it does:** Scans the local subnet for Wi-Fi engravers and fills in the address.
- **Where in the UI:** Grbl > "Wi-Fi Discovery". Visible only when the protocol is Telnet or WebSocket, enabled only while disconnected. The dialog has a port field, Scan/Stop, a progress label ("Fast scan: n/N", "Deep scan: n/N", "Scan finished/aborted"), a result list (IP, ping, host name, MAC, port check) and a Connect button (or double-click).
- **Options & defaults:** Port default: Telnet → `23` (`8847` if the last machine was Longer), WebSocket → `81`, otherwise `666`.
- **Behaviour & gotchas:**
  - Uses the first up NIC with a gateway and an IPv4 address, and scans every host in its subnet.
  - Fast scan: async ICMP ping to each host (5 s timeout, TTL 16), pausing 100 ms every 16 pings. Responders are listed.
  - Deep scan, in parallel per responder: ping RTT, ARP MAC (`SendARP`), reverse DNS host name, and a TCP connect test on the port (5 s timeout) that reports available or "Failed!".
  - Selecting a result returns `ip:port` (Telnet) or `ws://ip:port/` (WebSocket), puts it in the address box and auto-connects if possible.
- **Upstream source:** [`LaserGRBL/WiFiDiscovery/DiscoveryForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiDiscovery/DiscoveryForm.cs), [`LaserGRBL/WiFiDiscovery/IPAddressHelper.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiDiscovery/IPAddressHelper.cs) (`ScanIP`, `IPSegmentScanner.FastScan`, `ScanResult.DeepScan`), [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) (`ConfigFromDiscovery`)
- **webgrbl notes:** Status: not started.
  - Browsers cannot ping, ARP, resolve reverse DNS, read the local subnet, or open raw TCP.
  - Alternative: probe a user-entered subnet (e.g. `192.168.1.0/24`) with parallel WebSocket or HTTP `fetch` attempts on the device's web port, with short timeouts. This is slow, rate-limited and blocked from https origins by mixed content and Private Network Access rules.
  - Better: support mDNS names (`fluidnc.local`, `esp3d.local`) typed by the user, remember known devices, and let a local bridge/companion do discovery.

### LG-CONN-18 Wi-Fi setup for Ortur / Longer machines

- **What it does:** Writes the home Wi-Fi credentials to Wi-Fi-capable Ortur or Longer boards over USB, waits for the machine to report its IP, then switches LaserGRBL to Telnet.
- **Where in the UI:** Auto prompt "Configure machine for WiFi?" ("It appears that you are the lucky owner of {model}...", buttons "Yes please!", "Do not show again", "Cancel"). Menus "Ortur > Configure WiFi" and "Longer > Configure WiFi" (visible when `IsLuckyWiFi` and a serial protocol is selected, enabled when config can be read/written). The config dialog has SSID, password (hold the eye icon to reveal), Write, Help, and a wait label with a seconds counter.
- **Options & defaults:** `Suppress WiFI Prompt Message` = `false`. The prompt shows at most once per session, when the machine is `IsLuckyWiFi`, the protocol is not Telnet/WebSocket, and the state is Idle/Alarm with no job.
- **Behaviour & gotchas:**
  - The SSID is pre-filled from Grbl `$74` (Ortur), else from `netsh wlan show interfaces` (the current Windows SSID). The password is pre-filled from `$75`. Write is enabled only when both are non-empty.
  - **Ortur:** enqueues `$74=<ssid>`, `$75=<password>`, `$WRS` (case preserved), and waits for the queue to drain. The IP comes from `[MSG:Get IP a.b.c.d]`. The Telnet port is `$305` (default `23`).
  - **Longer:** enqueues `$radio/mode=sta`, `$sta/ssid=<ssid>`, `$sta/password=<password>`, `$wifi/begin` (no wait). The IP comes from `[MSG:Connected with a.b.c.d]`. Port `8847`.
  - The dialog polls for the detected IP for up to 10 s. On success: "Detected machine IP ... disconnect USB and connect via WiFi?". OK sets the protocol to Telnet and fills `ip:port`, but does not auto-connect. Timeout message: "Unable to establish a connection: machine not connected to the WiFi network or IP address not assigned correctly...".
  - Help links: `https://lasergrbl.com/ortur-manuals/#configure-wifi`, `https://lasergrbl.com/longer-manuals/#configure-wifi`.
  - Write errors are ignored.
- **Upstream source:** [`LaserGRBL/WiFiConfigurator/OrturWiFiConfig.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiConfigurator/OrturWiFiConfig.cs), [`LaserGRBL/WiFiConfigurator/OrturWiFiConfigPrompt.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiConfigurator/OrturWiFiConfigPrompt.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`WriteWiFiConfig`, `WriteOrturWiFi`, `WriteLongerWiFi`, `ManageStaIPMessage`, `ManageLongerIPMessage`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`PromptForWiFi`, `ShowWiFiConfig`)
- **webgrbl notes:** Status: not started.
  - Sending the commands over Web Serial works unchanged. The browser cannot read the current SSID, so the user types it.
  - The result is a Telnet endpoint, which a browser cannot use without a bridge ([[#LG-CONN-04 Telnet (raw TCP) transport|LG-CONN-04]]). Say so before offering the feature, or check whether these boards also expose WebSocket.
  - Never log the password to the console or the comm log. LaserGRBL's comm log would capture it.

### LG-CONN-19 Grbl firmware flashing

- **What it does:** Flashes a Grbl `.hex` onto an ATmega328P Arduino (Uno/Nano) with the bundled avrdude.
- **Where in the UI:** Tools > "Flash Grbl Firmware" (enabled only while disconnected). The dialog has Target (Arduino Uno / Arduino Nano), Firmware, Port, Baud Rate, OK/Cancel, info links, and the warnings "Warning! This operation can damage your hardware." and "This procedure is not intended for Ortur Engraver!".
- **Options & defaults:**
  - Bundled firmware: `01-v1.1h-original-20190825.hex`, `02-v1.1h-custom, XY Homing-20190830.hex`, `03-v1.1f-original-20170801.hex` (displayed as `<version> <source> [<date>]`), plus "--- select custom firmware ---" to browse for a `.hex`.
  - Baud default 115200. Choosing target Uno sets 115200, Nano sets 57600 (old bootloader). Baud list `4800`–`921600` (no 256000).
  - Port list as in LG-CONN-02.
- **Behaviour & gotchas:**
  - Confirms with "Are you sure to flash a new firmware?".
  - Runs `Firmware\avrdude.exe -patmega328p -b<baud> -P<COM> -carduino -Uflash:w:"<hex>":i` and waits for it to exit. Exit code 0 gives "Firmware flashed succesfull!", anything else "Error: cannot flash firmware.".
  - Info links: `https://lasergrbl.com/usage/flash/#target`, `#firmware`.
- **Upstream source:** [`LaserGRBL/Firmware/FlashGrbl.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Firmware/FlashGrbl.cs), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`flashGrblFirmwareToolStripMenuItem_Click`)
- **webgrbl notes:** Status: not started.
  - No avrdude in a browser, but STK500v1 (Arduino bootloader) can be implemented over Web Serial: toggle DTR to enter the bootloader, then sync, load address, program page, verify. Prior art: avrgirl-arduino and `stk500` JS ports, web-based flashers.
  - ESP32 boards (FluidNC, grblHAL) can be flashed with Espressif's `esptool-js`.
  - Bundle a few vetted hex files, or fetch them from releases with checksums. Keep the strong hardware-damage warning and an "Ortur/branded boards: don't" guard keyed on the detected vendor.

### LG-CONN-20 CH340 driver install

- **What it does:** Launches the bundled WCH CH340/CH341 USB-serial driver installer, for clones whose COM port does not appear.
- **Where in the UI:** Tools > "Install CH340 Driver".
- **Options & defaults:** None.
- **Behaviour & gotchas:** Starts `Driver\CH341SER.EXE`. If that fails, opens a web search for "ch340 drivers".
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`installCH340DriverToolStripMenuItem_Click`), [`LaserGRBL/Driver/CH341SER.EXE`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Driver/CH341SER.EXE)
- **webgrbl notes:** Status: not started. A web app cannot install drivers. Replace with a help page: CH340 is built into Linux and recent macOS/Windows, plus a link to the official WCH download for older Windows. If `requestPort()` shows no device, link to this page. A possible improvement is a "USB device seen, but no serial interface" hint via WebUSB enumeration.

### LG-CONN-21 Session log

- **What it does:** Keeps a rolling diagnostic log of app and protocol events: connect/close, status changes, detected versions, issues, exceptions.
- **Where in the UI:** "?" (help) menu > "Open session log" (enabled when the file exists, opens in the default viewer).
- **Options & defaults:** File `%AppData%/LaserGRBL/sessionlog.txt`, trimmed to the last 1000 lines at app start. Always on.
- **Behaviour & gotchas:**
  - Line format: `dd/MM/yyyy HH:mm:ss.fff<TAB>context padded to 12<TAB>message`. Multi-line messages are split.
  - Program start/stop banners include the version and 32/64-bit.
  - Written asynchronously by a background thread.
- **Upstream source:** [`LaserGRBL/Logger/Logger.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger/Logger.cs), [`LaserGRBL/Logger/AsyncLogFile.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger/AsyncLogFile.cs) (`RotateLog`)
- **webgrbl notes:** Status: not started. Keep a ring buffer in IndexedDB (e.g. the last N thousand entries) with a "Download diagnostics" button that bundles session log, comm log, app version, browser UA and machine identity for bug reports. Mask secrets (Wi-Fi passwords, Telegram codes).

### LG-CONN-22 Extended communication log

- **What it does:** Records every byte or line sent and received, for troubleshooting.
- **Where in the UI:** "?" menu > "Activate extended log" (a checkable toggle). On activation a save dialog titled "Select extended log filename" opens, defaulting to `Desktop\comlog.txt`. Clicking again stops it.
- **Options & defaults:** Off by default. Not persisted across restarts.
- **Behaviour & gotchas:**
  - The chosen file is truncated on start. Line format: `seq(5 digits)<TAB>ms since app start(8 digits)<TAB>op<TAB>data`.
  - `op` is one of `com` (open/close events with port, baud and reset method, `[CORE]`/`[USER]` close origin, "Handle Missing OK" notes), `tx`, `rx` or `log` (session start/stop with an 8-hex-char session ID).
  - Single bytes appear as `[18]` and arrays as `[47, 31, ...]`. `\r` and `\n` are escaped.
- **Upstream source:** [`LaserGRBL/Logger/ComLogger.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger/ComLogger.cs), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`activateExtendedLogToolStripMenuItem_Click`)
- **webgrbl notes:** Status: not started. There is no arbitrary file path in a browser. Record to memory or IndexedDB, then export via a download or the File System Access API (`showSaveFilePicker`, which also allows live streaming to a file on Chromium). Add an in-app "raw traffic" view with filters (hide `?` polls and status) and timestamps. It is cheap and very useful when debugging Web Serial.

## Upstream Source

- [`LaserGRBL/ComWrapper/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ComWrapper/IComWrapper.cs) - transport interface and implementations (`UsbSerial.cs`, `UsbSerial2.cs`, `RJCPSerial.cs`, `Telnet.cs`, `LaserWebESP8266.cs`, `Emulator.cs`, vendored `MySerial/`, `RJCP/`, `WebSocket/`)
- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) - connect/close, threads, handshake parsing, version info, config/info refresh, Wi-Fi config writes
- [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs), [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs) - firmware dialect overrides
- [`LaserGRBL/ConnectLogForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ConnectLogForm.cs) - connection panel (port/baud/address, connect button)
- [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) - protocol, firmware type, reset-on-connect, `$I` query settings
- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - core factory, menus (Connect/Disconnect, Wi-Fi, Tools, logs), failed-connection help
- [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) - `CSVD` dictionary selection
- [`LaserGRBL/GrblEmulator/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblEmulator/Grblv11Emulator.cs) - Grbl v1.1 emulator, WebSocket emulator server, emulator log window
- [`LaserGRBL/WiFiDiscovery/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiDiscovery/DiscoveryForm.cs) - LAN scan dialog and IP helpers
- [`LaserGRBL/WiFiConfigurator/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiConfigurator/OrturWiFiConfig.cs) - Ortur/Longer Wi-Fi prompt and config dialog
- [`LaserGRBL/Firmware/FlashGrbl.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Firmware/FlashGrbl.cs) - avrdude flashing dialog and bundled hex files
- [`LaserGRBL/Logger/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger/Logger.cs) - session log, comm log, async log writer
- [`LaserGRBL/CSV/`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/error_codes.csv) - error/alarm/setting text tables per firmware

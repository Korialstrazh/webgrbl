---
title: Application Features (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# Application Features

This article covers the application shell around the machine controller: main window and menu structure, the Settings dialog and the persisted settings store, colour schemes and theming, UI localization, auto-update, notifications (sounds, Telegram), usage statistics and server messages, laser lifespan tracking, and safety and legal dialogs. It also covers multi-instance Syncro Start, the splash and license screens, crash reporting, help links, logging and command-line handling. Machine-specific features are linked to their own articles.

## Key Takeaways

- **One untyped key/value store** (`Settings`, a BinaryFormatter `Dictionary<string, object>` in `%AppData%\LaserGRBL\LaserGRBL.Settings.bin`) holds every preference. Writes are debounced (save 2 s after the last change) and flushed on exit. Defaults live at each call site, and several keys have **conflicting defaults** in different files (listed in LG-APP-03).
- The Settings dialog has 8 tabs. Only the Notification and Options tabs are app-level. The other tabs belong to connection, streaming, import and jog articles. Many more keys are persisted without any UI (window layout, last selections, preview toggles, jog speed and so on).
- Changing the **language**, **firmware type**, **legacy icons** or **rendering mode** requires an app restart. Colour scheme changes apply live.
- 20 UI languages, implemented with .NET `.resx` satellite files per form plus `Strings.resx`. GRBL error, alarm and setting descriptions come from English-only CSV files.
- Online services (update check, material DB refresh, usage stats, Telegram relay, laser statistics) all read their endpoint URLs from `UrlManager`. **All of them are `null` in the public source**, so only official builds phone home.
- Safety: a one-time legal disclaimer must be accepted before the app runs. A 5-second "wear your goggles" countdown with beeps precedes every job start (it can be disabled or silenced).
- Laser lifespan tracking accumulates run time, power-normalised time and a 10-bucket power histogram per laser module. When several modules are alive, the user is asked which one is fitted at each connect.
- No single-instance lock: several LaserGRBL instances (one per machine) can run, and **Syncro Start** fires start/hold/resume on all of them at once through a named OS event.

## Features

### LG-APP-01 Main window layout and status bar

- **What it does:** a single main window. On the left (fixed-width panel, splitter default 260 px, persisted) are the connection/log panel ([[lg-connection]], [[lg-streaming]]) and the jog panel ([[lg-machine-control]]). On the right is the preview panel with custom buttons ([[lg-preview]], [[lg-machine-control]]). A menu bar sits on top and a status bar at the bottom.
- **Where in the UI:** main window. The title is `LaserGRBL v<major.minor.build>`, with ` (for <Firmware>)` appended when the firmware is not Grbl.
- **Options & defaults:** status bar items, left to right:
  - `Lines:` loaded line count.
  - `Buffer` progress bar (tooltip `Buffer: used/size Free:n`). It turns red when stuck, with an unlock-from-stuck button (warns, links the FAQ, then calls `Core.UnlockFromBufferStuck`).
  - `Estimated Time:` (it changes to projected time while running).
  - Server news link, hidden unless a message exists (LG-APP-15).
  - Laser life hours `0.0h` (click opens LG-APP-16).
  - Override indicators `S [1.00x]`, `G1 [1.00x]`, `G0 [1.00x]`, shown only if the firmware supports overrides. They are pink above 100 % and light blue below. Clicking opens trackbar popups, see [[lg-machine-control]].
  - `Status:` the machine status with colour coding: Alarm red/white; Door, Hold, Cooling and AutoHold dark orange; Run, Jog and Check light green. Double-click opens the LaserGRBL "machine status" help page.
- **Behaviour & gotchas:**
  - A UI refresh timer updates status and menu enabled states.
  - On first run (or when the stored bounds are off-screen) the window opens maximised. Otherwise it restores the saved size, position and state (`Mainform Size and Position`, never restored as minimised). The off-screen fallback is 1024×768 centred.
  - The form accepts drag-and-drop of **one** file (opened after a 0.5 s delay), with `KeyPreview` on for global hotkeys ([[lg-machine-control]]).
  - Closing while a job runs asks "exit anyway?" (default No). On close it stops Syncro Start, saves window bounds, flushes settings and saves usage stats.
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MainForm_Load`, `TimerUpdate`, `RefreshOverride`, `MainFormFormClosing`, `MainForm_DragDrop`). [`LaserGRBL/MainForm.Designer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.Designer.cs).
- **webgrbl notes:** Status: not started.
  - Use a responsive layout: a resizable side panel on desktop and tabs or a drawer on mobile/tablet. Persist panel sizes in IndexedDB or localStorage.
  - The browser owns window size and position, so drop that setting.
  - Drag-and-drop works via the HTML5 DnD API. Also register a PWA `file_handlers` entry.
  - Use `beforeunload` to warn when closing during a job. Note that a tab close cannot be blocked reliably, so streaming must survive or fail safe (send feed-hold or soft-reset on `pagehide`, if possible).
  - Make status colours theme tokens, not hard-coded.

### LG-APP-02 Main menu tree

- **What it does:** the full menu structure. Each line below gives the menu item (default English text), its behaviour or state, and the covering article.
- **Where in the UI:** main menu bar. With non-legacy icons the `?` menu shows only an icon.
- **Options & defaults:**
  - **Grbl** (text is replaced by the firmware type name, e.g. "Grbl", "Smoothie")
    - Connect / Disconnect: only one is visible at a time. Disconnect during a job asks for confirmation. See [[lg-connection]].
    - Wi-Fi Discovery: visible only when the protocol is Telnet or ESP8266; disabled while connected. See [[lg-connection]].
    - Reset: GRBL soft reset. See [[lg-machine-control]].
    - Homing: visible only when `$22` homing is enabled. See [[lg-machine-control]].
    - Unlock: `$X`, visible per firmware capability. See [[lg-machine-control]].
    - Grbl Configuration: the `$$` editor. See [[lg-grbl-configuration]].
    - Settings: LG-APP-04.
    - Material DB: see [[lg-generators]] (LG-GEN-07).
    - Laser Lifespan: LG-APP-16.
    - Hotkeys: the hotkey editor. See [[lg-machine-control]].
    - Exit.
  - **File** (open/append/reload are enabled only when a new file can be loaded)
    - Open File, Append File, Reload Last File. See [[lg-gcode-files]].
    - Quick Save, Save (Advanced Options), Save Project: enabled when a program is loaded. See [[lg-gcode-files]].
    - Send To Machine, Send From Position. See [[lg-streaming]].
    - Syncro Start/Hold/Resume: visible only if more than one LaserGRBL process is running. See LG-APP-20.
  - **Generate** (disabled when a new file cannot be loaded)
    - Power vs Speed test, Cutting Test, Accuracy Test, Shake Test. See [[lg-generators]].
  - **ESP8266**: always hidden. Its only item, "Grbl Emulator", starts the WebSocket GRBL emulator. See [[lg-connection]].
  - **Colors**
    - CAD Style, CAD Dark, Blue Laser, Red Laser, Dark, Hacker, Nighty: radio-checked. See LG-APP-07.
  - **Preview** (hidden in legacy GDI rendering mode)
    - Zoom Auto (100%), Zoom In (+10%), Zoom Out (-10%).
    - Show Laser Off movements, Show executed commands, Show bounding box, Show cross cursor.
    - Auto size mode: Drawing area / Moving area.
    - Line size: 1px-5px.
    - Show diagnostic data.
    - All of these are covered in [[lg-preview]]; the toggles persist via LG-APP-05.
  - **Language**
    - English, Italian, Spanish, French, German, Danish, Portuguese (pt-BR), Russian, Chinese (simplified), Chinese (traditional), Slovak, Hungarian, Czech, Polish, Greek, Turkish, Romanian, Dutch, Ukrainian, Japanese. See LG-APP-09.
  - **Tools**
    - Install CH340 Driver, Flash Grbl Firmware (enabled only when disconnected). See LG-APP-28.
    - Configuration Wizard: hidden and unimplemented.
  - **Longer** (visible only when a Longer board is detected)
    - Longer User Group, Longer Support and Feedback, Longer Website, Youtube Channel, Longer Manuals, Longer Firmware: links, see LG-APP-24.
    - Configure WiFi: shown for LuckyWiFi boards on a serial protocol. See [[lg-connection]].
  - **Ortur** (visible only when an Ortur board is detected)
    - Ortur User Group, Ortur Support and Feedback, Ortur Website, Youtube Channel, Ortur Manuals, Ortur Firmware: links, see LG-APP-24.
    - Configure WiFi. See [[lg-connection]].
  - **?** (Help)
    - Auto update: a submenu that stays open on click.
      - Enable auto update / Notify minor changes / Notify pre-release: checkboxes, LG-APP-11.
      - Check Now!: LG-APP-11.
    - Open session log (enabled only if the log exists), Activate extended log (checkbox). See LG-APP-25.
    - Help on line (`https://lasergrbl.com/usage/`), LaserGrbl FAQ, LaserGrbl Community (Facebook group). See LG-APP-24.
    - Donate!: LG-APP-24.
    - License: LG-APP-22.
- **Behaviour & gotchas:** menu items have no keyboard shortcuts. The hotkey hints (`RefreshMenuHotKeys`) are deliberately disabled. Icons come from Material Design Icons, or legacy bitmaps.
- **Upstream source:** [`LaserGRBL/MainForm.Designer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.Designer.cs) (`MMn` items). [`LaserGRBL/MainForm.resx`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.resx) (texts). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`AssignIcons`, click handlers).
- **webgrbl notes:** Status: not started.
  - Regroup for the web: a top app bar with Machine, File, Generate, View, Settings and Help sections. Move language and theme into Settings instead of top-level menus.
  - Drop the Windows-only items (CH340 driver install, avrdude flashing) or replace them with links. See LG-APP-28.
  - Show vendor menus based on the detected `$I` vendor string.
  - Show hotkey hints in menus.
  - Add a command palette (Ctrl+K) as an improvement.

### LG-APP-03 Persisted settings store

- **What it does:** a global key/value store for every preference and every remembered UI state.
- **Where in the UI:** none directly. It backs the Settings dialog and all remembered values.
- **Options & defaults:**
  - The file is `%AppData%\LaserGRBL\LaserGRBL.Settings.bin` (BinaryFormatter `Dictionary<string, object>`). It is copied once from the exe folder if an old copy exists there, and the old copy is deleted at startup.
  - `Current LaserGRBL Version` is written at every start. `PrevVersion` and `IsNewFile` are exposed for upgrade logic.
  - Keys **without UI**, grouped by owning area:
    - App:
      - `Color Schema` = CADDark.
      - `User Language` = none (use OS UI culture).
      - `Auto Update` = true.
      - `Auto Update Build` = false (randomly true on 2 % of first runs).
      - `Auto Update Pre` = false.
      - `IsDisclamerAccepted` = false.
      - `MainForm Splitter Position` = 260.
      - `Mainform Size and Position` = null (maximised).
      - `Last laser used` = null.
      - `ConfiguredGraphicMode` = 0 (Auto).
    - Material helper: `DB Last Used Laser Model`, `DB Last Used Material`, `DB Last Used Action`, `DB Last Used Thickness`. See [[lg-generators]].
    - Connection:
      - `Serial Speed` = 115200.
      - `Telnet Address` = "127.0.0.1:23".
      - `Websocket URL` = "ws://127.0.0.1:81/".
      - `Suppress WiFI Prompt Message` = false.
      - `Last GrblVersion known`.
      - See [[lg-connection]].
    - GRBL config: `Grbl Configuration`, `Grbl Configuration ST`. See [[lg-grbl-configuration]].
    - Machine control:
      - `Jog Speed` = 1000.
      - `Jog Step` = 10.
      - `Custom Buttons`.
      - `Hotkey Setup`.
      - See [[lg-machine-control]].
    - Files: `Core.LastOpenFile`. See [[lg-gcode-files]].
    - Raster and vector import: every `GrayScaleConversion.*` key (brightness, contrast, dithering, line-to-line, vectorize options, size, offset, speed, power, laser on/off) and `Hardware Resolution`. See [[lg-raster-import]] and [[lg-vectorization]].
    - Preview: the retained toggles in LG-APP-05. See [[lg-preview]].
  - **Conflicting defaults** (the call site decides what happens when the key is absent):
    - `Threading Mode`: UltraFast in SettingsForm and `GrblCore` property, but Fast in `GrblCore` init.
    - `Reset Grbl On Connect`: true in SettingsForm and the GrblCore connect path, but false in the ComWrapper classes.
    - `Do not show Issue Detector`: false in MainForm and SettingsForm, but true in IssueDetectorForm.
- **Behaviour & gotchas:**
  - `GetObject<T>(key, default)` returns the default if the stored type differs, so enum/type changes silently reset values.
  - `SetObject` triggers a save only if the value changed (arrays are compared element-wise).
  - Saving is debounced with a 2 s timer and forced in `Settings.Exiting()`.
  - The Telegram code is encrypted with Windows DPAPI (`Tools.Protector`, CurrentUser scope).
- **Upstream source:** [`LaserGRBL/Settings.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Settings.cs) (`GetObject`, `SetObject`, `TriggerSave`, `Exiting`). [`LaserGRBL/Tools/DataProtector.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/DataProtector.cs).
- **webgrbl notes:** Status: not started.
  - Use a **typed** settings schema (one TS module with keys, types, defaults and a version number), stored in IndexedDB, with migrations keyed on schema version. Resolve the upstream default conflicts once in that module.
  - Use the shared constants rules, so there are no string keys scattered through the code.
  - Debounce writes like upstream, and flush on `visibilitychange`/`pagehide`.
  - Secrets have no DPAPI equivalent. Keep any tokens out of exports by default.
  - Offer **export/import of all settings** as JSON (an improvement over upstream), and a "reset to defaults" per section.

### LG-APP-04 Settings dialog (all tabs and options)

- **What it does:** a modal "Settings" dialog with 8 tabs and Save/Cancel. Save writes every option, raises `SettingsChanged`, and prompts for a restart when Rendering Mode, Firmware type or Legacy icons changed.
- **Where in the UI:** **Grbl > Settings**. Info (ⓘ) buttons open lasergrbl.com configuration anchors (`#firmware-type`, `#protocol`, `#streaming-mode`, `#threading-mode`, `#pwm-support`, `#rendering-mode`, `/telegram/`).
- **Options & defaults:** each entry gives the label, storage key and default, followed by the covering article.
  - **Protocol tab** ("Protocol"):
    - Firmware type (`Firmware Type`): Grbl / Smoothie / Marlin / VigoWork, default **Grbl**. Smoothie, Marlin and VigoWork are marked experimental. Restart required. See [[lg-connection]].
    - Connection Protocol (`ComWrapper Protocol`): UsbSerial / UsbSerial2 / RJCPSerial / Telnet / LaserWebESP8266 / Emulator, default **UsbSerial**. See [[lg-connection]].
    - Streaming Mode (`Streaming Mode`): Buffered / Synchronous / RepeatOnError, default **Buffered**. See [[lg-streaming]].
    - Threading Mode (`Threading Mode`): Insane / UltraFast / Fast / Quiet / Slow, default **UltraFast** in the form (see the conflict in LG-APP-03). It sets the send-thread rate and the status-poll rate. See [[lg-streaming]].
    - Issue detector (inverse of `Do not show Issue Detector`): default **on**. See [[lg-streaming]].
    - Soft Reset [Ctrl-X] on connect (`Reset Grbl On Connect`): default **on**. See [[lg-connection]].
    - Hard Reset [DTR+RTS] on connect (`HardReset Grbl On Connect`): default **off** ("position is lost"). See [[lg-connection]].
    - Query $I at connect (`Query MachineInfo ($I) at connect`): default **on** (used to detect the RX buffer size). See [[lg-connection]].
  - **Raster import tab:**
    - Support PWM (`Support Hardware PWM`): default **on**. See [[lg-raster-import]].
    - Unidirectional Engraving (`Unidirectional Engraving`): default **off**. See [[lg-raster-import]].
    - HiRes Filling (`Raster Hi-Res`): default **off**. It raises the max quality from 20 to 50 lines/mm. See [[lg-raster-import]].
    - Disable G0 fast skip (`Disable G0 fast skip`): default **off**. When on, white areas are skipped with G1 instead of G0. See [[lg-raster-import]].
    - Disable boundary warn (`DisableBoundaryWarning`): default **off**. See [[lg-raster-import]] and [[lg-svg-import]].
  - **Vector import tab:**
    - Smart Bezier (`Vector.UseSmartBezier`): default **on** (the better Bezier approximation added in 4.6.1). See [[lg-svg-import]].
  - **Jog control tab:**
    - Continuous Jog (`Enable Continuous Jog`): default **off**. See [[lg-machine-control]].
    - Show Z up/down control (`Enale Z Jog Control`, typo in the key): default **off**. See [[lg-machine-control]].
    - Click 'n Jog (`Click N Jog`): default **on**. Double-clicking the preview jogs to that point. See [[lg-machine-control]] and [[lg-preview]].
  - **Automatic cooling tab:**
    - Enable auto cooling (`AutoCooling`): default **off**. See [[lg-streaming]].
    - Time ON (`AutoCooling TOn`): 0-60 min + 0-59 s, default **10:00**. See [[lg-streaming]].
    - Time OFF (`AutoCooling TOff`): 0-10 min + 0-59 s, default **1:00**. See [[lg-streaming]].
    - Both times are clamped to a minimum of 10 s on save.
    - Warnings: requires GRBL > v1.1 with laser mode. Ortur firmware below 1.40 is buggy; that warning is hidden for Ortur ≥ 140.
  - **GCode tab:** these support custom-button syntax. See [[lg-streaming]] and [[lg-gcode-files]].
    - Header (`GCode.CustomHeader`): default `G90 (use absolute coordinates)`.
    - Multiple Passes (`GCode.CustomPasses`): default is a commented Z-sink snippet (`;G91`, `;G0 Z-1`, `;G90`).
    - Footer (`GCode.CustomFooter`): default `G0 X0 Y0 Z0 (move back to origin)`.
    - Values are trimmed on save.
  - **Notification tab:** see LG-APP-13 and LG-APP-14.
    - Success, Warning, Error and Connect/Disconnect sounds: one enable checkbox each (`Sound.<Id>.Enabled`, default **on**) plus a "Change" file picker (`Sound.<Id>`, default `Sound\<Id>.wav`).
    - Telegram notification (`TelegramNotification.Enabled`): default **off**.
    - Personal Code (`TelegramNotification.Code`): 10 characters, DPAPI-encrypted, with a Test button.
    - Don't notify if job time less than (`TelegramNotification.Threshold`): 0-60 min, default **1**.
  - **Options tab:**
    - Quiet Countdown (`QuietSafetyCountdown`): default **off**. See LG-APP-19.
    - Disable Safety Countdown (`DisableSafetyCountdown`): default **off**. See LG-APP-19.
    - Legacy icons (`LegacyIcons`): default **off**. Restart required. See LG-APP-08.
    - Rendering Mode (`ConfiguredGraphicMode`): Auto / Hardware Acceleration (FBO) / Software Rendering (DIB) / Legacy (GDI), default **Auto**. Restart required. See [[lg-preview]].
- **Behaviour & gotchas:**
  - All tab texts are long explanatory paragraphs (resx), which webgrbl should port as help text.
  - Firmware-type and icon restarts use `Application.Restart()`. The rendering change restarts without command-line args and suppresses the stats send.
- **Upstream source:** [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) (constructor, `InitAutoCoolingTab`, `BtnSave_Click`). [`LaserGRBL/SettingsForm.resx`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.resx) (labels and help texts). [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GCODE_STD_HEADER`, `GCODE_STD_PASSES`, `GCODE_STD_FOOTER`).
- **webgrbl notes:** Status: not started.
  - Use a settings page with sections and search, not a modal. Settings should apply live where possible, with no restarts needed in a SPA.
  - Drop the options that are meaningless on the web: protocol variants (Web Serial only; maybe WebSocket/Telnet bridge later), threading modes (replace with a poll interval), and rendering mode (WebGL with a Canvas2D fallback, auto-detected).
  - Hard reset via DTR/RTS is possible with `SerialPort.setSignals()`.
  - Keep per-machine profiles. Settings like firmware, header/footer, auto-cooling and jog belong to a **machine profile**, not to the global app. This is a planned improvement.

### LG-APP-05 Retained UI settings (autosave toggles)

- **What it does:** a `RetainedSetting<T>` wrapper that loads a value from Settings at construction, writes back on change and raises `OnChange`. It is used for preview toggles that auto-persist without a Save button.
- **Where in the UI:** the Preview menu toggles. See [[lg-preview]].
- **Options & defaults:**
  - `ShowLaserOffMovements` = true.
  - `ShowExecutedCommands` = true.
  - `ShowPerformanceDiagnostic` = false.
  - `ShowBoundingBox` = true.
  - `CrossCursor` = true.
  - `PreviewLineSize` = 1 (px, menu offers 1-5).
  - `AutoSizeOnDrawing` = true (true = Drawing area, false = Moving area).
- **Behaviour & gotchas:** the preview subscribes to `OnChange` to redraw. The menu handlers act only when the 3D (OpenGL) panel is active.
- **Upstream source:** [`LaserGRBL/Tools/RetainedSetting.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/RetainedSetting.cs). [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (retained properties).
- **webgrbl notes:** Status: not started.
  - Implement as a small reactive store (React hook `usePersistedSetting(key)`) backed by the typed settings module (LG-APP-03), with cross-tab sync through `BroadcastChannel` or the `storage` event.

### LG-APP-06 Window and layout persistence

- **What it does:** remembers the main window size, position, state and splitter width.
- **Where in the UI:** implicit.
- **Options & defaults:** `MainForm Splitter Position` = 260 px. `Mainform Size and Position` = [Size, Location, WindowState] (null means maximised).
- **Behaviour & gotchas:** the splitter is saved on every move. Bounds are saved on close. If the window is off all screens, it resets to 1024×768 centred.
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MainForm_Load`, `splitContainer1_SplitterMoved`, `IsVisibleOnAnyScreen`).
- **webgrbl notes:** Status: not started.
  - Persist only panel sizes and collapsed states. The browser and installed PWA own window bounds (`display_override: window-controls-overlay` is optional).

### LG-APP-07 Colour schemes

- **What it does:** 7 built-in colour schemes, switchable live. Each one sets form colours, preview colours (background, grid, rulers, job range, movements, laser power, cross, command OK/KO/wait, cross cursor), log colours per message class, link colours, and button states. They are designed for different laser safety-goggle colours.
- **Where in the UI:** the **Colors** menu (radio items).
- **Options & defaults:** `Color Schema` defaults to **CADDark**. (A static ctor sets RedLaser, but MainForm overrides it.) The schemes:
  - CADStyle (light form; dark preview #212830).
  - CADDark (dark #232833 form; #171E26 preview).
  - BlueLaser (system light; LightYellow preview; red laser-power colour).
  - RedLaser (system light; LightYellow preview; DarkBlue power, DarkViolet cross).
  - Dark (navy #1D2C4B form; light-grey preview).
  - Hacker (#000A23 form, LimeGreen text).
  - Nighty (#191919 form and preview, Aqua text).
  - `IsDark` is set for CADDark, Dark, Hacker and Nighty.
- **Behaviour & gotchas:**
  - Derived colours: button colour is ±10 % brightness of the form back colour, menu highlight is +20 %/-10 %, and the separator is +15 %/-10 %.
  - The interface `IColorScheme` lists about 35 colour slots. Webgrbl needs the full per-scheme values from the source for parity.
  - Applying a scheme re-themes the main window, connection panel, preview and icons (icons are recoloured SVGs).
- **Upstream source:** [`LaserGRBL/ColorScheme.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ColorScheme.cs) (`IColorScheme`, `Scheme*` classes, `FormButtonsColor`, `MenuHighlightColor`). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`styleToolStripMenuItem_Click`, `RefreshColorSchema`).
- **webgrbl notes:** Status: not started.
  - Map each scheme to a set of CSS custom properties (theme tokens), and feed the preview renderer the same tokens.
  - Add a "System (auto light/dark)" option via `prefers-color-scheme`.
  - Keep the goggle-oriented schemes, and label them by goggle colour (e.g. "for 445 nm blue-laser goggles") rather than by vague names.
  - Check WCAG contrast. Hacker and Nighty fail in places.

### LG-APP-08 Native dark theming and icon set

- **What it does:** applies the Windows dark-mode window frame and controls (`DarkMode_Explorer` theme plus the DWM immersive dark-mode attribute) for dark schemes. Icons come from Material Design Icons SVGs recoloured for the theme, or a legacy bitmap set.
- **Where in the UI:** automatic. **Settings > Options > Legacy icons** ("Nostalgia mode").
- **Options & defaults:** `LegacyIcons` = false (restart required).
- **Behaviour & gotchas:** DWM attribute 19 is tried first, then 20. Theming is a no-op on Windows versions before Vista.
- **Upstream source:** [`LaserGRBL/UserControls/ThemeMgr.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/ThemeMgr.cs) (`Initialize`, `SetTheme`). [`LaserGRBL/Icons/IconsMgr.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Icons/IconsMgr.cs).
- **webgrbl notes:** Status: not started.
  - Use the CSS `color-scheme` property and `<meta name="theme-color">` per scheme, which also tints the installed PWA title bar.
  - Use an MDI icon font or SVG sprite tinted with `currentColor`.
  - Skip legacy icons.

### LG-APP-09 UI localization

- **What it does:** translates every form and message into 20 languages.
- **Where in the UI:** the **Language** menu. Picking a language saves `User Language` (CultureInfo) and asks to restart now. The culture is applied to `CurrentUICulture` at startup.
- **Options & defaults:**
  - Default is the OS UI culture (no key stored).
  - Shipped cultures: neutral English (`en`), `it`, `es`, `fr`, `de`, `da`, `pt-BR`, `ru`, `zh-CN`, `zh-TW`, `sk-SK`, `hu-HU`, `cs-CZ`, `pl-PL`, `el-GR`, `tr-TR`, `ro-RO`, `nl-NL`, `uk`, `ja-JP`.
- **Behaviour & gotchas:**
  - Strings live in per-form `.resx` satellite files (e.g. `MainForm.de.resx`) plus `Strings.resx` for messages. Coverage differs by language: many newer forms (generators, laser life, legal disclaimer) exist only in pt-BR, zh-CN and sometimes ja-JP, and fall back to English otherwise.
  - Contributors translate with the ResEx tool via a GitHub fork and PR (see `TRANSLATING.md`). Credits are in the README.
  - Some strings are hard-coded English and never translated: update dialogs, laser-life confirmations, the Syncro warning, material DB validation, the safety countdown and the exception manager.
- **Upstream source:** [`TRANSLATING.md`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/TRANSLATING.md). [`README.md`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/README.md) (translation credits). [`LaserGRBL/Strings.resx`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Strings.resx). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`SetLanguage`). [`LaserGRBL/Program.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Program.cs).
- **webgrbl notes:** Status: not started.
  - webgrbl already uses i18next with CSV-driven strings (`csv-driven-i18n-setup` runbook). Add one CSV column per language, switch languages live with `i18next.changeLanguage` (no restart), and detect the default from `navigator.languages`.
  - Upstream `.resx` translations could seed webgrbl's CSV for matching strings, as a one-off import script (check the GPL compatibility of the translations).
  - Translate every user-facing string, including dialogs upstream left in English.
  - Use ICU plurals and `Intl` number, date and duration formatting.

### LG-APP-10 GRBL code descriptions (CSV dictionaries)

- **What it does:** decodes GRBL error, alarm and `$` setting numbers into short names and descriptions, for log tooltips and the config editor.
- **Where in the UI:** the connection log and the GRBL config grid. See [[lg-connection]] and [[lg-grbl-configuration]].
- **Options & defaults:** embedded CSVs (`code,name,description[,...]`):
  - `error_codes.csv` and `alarm_codes.csv`.
  - `setting_codes.v0.8/v0.9/v1.1.csv`.
  - Vendor variants for Ortur (v1.4.x/1.5.x/1.7.x, GrblHal) and Longer nanoduo.
  - The table is selected from the detected firmware and version.
- **Behaviour & gotchas:** **English only.** These tables are not localized.
- **Upstream source:** [`LaserGRBL/CSV/CsvDictionary.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/CsvDictionary.cs). [`LaserGRBL/CSV/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV). [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs).
- **webgrbl notes:** Status: not started.
  - Move these descriptions into webgrbl's i18next CSV, keyed like `grbl.error.<n>.name`, so they become translatable.
  - Keep the vendor override tables as JSON layered over the base table.

### LG-APP-11 Application auto-update

- **What it does:** checks GitHub releases for a newer version and shows "New version available" (current and latest version, Website / Cancel / Download!). Download! fetches the installer (first release asset) with a progress bar, runs it elevated (`runas`) and exits the app.
- **Where in the UI:**
  - Automatic check at startup, after the disclaimer, if `Auto Update` is on.
  - **? > Auto update > Check Now!** for a manual check.
  - Toggles: "Enable auto update" (`Auto Update`, default **on**), "Notify minor changes" (`Auto Update Build`, default **off**), "Notify pre-release" (`Auto Update Pre`, default **off**). Disabling auto update also disables and clears the other two.
- **Options & defaults:** on first run, `Auto Update Build` is randomly enabled on 2 % of installs (when auto update is on) to create a test population for build releases.
- **Behaviour & gotchas:**
  - The release JSON comes from `UrlManager.UpdateMain`, with fallback to `UpdateMirror`.
  - Candidate selection skips invalid releases (no asset), pre-releases unless enabled, and build-number releases (`x.y.z` with z ≠ 0) unless "minor" is enabled or the check is manual. It picks the highest version above the current one.
  - A manual check reports "most updated version" or an error dialog pointing to lasergrbl.com.
  - Also triggers the material DB refresh, see [[lg-generators]] (LG-GEN-06).
  - At startup, `CleanupOldVersion` deletes `*.todelete` files, the old `sessionlog.txt` and the old settings file in the exe folder.
  - The current version comes from the assembly version (7.14.1 at the pinned commit).
  - TLS 1.2 is forced and **all certificate validation is bypassed** (`FixTLS`), which is a security weakness.
- **Upstream source:** [`LaserGRBL/AutoUpdate/GitHub.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/AutoUpdate/GitHub.cs) (`CheckVersion`, `CheckVersionFromSite`, `InitFlags`, `DownloadUpdateA`, `ApplyUpdateEXE`). [`LaserGRBL/AutoUpdate/NewVersionForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/AutoUpdate/NewVersionForm.cs). [`LaserGRBL/Program.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Program.cs) (`FixTLS`).
- **webgrbl notes:** Status: not started.
  - Replace with the PWA service-worker update flow: detect the waiting SW and show a "New version available, reload" toast with release notes (from a bundled changelog).
  - **Never auto-reload while a job is streaming.** Defer activation until the machine is idle or disconnected.
  - Offer channels (stable / pre-release) via separate deploy URLs, if wanted.
  - No installer elevation is needed. The version comes from `package.json` injected at build.

### LG-APP-12 Material database refresh (online)

- **What it does:** keeps the shipped material DB current. See [[lg-generators]] (LG-GEN-06) for the full behaviour.
- **Where in the UI:** none (background, piggy-backing on the update check).
- **Options & defaults:** throttled to once per 24 h. Uses `UrlManager.UpdateMaterialDB` and `DownloadMaterialDB`.
- **Behaviour & gotchas:** compares the latest GitHub commit date with the file mtime. Logs "Material DB Updated to … [sha]" or "Material DB is up to date".
- **Upstream source:** [`LaserGRBL/AutoUpdate/GitHub.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/AutoUpdate/GitHub.cs) (`AsyncDownloadDB`).
- **webgrbl notes:** Status: not started.
  - Fetch the JSON DB with `If-None-Match`, cache it with Cache Storage, and merge it into the IndexedDB overlay.

### LG-APP-13 Sound events

- **What it does:** plays a WAV on 5 events:
  - Success: job finished.
  - Warning: a GRBL error on a command during a job.
  - Fatal: an issue detected (job most likely stopped).
  - Connect: Connecting → connected.
  - Disconnect: any transition to Disconnected.
- **Where in the UI:** **Settings > Notification**: one enable checkbox and one "Change" file picker per event.
- **Options & defaults:**
  - `Sound.<Success|Warning|Fatal|Connect|Disconnect>.Enabled` = true.
  - `Sound.<Id>` = `Sound\<id>.wav`, resolved relative to the exe folder.
  - Shipped files: `success.wav`, `warning.wav`, `fatal.wav`, `connect.wav` and `disconnect.wav` (the last two share the same freesound source), plus `beep.wav` for the safety countdown.
- **Behaviour & gotchas:** sounds are skipped if the file is missing. Only one sound plays at a time: a new event is **dropped** while another plays (`mBusy`).
- **Upstream source:** [`LaserGRBL/Sound/SoundEvent.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Sound/SoundEvent.cs) (`PlaySound`). [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`SetStatus`, `SetIssue`, `JobError`, program-end handler). [`LaserGRBL/Sound/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Sound).
- **webgrbl notes:** Status: not started.
  - Use the Web Audio API with pre-decoded `AudioBuffer`s. The `AudioContext` must be resumed from a user gesture (for example on Connect).
  - User-chosen sounds: pick a file and store its Blob in IndexedDB.
  - Add a volume slider and a test button per event, and queue sounds instead of dropping them.
  - Bundle CC-licensed sounds (check the freesound licences).

### LG-APP-14 Telegram notifications

- **What it does:** sends job events to the user's Telegram through the official LaserGRBL bot relay. "Job Executed" (lines, errors, time) is sent when the job lasted at least the threshold. "Job Issue" is sent on detected issues. The messages contain HTML `<b>` markup.
- **Where in the UI:**
  - **Settings > Notification**: "Telegram notification" checkbox, "Personal Code" (obtained from the `@LaserGRBL` bot), Test button, and "Don't notify if job time less than N min".
  - Info button: lasergrbl.com/telegram.
- **Options & defaults:**
  - `TelegramNotification.Enabled` = false.
  - `TelegramNotification.Code` = "" (DPAPI-encrypted).
  - `TelegramNotification.Threshold` = 1 min, range 0-60.
- **Behaviour & gotchas:**
  - The Test button is enabled only when the code is exactly 10 characters and the checkbox is on. Test sends "If you receive this message, all is fine!".
  - The client POSTs `servicekey`, `id` (code), `message` and `guid` (installation ID) to `UrlManager.TelegramHandler` with a 5 s timeout, fire-and-forget, and ignores the response.
  - Disabled in forks, because the URL and key are null.
- **Upstream source:** [`LaserGRBL/Telegram.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Telegram.cs) (`NotifyEvent`). [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) (`BtnTestNotification_Click`, `EnableTest`).
- **webgrbl notes:** Status: not started.
  - Primary channel: the **Notifications API**, plus an in-app toast, for job done, job error, alarm and disconnect. It works offline and needs no server. Request permission on opt-in, not on load.
  - When the tab is backgrounded, notify through the service-worker `showNotification`. Background streaming continues only while the page is alive.
  - Optional remote push (Telegram, ntfy.sh, a webhook URL) via direct `fetch` to a user-configured endpoint. Avoid shipping a shared service key.
  - Keep the minimum-job-duration threshold and add per-event toggles.

### LG-APP-15 Usage statistics and server messages

- **What it does:** collects anonymous usage statistics and sends them at app exit. The response can carry server messages: "ToolbarLink" (shown as a clickable news link in the status bar) and "AutoLink" (opened automatically in the browser at startup, once).
- **Where in the UI:** no opt-out setting exists. The news link sits in the status bar.
- **Options & defaults:**
  - Stored locally in `%AppData%\LaserGRBL\UsageStats.bin` and `Message.bin` (BinaryFormatter).
  - Sent fields: installation GUID, install date, app version, GRBL version, locale and UI language LCIDs, usage count, total usage minutes, wrapper type, feature counters (GCodeFile, RasterFile, Vectorization, Centerline, Dithering, Line2Line, SvgFile, Passthrough), firmware type, vendor, OS info and bitness, and render type, vendor, GL version and errors.
- **Behaviour & gotchas:**
  - Sent at most every 5 days, or immediately when the app or GRBL version changed. Skipped when updating (`GitHub.Updating`, `DoNotSendNow`).
  - Messages have id, type, title, content, a date range and a clearable flag. Clicked or opened messages are remembered as cleared.
  - The installation GUID is substituted into `{0}` in any link opened through `Utils.OpenLink`, so help links are trackable.
  - Disabled in forks (null URL).
- **Upstream source:** [`LaserGRBL/UsageStats.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UsageStats.cs) (`LoadFile`, `SaveFile`, `UpdateAndSend`, `TrueSend`, `MessageManager`). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`ManageMessage`, `TTLinkToNews_Click`).
- **webgrbl notes:** Status: not started.
  - If analytics are added at all, make them **opt-in** with a clear setting, privacy-friendly and aggregate, with no persistent ID inside links.
  - Keep the local feature counters, useful for an in-app "your stats" page.
  - For announcements, fetch a static `news.json` from the deploy origin and show a dismissible banner. Never auto-open tabs.

### LG-APP-16 Laser lifespan tracking

- **What it does:** tracks usage per laser module, so the user knows how much each diode has worked.
- **Where in the UI:**
  - **Grbl > Laser Lifespan**, or click the hours counter in the status bar. This opens "Laser Lifespan - Monitoring Tool".
  - The tool has a list, a power-class histogram preview of the selected laser, and Add / Edit / Remove / Mark as dead / Unmark dead / Close buttons.
- **Options & defaults:**
  - List columns: Name, Brand, Model, Run Time (h), Power Time (h), Stress Time (h), Avg Pow (%), Purchase Date, Monitoring Start, Death Date.
  - A default module named "Default" is created when the list is empty. Brand and Model display as "Unknown" when blank.
  - **Edit Laser** dialog:
    - Name (required, Save is disabled when empty).
    - Purchase Date: 2015-01-01 up to today + 1 month, default today.
    - Brand, Model.
    - Optical Power in W: -100..100, 0 means unset. Values above 200 are divided by 1000 (mW → W).
- **Behaviour & gotchas:**
  - Run time adds the wall time spent in `Run` status, measured on every status change.
  - True time adds each S-value interval as `elapsed × S/$30`, but only when `$30` is within 10-100000. Intervals below 3 % power are ignored for the normalised time (framing).
  - The power histogram has 10 classes (1-10 %, …, 91-100 %), counted when power is above 1 %. Stress Time is the 91-100 % class.
  - Average power = normalised time ÷ non-zero time.
  - Deltas above 600 s are discarded as a safety measure.
  - Saved to `%AppData%\LaserGRBL\LaserLifeCounter.bin` (with a `.old` backup) at most every 20 s, and immediately on edits.
  - You cannot delete the currently connected module. Delete warns more strongly if the module has worked over 1 h (it suggests "Mark as dead" instead). Mark as dead sets the death date to today.
  - Every 14 days (with at least 1 day between attempts) the modules that worked over 1 h are uploaded as JSON to `UrlManager.LaserStatistics` (null in forks).
  - The status bar shows the run hours of the current module.
- **Upstream source:** [`LaserGRBL/LaserUsage.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserUsage.cs). [`LaserGRBL/LaserLifeEdit.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserLifeEdit.cs). [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`LaserLifeHandler`: `ComputeLaserTime`, `ComputeLaserTrueTime`, `AddTrueLaserTimePower`, `DoSave`, `DoSend`, `Delete`, `Death`). [`LaserGRBL/UserControls/UsageClassPreview.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/UsageClassPreview.cs).
- **webgrbl notes:** Status: not started.
  - Store modules in IndexedDB, accumulating from status reports (`?` replies with FS:feed,spindle) rather than from the sent S, which is more accurate.
  - Use `performance.now()` deltas, flush periodically and on `pagehide`.
  - Improvements:
    - Export and import as JSON.
    - Maintenance reminders (for example lens cleaning every N hours).
    - Link modules to machine profiles and material DB models.
    - Make any upload opt-in.

### LG-APP-17 Laser module selector on connect

- **What it does:** at connect, picks which laser module accumulates usage:
  - With one module, that one.
  - With several modules but only one alive, that one.
  - Otherwise the "Select Laser" dialog (Current Laser combo) lists the last used module first, then alive modules and then dead ones (newest monitoring date first).
- **Where in the UI:** a modal that appears after a connection is established.
- **Options & defaults:** `Last laser used` = the GUID of the last selection.
- **Behaviour & gotchas:** Cancel leaves the current module null (no tracking). On disconnect the current module is cleared.
- **Upstream source:** [`LaserGRBL/LaserSelector.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserSelector.cs). [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`LaserLifeHandler.OnConnect`).
- **webgrbl notes:** Status: not started.
  - Remember the module per machine profile (keyed by USB VID/PID or `$I` info) so the prompt is rarely needed. Show it as a non-blocking banner instead of a modal.

### LG-APP-18 Legal disclaimer (first run)

- **What it does:** a blocking "Legal Disclaimer" dialog on first launch with laser safety warnings ("Laser engravers are not toys!": eyesight, fire, fumes, children and animals, never unattended, read the manual), a no-warranty statement and "Have fun, safely!".
- **Where in the UI:** shown at startup until accepted.
- **Options & defaults:**
  - `IsDisclamerAccepted` = false.
  - Checkbox "I have read, understood, and I accept these conditions" enables **Accept**.
  - A "google translate" link opens Google Translate with the text in the OS language.
- **Behaviour & gotchas:** if the dialog is closed without accepting, the app exits. Acceptance is stored forever.
- **Upstream source:** [`LaserGRBL/LegalDisclaimer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LegalDisclaimer.cs). [`LaserGRBL/LegalDisclaimer.resx`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LegalDisclaimer.resx). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MainForm_Load`).
- **webgrbl notes:** Status: not started.
  - Show it before the first Connect rather than before the app loads, so docs and the preview stay usable.
  - Fully localize it via i18next (no Google Translate link).
  - Version the disclaimer text so a changed text is re-shown.

### LG-APP-19 Safety countdown before job start

- **What it does:** a "Safety first!" modal ("Engraving is about to start. Please wear your safety goggles!", goggles icon) with **Start (5)** and Cancel. It counts down 5 s with a beep each second, then auto-starts.
- **Where in the UI:** before every job start from the beginning (not between passes) and before continuing from a position.
- **Options & defaults:**
  - `DisableSafetyCountdown` = false. When true, there is no dialog.
  - `QuietSafetyCountdown` = false. When true, there are no beeps.
  - Settings help text: "a 5 second chance to check everything is ok".
- **Behaviour & gotchas:** Start skips the wait. Cancel aborts the job start. The beep is `Sound\beep.wav`, played synchronously. See [[lg-streaming]] for where it is called.
- **Upstream source:** [`LaserGRBL/SafetyCountdown.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SafetyCountdown.cs) (`CanGo`). [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RunProgramFromStart`, `ContinueProgramFromKnown`).
- **webgrbl notes:** Status: not started.
  - Implement as an accessible dialog with focus on Cancel and Esc to cancel. Beep with Web Audio (an `OscillatorNode` needs no asset). Make the duration configurable (0-10 s).
  - Improvement: add an optional checklist (goggles, air assist, fire extinguisher, focus) and per-job framing confirmation.

### LG-APP-20 Syncro Start (multi-instance start/hold/resume)

- **What it does:** with several LaserGRBL instances running (one per machine), **File > Syncro Start/Hold/Resume** signals all of them at once. Each instance runs its program if it can send, resumes if held, or feed-holds if running.
- **Where in the UI:** the File menu item. It is visible only when Syncro is listening and more than one LaserGRBL process exists (re-checked every 5 s). The first use shows a warning confirmation.
- **Options & defaults:** none.
- **Behaviour & gotchas:**
  - Uses a named OS event "LaserGRBL syncro event", pulsed for 500 ms. Each listener ignores further pulses for 1 s.
  - The listener starts at app start and stops on exit.
  - The run path still shows the safety countdown, which is passed a null parent here.
  - There is no single-instance enforcement at all.
- **Upstream source:** [`LaserGRBL/SincroStart.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SincroStart.cs). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`MultipleInstanceTimer_Tick`, `MnRunMulti_Click`).
- **webgrbl notes:** Status: not started.
  - Use `BroadcastChannel` across tabs or windows of the same origin, with each tab owning one Web Serial port.
  - Better: support **several machines in one tab** (Web Serial allows multiple ports), with a "start all" action.
  - Use Web Locks to stop two tabs from opening the same port.

### LG-APP-21 Splash screen

- **What it does:** a borderless splash image with the version string (`v7.14.1`) drawn in the bottom-right corner. It auto-closes after 2 s, or on click.
- **Where in the UI:** at startup, before the main window.
- **Options & defaults:** none.
- **Behaviour & gotchas:** a modal that blocks the startup sequence. The core is built after it closes.
- **Upstream source:** [`LaserGRBL/SplashScreenForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SplashScreenForm.cs).
- **webgrbl notes:** Status: not started.
  - Use the PWA manifest `background_color` and icon for the OS splash, and an inline HTML/CSS loading screen while the bundle boots. Never add an artificial delay.

### LG-APP-22 License and credits

- **What it does:** a "LaserGRBL License" dialog with the full GPLv3 text, an explanatory text (copyright Diego Settimi, source on GitHub, third-party code belongs to its owners), clickable links, and Donate / OK buttons.
- **Where in the UI:** **? > License**.
- **Options & defaults:** none.
- **Behaviour & gotchas:** the third-party credits (CsPotrace, Clipper, SharpGL, websocket-sharp, the SVG library, MDI icons and others) are listed only in the README.
- **Upstream source:** [`LaserGRBL/LicenseForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LicenseForm.cs). [`README.md`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/README.md) (Credits and Contribution). [`LICENSE.md`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LICENSE.md).
- **webgrbl notes:** Status: not started.
  - Add an About page with the webgrbl licence, a generated third-party licence list (from `package.json` via a build plugin), and an acknowledgement of LaserGRBL. Mind GPLv3 if any upstream code or data (material DB, translations, glyph tables) is reused.

### LG-APP-23 Exception manager (crash reporting)

- **What it does:** catches unhandled exceptions on the UI thread and background threads. It shows "Ooops! Something went wrong" with a reassuring text, a link to GitHub issues and a read-only report (LaserGRBL version, firmware type and GRBL version, wrapper, OS and bitness, CLR, exception type, message, source, thread, method, stack and inner exceptions). Buttons: Copy, Continue (only if recoverable) and Abort (exits the app).
- **Where in the UI:** appears automatically.
- **Options & defaults:** none.
- **Behaviour & gotchas:**
  - UI-thread exceptions are continuable. AppDomain (background) exceptions are not.
  - If the report contains "DangerousAddRef" (a known serial-port disposal bug), the FAQ page opens automatically.
  - Disabled at design time.
- **Upstream source:** [`LaserGRBL/ExceptionManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ExceptionManager.cs) (`RegisterHandler`, `CreateAndShow`, `AppendExceptionData`).
- **webgrbl notes:** Status: not started.
  - Use a React error boundary plus `window.onerror` and `unhandledrejection` handlers. Show a recoverable error panel with a "Copy report" button (version, browser UA, serial state, stack) and a link to the issue tracker.
  - Never send a report silently.
  - On an error during streaming, put the machine into a safe state (feed hold) first.

### LG-APP-24 Help, community, vendor and donate links

- **What it does:** opens external web pages in the default browser.
- **Where in the UI:**
  - **? menu:**
    - Help on line: `https://lasergrbl.com/usage/`.
    - LaserGrbl FAQ: `https://lasergrbl.com/faq/`.
    - LaserGrbl Community: the Facebook group `486886768471991`.
    - Donate!: `https://lasergrbl.com/donate`.
  - **Ortur menu:** lasergrbl.com redirects `/orturfacebook/`, `/ortursupport/`, `/orturwebsite/`, `/orturYTchannel/`, `/ortur-manuals/` and `/ortur-firmware/`.
  - **Longer menu:** `/longer-facebook/`, `/longer-support/`, `/longer-website/`, `/longer-YTchannel/`, `/longer-manuals/` and `/longer-firmware/`.
  - Info buttons across dialogs point to lasergrbl.com docs anchors.
  - After 3 failed connections, a help dialog links the Arduino-connection or WiFi help page, depending on the protocol ([[lg-connection]]).
- **Options & defaults:** `UrlManager` holds service endpoints, not help links. It has `UpdateMain`, `UpdateMirror`, `Statistics`, `TelegramHandler`, `TelegramServiceKey`, `UpdateMaterialDB`, `DownloadMaterialDB` and `LaserStatistics`, all `null` in source. Official builds patch the file (it is kept with `git update-index --skip-worktree`).
- **Behaviour & gotchas:** `Utils.OpenLink` accepts `|`-separated URL lists, opens only http(s) links, and formats `{0}` with the installation GUID.
- **Upstream source:** [`LaserGRBL/UrlManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UrlManager.cs). [`LaserGRBL/Tools/HiResTimer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/HiResTimer.cs) (`Utils.OpenLink`). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (link handlers).
- **webgrbl notes:** Status: not started.
  - Keep all external URLs in one constants module, and set an env-driven base URL for webgrbl's own docs.
  - Prefer the in-app handbook (`in-app-handbook-maintenance` runbook) over external pages, so help works offline.
  - Use `target="_blank" rel="noopener"`.

### LG-APP-25 Session log and extended communication log

- **What it does:**
  - The **session log** (`%AppData%\LaserGRBL\sessionlog.txt`, a rolling 1000 lines) records program start and stop, status changes, issues, update and DB messages and exceptions, as `dd/MM/yyyy HH:mm:ss.fff<TAB>context<TAB>line`.
  - The **extended log** records every TX/RX line, with an index and a millisecond timestamp, to a user-chosen file (default `Desktop\comlog.txt`), under a session ID.
- **Where in the UI:** **? > Open session log** (enabled only if the log exists; opens it in the default viewer). **? > Activate extended log** (checkbox: Save dialog to start, click again to stop).
- **Options & defaults:** the extended log is off at every start and stops automatically on exit.
- **Behaviour & gotchas:** writes are asynchronous. CR and LF are escaped as `\r` and `\n` in the extended log.
- **Upstream source:** [`LaserGRBL/Logger/Logger.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger/Logger.cs). [`LaserGRBL/Logger/ComLogger.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger/ComLogger.cs). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`activateExtendedLogToolStripMenuItem_Click`).
- **webgrbl notes:** Status: not started.
  - Keep a ring buffer in memory and IndexedDB, with a "Download log" button (Blob download) and a log viewer panel.
  - Record the extended TX/RX log to OPFS or memory, then export it.
  - Include the log in the crash report on request.

### LG-APP-26 Startup, command line, file association and multi-instance

- **What it does:** the startup sequence, in order:
  1. Exception handlers.
  2. Theming init and TLS fix.
  3. Logger start.
  4. Update flags and cleanup.
  5. Load usage stats and custom buttons.
  6. Icons.
  7. UI culture.
  8. 1 ms timer resolution.
  9. Argument parsing.
  10. Discrete GPU request (NVIDIA Optimus) unless software or GDI rendering is used.
  11. Main window, then splash.
  12. Core creation for the chosen firmware.
  13. Disclaimer.
  14. Update check.
  15. Server messages.
  16. Open the file passed on the command line.
- **Where in the UI:** the command line / Explorer double-click. The installer (`setup.iss`) associates `.nc` (G-code) and `.lps` (project) files ([[lg-gcode-files]]), plus `.zbn` (zipped custom buttons).
- **Options & defaults:**
  - Args `nogl` force GDI rendering and `swgl` forces software OpenGL. Both are stored only for this run (`ForcedGraphicMode`).
  - A single path argument is opened: `.zbn` imports a custom button ([[lg-machine-control]]), anything else is loaded as a file if possible, otherwise "cannot open file now".
- **Behaviour & gotchas:** **no single-instance lock.** Each double-click starts a new process (by design, for multi-machine use with LG-APP-20). On exit it stops the WebSocket emulator, cleans the Autotrace temp folder, stops the comlog and stops the logger.
- **Upstream source:** [`LaserGRBL/Program.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Program.cs) (`Main`, `GraphicInitializer`). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`ManageCommandLineArgs`). [`setup.iss`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/setup.iss).
- **webgrbl notes:** Status: not started.
  - Use the PWA manifest `file_handlers` (`.nc`, `.gcode`, `.svg`, images, a project format) and the `launchQueue` consumer.
  - Use `share_target` for mobile.
  - URL query flags (e.g. `?renderer=canvas`) replace `nogl`/`swgl`.
  - Multiple tabs are allowed. Guard serial ports with Web Locks.

### LG-APP-27 Keep the system awake during jobs

- **What it does:** prevents system sleep while a job runs by calling `SetThreadExecutionState(ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED)` every 20 s, and releases it when idle.
- **Where in the UI:** automatic.
- **Options & defaults:** none.
- **Behaviour & gotchas:** the display may still turn off. Only the system is kept awake.
- **Upstream source:** [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`AwakeTimer_Tick`). [`LaserGRBL/Tools/WinAPI.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/WinAPI.cs) (`SignalActvity`, `SignalFree`).
- **webgrbl notes:** Status: not started.
  - Use the **Screen Wake Lock API** (`navigator.wakeLock.request('screen')`) while streaming, and re-acquire it on `visibilitychange`.
  - Warn that background or throttled tabs can stall streaming (timer throttling). Keep the streaming loop driven by serial reads, not timers, and prefer a Worker.

### LG-APP-28 Tools menu: CH340 driver and GRBL firmware flasher

- **What it does:**
  - **Install CH340 Driver** runs the bundled `Driver\CH341SER.EXE`. If that fails it opens a Google search.
  - **Flash Grbl Firmware** (only while disconnected) runs the bundled `avrdude.exe` with `-patmega328p -b<baud> -P<COM> -carduino -Uflash:w:"<hex>":i`. The firmware is one of the bundled hex files (GRBL v1.1h original, v1.1h custom XY-homing, v1.1f original) or a user `.hex`. It reports "Firmware flashed successfully!" or an error from the exit code.
- **Where in the UI:** the **Tools** menu.
- **Options & defaults:** the target and baud combos are in the flash dialog.
- **Behaviour & gotchas:** Windows-only. Works for ATmega328P (Arduino Uno/Nano) only.
- **Upstream source:** [`LaserGRBL/Firmware/FlashGrbl.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Firmware/FlashGrbl.cs). [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`installCH340DriverToolStripMenuItem_Click`, `flashGrblFirmwareToolStripMenuItem_Click`).
- **webgrbl notes:** Status: not started.
  - A driver install is impossible from the browser, so link to the vendor driver pages per OS.
  - Firmware flashing is feasible over Web Serial with a JS STK500v1 implementation (e.g. avrgirl-style). It needs a DTR toggle via `setSignals` for reset. Consider it a later, optional feature with strong warnings.

## Upstream Source

- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - main window logic, menu handlers, status bar
- [`LaserGRBL/MainForm.Designer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.Designer.cs) - menu tree and layout
- [`LaserGRBL/Program.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Program.cs) - startup, command line
- [`LaserGRBL/Settings.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Settings.cs) - persisted key/value settings
- [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) - Settings dialog
- [`LaserGRBL/Tools/RetainedSetting.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Tools/RetainedSetting.cs) - auto-persisted setting wrapper
- [`LaserGRBL/ColorScheme.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ColorScheme.cs) - colour schemes
- [`LaserGRBL/UserControls/ThemeMgr.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UserControls/ThemeMgr.cs) - Windows dark-mode theming
- [`LaserGRBL/AutoUpdate/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/AutoUpdate) - update check, download, material DB refresh
- [`LaserGRBL/Sound/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Sound) - sound events and shipped WAVs
- [`LaserGRBL/Telegram.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Telegram.cs) - Telegram relay client
- [`LaserGRBL/UsageStats.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UsageStats.cs) - usage statistics and server messages
- [`LaserGRBL/LaserUsage.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserUsage.cs), [`LaserGRBL/LaserLifeEdit.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserLifeEdit.cs), [`LaserGRBL/LaserSelector.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LaserSelector.cs) - laser lifespan UI (handler lives in `Core/GrblCore.cs`)
- [`LaserGRBL/LegalDisclaimer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LegalDisclaimer.cs), [`LaserGRBL/SafetyCountdown.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SafetyCountdown.cs) - safety dialogs
- [`LaserGRBL/SincroStart.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SincroStart.cs) - multi-instance synchronised start
- [`LaserGRBL/SplashScreenForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SplashScreenForm.cs), [`LaserGRBL/LicenseForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/LicenseForm.cs) - splash and license
- [`LaserGRBL/ExceptionManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/ExceptionManager.cs) - crash dialog
- [`LaserGRBL/UrlManager.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/UrlManager.cs) - service endpoints (null in source)
- [`LaserGRBL/Logger/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Logger) - session and communication logs
- [`LaserGRBL/CSV/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV) - GRBL error/alarm/setting description tables
- [`LaserGRBL/Firmware/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Firmware) - avrdude firmware flasher and bundled hex files
- [`TRANSLATING.md`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/TRANSLATING.md) - translator workflow
- [`README.md`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/README.md) - feature list, credits

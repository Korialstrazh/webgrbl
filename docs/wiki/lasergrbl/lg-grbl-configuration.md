---
title: GRBL Configuration (LaserGRBL)
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# GRBL Configuration

How LaserGRBL reads, shows, edits, writes, imports and exports the controller's `$$` settings. It also covers how the app picks per-firmware tables of setting, error and alarm descriptions, which config values the rest of the app depends on, how it detects firmware version and build (welcome banner, `$I`), and the "issue detector" that warns when a job goes wrong. The reference tables at the end are the bundled CSV data, copied verbatim.

## Key Takeaways

- `$$` is read automatically **500 ms after every connect**, then again whenever the config dialog opens, Read is pressed, before and after a write, and on import/export. The result is cached **persistently** (setting `Grbl Configuration ST`). When disconnected, the editor and the rest of the app use the cached values ("Showing cached values...").
- Values are stored as **strings** keyed by `$` number. This supports text settings such as grblHAL/Ortur `$74` WiFi SSID. Numeric getters parse them, fall back to a regex number extraction, and clamp to safe ranges with defaults (see [[#LG-CFG-07 Config values the app depends on]]).
- Write sends only **changed** rows as `$n=value` lines, case preserved. Each EEPROM write is sent **synchronously** (nothing else is streamed until its `ok` arrives). Any non-`ok` reply raises one combined error listing every failed line. A successful `$n=v` from any source (console, custom button) also updates the cache.
- Descriptions come from bundled CSVs, chosen by the detected firmware: GRBL 0.8 / 0.9 / 1.1, Ortur 1.4.x / 1.5.x / 1.7.x / grblHAL, Longer NanoDuo. Errors and alarms are decoded only when GRBL ≥ 1.1 (`SupportCSV`), because older GRBL sends text messages instead of codes.
- The only value validation is a hard block on editing **Ortur `$33`** (a safety feature). Everything else is sent as typed and GRBL rejects bad values.
- The "issue detector" does **not** check config (`$32` and similar). It watches running jobs for: the board stopping status replies, an unexpected reset (welcome banner mid-job), an unexpected disconnect, and an `ALARM:` mid-job. A separate buffer-stuck detector recovers lost `ok`s.
- `$I` is sent on connect only to learn the RX buffer size from `[OPT:...]`. `[VER:]` is parsed and ignored. `$G` (parser state), `$#`, `$N`, `$RST` and check mode `$C` have **no UI**. `Check` is understood as a machine state, and a job may be started while in Check.

## Features

### LG-CFG-01 GRBL settings editor dialog

- **What it does:** Shows all `$` settings in a grid with number, name, editable value, unit and description, plus Read, Write, Import, Export and Close actions.
- **Where in the UI:** Menu **Grbl → Grbl Configuration** opens the "Grbl $$ configuration" modal (`GrblConfig`). The menu item is hidden for Smoothie and Marlin (`UIShowGrblConfig = false`).
- **Options & defaults:** Columns: `$-Code` (e.g. `$110`, read-only), `Parameter` (name from CSV), `Value` (editable, white-smoke background), `Unit`, `Description` (fills the remaining width). A hidden `Number` column exists.
- **Behaviour & gotchas:**
  - On load it runs a Read if possible. Otherwise it shows the cached table and the transient label "Showing cached values...".
  - The grid is read-only when disconnected. A label then reads "Read and Write enabled only when connected and idle".
  - Read, Write and Import are enabled only when `CanReadWriteConfig` (connected, no program running, Idle or Alarm). Export is enabled when the cache is non-empty. Buttons refresh on every machine-status change.
  - Action results appear in a self-hiding status label (timer).
  - Closing with unsaved edits while Idle prompts "There are some changes that have not been applied. Do you want to rewrite the configuration?". Yes writes the changes (and keeps the dialog open if the write fails), No discards them, Cancel stays in the dialog.
  - Grid data errors (bad cell input) are silently cancelled.
  - Rows appear in dictionary insertion order (the order GRBL reported them), not sorted.
- **Upstream source:** [`LaserGRBL/GrblConfig.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblConfig.cs) (`GrblConfig`, `RefreshEnabledButtons`, `GrblConfig_Load`, `GrblConfig_FormClosing`, `HasChanges`, `GetChanges`), [`LaserGRBL/GrblConfig.Designer.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblConfig.Designer.cs)
- **webgrbl notes:** Status: not started. Use typed editors driven by metadata: checkbox for boolean, axis-bit checkboxes for `mask` (00000ZYX), number inputs with units for the rest, text for strings. Group settings (stepper, limits/homing, spindle/laser, per-axis X/Y/Z columns). Sort by number. Highlight dirty rows and offer "revert row". Add search/filter. Add a "diff against file" view before writing an import.

### LG-CFG-02 Read configuration (`$$`)

- **What it does:** Fetches all settings from the controller into the cache.
- **Where in the UI:** Automatic on connect (after 500 ms), on dialog open, **Refresh** button (labelled "Refresh" in the designer resources; `BtnRead`), and before and after writes, imports and exports.
- **Options & defaults:** Response timeout 10 s for the `$$` `ok`/error. Collection stops when `ExpectedCount` (34 for v1.1+, 31 for v0.9, 23 for older/unknown) rows plus the echo have arrived, or after a 500 ms gap with no new line, or after 5 s total.
- **Behaviour & gotchas:**
  - Temporarily redirects the send queue and sent-log to private lists (`mQueuePtr` / `mSentPtr`), so `$$` output does not mix with the job log, then restores them.
  - Each reply line is parsed with `^[$](\d+)\s*=(.*)`, keeping the value text trimmed. **Foxalien** firmware adds descriptions (`$20=0 (soft limits, bool)`): when the line matches `^[$](\d+)\s*=\s*(\d+\.?\d*)\s*\(.*\)` the parenthesised part is stripped.
  - A partial read (count < expected) is accepted and only logged, since grblHAL/Ortur send many more rows than expected. In that case reading relies on the 500 ms gap.
  - Skipped (only logged) when `!CanReadWriteConfig`. Marlin's `RefreshConfig` is empty.
  - On failure the dialog shows "Error reading config! <message>" (e.g. "No response received from grbl!"). On success it shows "{n} Config read successfully!".
  - The cache is replaced only when the new read has at least one entry.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`RefreshConfig`, `RefreshConfigOnConnect`, `Configuration`, `GrblConfST.AddOrUpdate`, `FixFoxalienConfig`, `ExpectedCount`)
- **webgrbl notes:** Status: not started. Over Web Serial, collect `$n=` lines until the terminating `ok`. That is deterministic, so no gap timers are needed. Tag the read with a request id in the line router so concurrent status reports (`<...>`) still go to the status parser. Persist the cache per machine profile (IndexedDB) so offline use (job planning, preview bounds) works. Handle grblHAL's `$$` extensions (`$ES`/`$EG` give setting metadata, which could replace the CSVs).

### LG-CFG-03 Write configuration

- **What it does:** Sends the edited settings to the controller's EEPROM.
- **Where in the UI:** **Write** button, and the close-with-changes prompt.
- **Options & defaults:** —
- **Behaviour & gotchas:**
  - First re-reads `$$` (`OnWriteBegin`). Then it diffs the grid against the cache: a row is changed if its key is missing or its value **string** differs (so `10` vs `10.000` counts as a change). No changes → "No changes... nothing to write!".
  - Each change is queued as `$<n>=<value>`, **case preserved** (normal commands are uppercased, which would break SSIDs and passwords).
  - The streaming core treats any `$n=…` as an EEPROM write: while one is awaiting its reply, nothing else is sent (synchronous). This matches GRBL's EEPROM-write timing rule.
  - It busy-waits until the queue and pending list are empty, then counts every reply that is not `ok`. Results: "{n} Config written successfully!", or a message box "{n} Config written with {k} errors!" listing each failing line with its decoded error.
  - Always re-reads `$$` afterwards (`OnWriteEnd`) so the cache reflects the controller.
  - `ManageCommandResponse` adds every successful EEPROM write (from any source) to the cache.
- **Upstream source:** [`LaserGRBL/GrblConfig.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblConfig.cs) (`BtnWrite_Click`, `WriteConf`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`WriteConfig`, `WriteConfigException`, `PeekNextCommand`, `ManageCommandResponse`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`IsWriteEEPROM`)
- **webgrbl notes:** Status: not started. Compare values numerically when both parse as numbers. Show a confirmation listing old and new values. Write one setting per `ok` with a progress UI. Offer a "backup current config before write" auto-export. Never write while a job runs.

### LG-CFG-04 Export / import configuration file

- **What it does:** Saves the settings to a text file or restores them from one.
- **Where in the UI:** **Export** and **Import** buttons in the config dialog.
- **Options & defaults:** Export file filter `GCODE Files|*.nc`. Import filter `*.nc;*.gcode`.
- **Behaviour & gotchas:**
  - Export: re-reads if possible, then writes one `$<n>=<value>` line per setting (no comments, no header). An empty cache gives the error "Nothing to export!". Success message: "{n} Config exported successfully!".
  - Import: every line must be `$<n>=<value>` (number = text between `$` and `=`, value = the trimmed rest). **Any other line (blank, comment) throws and aborts the import** with "Error reading file!". All parsed rows are written (not diffed) through the write path, then the grid is refreshed. Results: "{n} Config imported successfully!" or "{n} Config imported with {k} errors!".
  - A missing file gives "File does not exist!".
- **Upstream source:** [`LaserGRBL/GrblConfig.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblConfig.cs) (`BtnExport_Click`, `BtnImport_Click`)
- **webgrbl notes:** Status: not started. Use the File System Access API (`showSaveFilePicker`/`showOpenFilePicker`) with a download/`<input type=file>` fallback. Export a richer format (header comment with firmware version, date and machine name; `$n=v ; name` comments) and make import tolerant (skip blank, `;` and `(…)` lines, ignore unknown keys with a warning). Show a diff and let the user pick rows before writing. Keep plain `$n=v` export for interoperability.

### LG-CFG-05 Version-specific setting metadata (CSV tables)

- **What it does:** Supplies name, unit and description for each `$` code, and the decoded text for error and alarm codes, matched to the connected firmware.
- **Where in the UI:** Config grid columns. Console log lines: `$n=v` is shown as `$n=v (name)` with a tooltip `description [unit]`. Error and alarm decoding ([[#LG-CFG-08 Error code decoding]], [[#LG-CFG-09 Alarm code decoding]]).
- **Options & defaults:** Embedded resources `LaserGRBL.CSV.*.csv`, loaded when the version changes and at startup from the last known version (setting `Last GrblVersion known`). Default: `setting_codes.v1.1.csv`, `alarm_codes.csv`, `error_codes.csv`.
- **Behaviour & gotchas:**
  - Settings selection order: Ortur and grblHAL → `setting_codes.ortur.GrblHal.csv`. Ortur with firmware number ≥ 170 → `ortur.v1.7.x`. Ortur ≥ 150 → `ortur.v1.5.x`. Other Ortur → `ortur.v1.4.x`. Longer with machine `NanoDuo` → `longer.nanoduo`. Otherwise `setting_codes.v<major>.<minor>.csv` (only v0.8, v0.9 and v1.1 exist; a missing file falls back to v1.1).
  - Alarms and errors: Ortur grblHAL → `*.ortur.GrblHal.csv`. Longer NanoDuo → `*.longer.nanoduo.csv`. Otherwise the standard files.
  - CSV format: `code,name,unit,description` for settings (first row is a header and is ignored as an unknown key), `code,brief,description` for errors and alarms. No quoting, so descriptions contain no commas. Fields are trimmed. The first occurrence of a code wins.
  - Plain grblHAL (non-Ortur) uses the v1.1 table. Its extended codes show with no name.
  - Full data: [[#Reference tables]].
- **Upstream source:** [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`CSVD.LoadAppropriateCSV`, `GrblMessage`), [`LaserGRBL/CSV/CsvDictionary.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/CsvDictionary.cs), [`LaserGRBL/CSV/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV)
- **webgrbl notes:** Status: not started. Ship the tables as typed TS/JSON modules (tree-shakable, cached by the PWA service worker), merged as base GRBL 1.1 plus vendor overlays instead of full copies. Add machine-readable `type` (bool/mask/int/float/string), `min`/`max` and `axisMask` fields to drive editors. Translate names and descriptions through the project's CSV i18n pipeline. For grblHAL, prefer live `$ES`/`$EG`/`$EA`/`$EE` metadata when available.

### LG-CFG-06 Setting validation

- **What it does:** Blocks edits that LaserGRBL considers dangerous.
- **Where in the UI:** Cell validation in the config grid.
- **Options & defaults:** —
- **Behaviour & gotchas:** The only rule: on Ortur boards `$33` cannot be changed. The edit is cancelled with the warning "This param control an Ortur safety feature. Please do not change this value!" (`$33` = G-sensor threshold on Ortur 1.4.x, PWM frequency in Ortur 1.5+/grblHAL tables). No range, type or mask validation.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ValidateConfig`, `GrblConfST.ValidateConfig`), [`LaserGRBL/GrblConfig.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblConfig.cs) (`DGV_CellValidating`)
- **webgrbl notes:** Status: not started. Validate type and range client-side from the metadata. Warn about known footguns: `$32=0` on a laser, `$20=1` without `$22=1` (error 10), `$0<3`, step rate > 30 kHz (`$100·$110/60`), `$10` without the buffer-report bit (breaks buffer-stuck detection), and `$13=1` (inch reports). Keep vendor safety locks as data.

### LG-CFG-07 Config values the app depends on

- **What it does:** Turns cached settings into typed properties that drive jogging, the preview, power scaling, time estimates and safety features.
- **Where in the UI:** Indirect: jog speed slider max, homing button visibility, generator power ranges, raster M3/M4 and boundary warnings, auto-cooling availability.
- **Options & defaults:** Read through `ReadDecimal(key, default, min, max)`. The default is used when the version is unknown or the key is missing. The result is clamped.

| Property | GRBL ≥0.9 key | GRBL 0.8 key | Default | Clamp | Used by |
|---|---|---|---|---|---|
| `HomingEnabled` | `$22` | `$17` | 1 (true) | 0..1 | homing button, gates, run-from-position homing option |
| `MaxRateX` / `MaxRateY` | `$110` / `$111` | `$4` / `$5` | 4000 | 1..2,000,000 | jog speed slider max |
| `LaserMode` | `$32` (≥1.1 only) | — | 0; **true if version unknown** | 0..1 | raster M4 warning, auto-cooling support |
| `MaxPWM` | `$30` (≥1.1) | — | 1000 | 1..2,000,000 | generators (cutting/power-vs-speed/shake tests), laser-off `S` max in G-code output, laser-life power %. (The `$30` expression variable reads the raw cache, not this property.) |
| `MinPWM` | `$31` (≥1.1) | — | 0 | 0..2,000,000 | defined, unused |
| `ResolutionX/Y` | `$100` / `$101` | `$0` / `$1` | 250 | 1..10,000 | raster resolution helper (`ResolutionX` only) |
| `TableWidth/Height` | `$130` / `$131` | — | 300 / 200 | 1..2,000,000 | manual-move range, continuous jog edges, soft-limit clamp, raster size/offset checks, shake test |
| `SoftLimit` | `$20` | `$20` | 0 | 0..1 | absolute-jog clamping, raster offset warnings |
| `AccelerationXY` | avg(`$120`,`$121`) | — | 2000 | 1..2,000,000 | defined; its time-estimation use is commented out |
| `WiFi_SSID` / `WiFi_Pwd` | `$74` / `$75` (string) | — | null | — | Ortur WiFi |
| `TelnetPort` | `$305` (string) | — | "23" | — | Ortur WiFi connect |

- **Behaviour & gotchas:** If a value fails to parse as a decimal, the first number matched by the regex `(\d+\.?\d*)` is used, otherwise the default. Note the inconsistent fallback: `CurrentThreadingMode` defaults to `UltraFast` while the core initialises `Fast` (see [[lg-streaming]]). A legacy numeric format (`Grbl Configuration`) is migrated once to the string format.
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GrblConfST` properties, `ReadDecimal`, `ReadString`, obsolete `GrblConf`)
- **webgrbl notes:** Status: not started. Expose these as one typed `MachineCapabilities` object (with `source: 'live' | 'cached' | 'default'`) so the UI can flag when it is planning against defaults. Let the user override table size or max power per profile when the firmware reports nonsense.

### LG-CFG-08 Error code decoding

- **What it does:** Turns `error:N` replies into readable text.
- **Where in the UI:** Console/command log: the failed command's result column shows the brief text, with the long description as a tooltip. Write-config error dialogs.
- **Options & defaults:** Active only when GRBL ≥ 1.1 (`SupportCSV`).
- **Behaviour & gotchas:** The key is the text after `:` in the reply. An unknown code shows the raw `error:N`. The standard table includes code **18 "Emergency stop engaged"**, which is not in stock GRBL. VigoWork synthesises `error:99` for failed lines. Tables: [[#Error codes]].
- **Upstream source:** [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`GetResult`, `GetToolTip`), [`LaserGRBL/CSV/error_codes.csv`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/error_codes.csv)
- **webgrbl notes:** Status: not started. Decode errors in the console and also surface them as user-facing toasts for manual commands (following the project's error-surfacing rule). Link errors to fixes (e.g. error 9 → "Unlock or home first", error 15 → "Jog outside soft limits").

### LG-CFG-09 Alarm code decoding

- **What it does:** Turns `ALARM:N` into readable text.
- **Where in the UI:** Console log (alarm-coloured row): the message is replaced by the brief text, with the description as a tooltip. Status bar turns red (Alarm state).
- **Options & defaults:** Active only when GRBL ≥ 1.1.
- **Behaviour & gotchas:** An alarm received while a job runs marks the job issue `MachineAlarm` and triggers the issue detector ([[#LG-CFG-10 Issue detector]]). Tables: [[#Alarm codes]].
- **Upstream source:** [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) (`GrblMessage`), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`ManageStandardBlockingAlarm`), [`LaserGRBL/CSV/alarm_codes.csv`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/alarm_codes.csv)
- **webgrbl notes:** Status: not started. Show a modal or banner alarm panel with the decoded text and the right recovery action (Home / Unlock / check wiring). Also decode `[MSG:...]` feedback such as `Reset to continue` and `'$H'|'$X' to unlock`.

### LG-CFG-10 Issue detector

- **What it does:** Warns the user when a running job is interrupted by a board or communication problem.
- **Where in the UI:** Modal "Problem detected!" (`IssueDetectorForm`) with the text "LaserGRBL detected some problem with your board!" and "It would appear that grbl has problems executing this job. Causes of this situation can be multiple, please read the FAQ…". It also shows "Cause:" plus the raw issue enum name, a link to `https://lasergrbl.com/faq#issues`, a "Do not show again" checkbox, and OK. Also controlled by Settings → "Issue Detector" checkbox.
- **Options & defaults:** `Do not show Issue Detector`, default **false** (the detector is shown).
- **Behaviour & gotchas:**
  - Checked only while a job is running and no issue has been recorded yet:
    - `StopResponding` (1): status `Run` and no status-report reply for longer than both 10 × the query period and 5 s. Marlin variant: no activity for 10 s, more than 10 × the period, and no status for 5 s.
    - `UnexpectedReset` (3): a welcome banner (`Grbl …`, `GrblHAL …`, …) arrives during `Run`.
    - `UnexpectedDisconnect` (4): the port closes during `Run` without user action.
    - `MachineAlarm` (5): `ALARM:` received while a program is running.
  - User-caused issues are recorded but not shown: `ManualReset` (−1), `ManualDisconnect` (−2), `ManualAbort` (−3).
  - Shown issues also play the "Fatal" sound and send a Telegram notification `Job Issue` (if configured; see [[lg-app-features]]).
  - The last issue feeds the Resume Job dialog's homing suggestion (see [[lg-streaming]]).
  - It does **not** inspect configuration (laser mode, buffer settings).
- **Upstream source:** [`LaserGRBL/IssueDetectorForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/IssueDetectorForm.cs), [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`DetectedIssue`, `SetIssue`, `DetectHang`, `DetectUnexpectedReset`, `CloseCom`, `ManageStandardBlockingAlarm`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`OnIssueDetected`)
- **webgrbl notes:** Status: not started. Web Serial adds causes of its own: a `disconnect` event on `navigator.serial` (USB unplug), `readable` stream errors (`BreakError`, `BufferOverrunError`, `FramingError`, `ParityError`), and background-tab timer throttling, which can starve the status poll. Run the status poll and serial I/O in a dedicated Worker so throttling does not cause false `StopResponding`. Show human-readable causes with actions. Add config-health checks at connect (e.g. `$32=0`, `$10` missing buffer report, `$13=1`) as non-blocking warnings.

### LG-CFG-11 Buffer-stuck detection and manual unlock

- **What it does:** Detects when LaserGRBL thinks GRBL's RX buffer is full because `ok` replies were lost (for example to electrical noise), and recovers.
- **Where in the UI:** The status bar buffer progress bar (tooltip `Buffer: used/size Free:n`) turns red (error state) when stuck. The **unlock-from-stuck** status bar button then becomes enabled and asks for confirmation ("Unlock buffer": "If the buffer is blocked, it is because there was some communication problem with your engraver. If you press OK LaserGRBL will ignore the full buffer and send the next commands…").
- **Options & defaults:** Auto-recovery requires `$10` to include the buffer report (`Bf:` field), e.g. `$10=3` on GRBL 1.1.
- **Behaviour & gotchas:**
  - Stuck = status `Run`, pending commands exist, local used buffer > 0, and no movement or reply for 10 s.
  - **Auto**: if stuck and the status report `Bf:` free-bytes equals the full buffer size, it fakes `ok` for every pending command and logs "Unlock from buffer stuck!".
  - **Manual**: the same, after the user confirms.
  - Buffer size: default 127. `[OPT:…,blocks,rx]` from `$I` enlarges it if larger (trusted). Otherwise the first `Bf:` value is accepted only if it is one of 128, 255, 256, 10240 or 254 (see [[lg-streaming]]).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`HandleMissingOK`, `IsBufferStuck`, `UnlockFromBufferStuck`, `CreateFakeOK`, `ParseBf`, `EnlargeBuffer`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`BtnUnlockFromStuck_Click`, `TimerUpdate`)
- **webgrbl notes:** Status: not started. Keep this. Lost bytes are rarer over USB CDC but still happen on CH340 boards. At connect, warn when `$10` lacks the buffer bit. Log the event in the console with a timestamp.

### LG-CFG-12 Firmware version and build detection, `$I` at connect

- **What it does:** Identifies the firmware family, version, vendor and RX buffer size, which select the CSV tables and feature support (`SupportTrueJogging`, `SupportOverride`, `SupportCSV`, `SupportLaserMode` are all `version ≥ 1.1`).
- **Where in the UI:** No dedicated view. The welcome line appears in the console, and vendor menus (Ortur, Longer) appear when those vendors are detected (see [[lg-app-features]]).
- **Options & defaults:** `Query MachineInfo ($I) at connect`, default **true**. The detected version is persisted (`Last GrblVersion known`) and used before the next connect.
- **Behaviour & gotchas:**
  - Banner parsing (fixed character offsets):

| Banner | Example | Result |
|---|---|---|
| `Grbl X.Yb` | `Grbl 1.1h ['$' for help]` | v1.1h |
| `GrblHAL X.Yb` | `GrblHAL 1.1f ['$' or '$HELP' for help]` | v1.1f, IsHAL |
| `Grbl-Vigo:` | `Grbl-Vigo:1.1f\|Build:G-20170131-V3.0-20200720` | vendor `Grbl-Vigo`, vendor version = third `:` field |
| `SimpleLaser X.Yb` | | vendor `SimpleLaser` |
| `Ortur …` / `Aufero …` | `Ortur Laser Master 3 Ready!` | vendor name (with `Ready` and `!` stripped). Sets IsOrtur |
| `OLF…` | `OLF 170.` | Ortur firmware number (`OrturFWVersionNumber`, e.g. 170) |
| `[Machine:…]` / `[Software:…]` | `[Machine:NanoDuo]` | Longer vendor/version, forces v1.1f |
| other `<word> X.Yb` (first banner only) | `Foo 1.1f` | vendor = word |

  - Vendor flags: IsOrtur if the vendor contains "Ortur" or "Aufero". IsLonger if it contains "Longer" or "NanoDuo". `IsLuckyWiFi` (offers WiFi setup) for `Ortur Laser Master 3`, `Longer Nano` or `NanoDuo`.
  - A new banner also resets queues and overrides (`OnStartupMessage`).
  - `$I` is sent 500 ms after connect (after `$$`) on a private queue with a 10 s reply timeout. `[VER:…]` is parsed but unused. `[OPT:letters,blocks,rxbuffer]` → if rxbuffer > 127 it becomes the trusted buffer size. The `$I` output is **not** shown to the user, and the build/option letters are not decoded.
  - With no version known, status-report shape is used to guess ([[lg-machine-control]] LG-CTRL-14).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`GrblVersionInfo`, `ManageReceivedLine`, `Manage*WelcomeMessage`, `ManageOrturModelMessage`, `ManageOrturFirmwareMessage`, `ManageLongerModelMessage`, `RefreshMachineInfo`, `ManageOptMessage`, `ManageVerMessage`)
- **webgrbl notes:** Status: not started. Parse banners with regexes, not fixed offsets (offsets break on two-digit minor versions). Show a "Machine info" panel with banner, `[VER:]`, decoded `[OPT:]` letters (V variable spindle, N line numbers, M mist, C CoreXY, P parking, Z homing force origin, H homing single axis, T two limit switches on one pin, A allow feed override during probe, D spindle direction as enable pin, 0 spindle enable off with zero speed, S software limit pin debouncing, R parking override control, + safety door input, * restore all EEPROM disabled, $ restore EEPROM `$` settings disabled, # restore parameters disabled, I build info write disabled, E force sync on EEPROM write disabled, W force sync on WCO change disabled, L homing init lock), block count and RX size. Use `SerialPort.getInfo()` USB IDs as an extra hint.

### LG-CFG-13 Parser state (`$G`), check mode (`$C`) and other `$` commands

- **What it does:** LaserGRBL has **no UI** for these. Users type them in the manual command box ([[lg-streaming]]).
- **Where in the UI:** Manual command textbox only.
- **Options & defaults:** —
- **Behaviour & gotchas:** `$G` replies (`[GC:…]`) are logged as feedback but not parsed. `$C` toggles GRBL check mode: the `Check` state is shown in green, and **"Send to machine" is allowed in Check** (`CanSendFile` accepts Idle or Check). The loop-count repeat is suppressed in Check. `$#`, `$N`, `$RST=`, `$SLP` and `$I` output are just logged. Note that manual commands are uppercased by `GrblCommand` unless sent from a custom button (which preserves case).
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`CanSendFile`, `IdleOrCheck`, `OnProgramEnd`), [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs)
- **webgrbl notes:** Status: not started. Improvement opportunity: a "Validate job" button that runs `$C`, streams the file, collects errors with line numbers, and toggles `$C` back off. A parser-state panel from `$G` (WCS, units, distance mode, M3/M4, F, S). A WCS table from `$#` with G54–G59 editing. Restore defaults (`$RST=$`, `$RST=#`, `$RST=*`) behind strong confirmation.

### LG-CFG-14 Firmware type selection

- **What it does:** Chooses the protocol core: Grbl, Smoothie, Marlin or VigoWork.
- **Where in the UI:** Settings dialog, firmware combo box. Changing it prompts for a restart. The main menu caption shows the type name.
- **Options & defaults:** `Firmware Type`, default **Grbl**.
- **Behaviour & gotchas:** Config editing exists only for Grbl and VigoWork (hidden for Smoothie and Marlin; Marlin `RefreshConfig` and `RefreshMachineInfo` are no-ops). Smoothie: no reset on connect, newline sent at init, `F:` carries `f,s`, synchronous streaming, legacy jog. Marlin: `M114` polling, synchronous streaming, no reset/unlock. VigoWork: `0x88` status, `<VSta…|SBuf:recv,managed,errors>` reports that are converted into synthetic `ok`/`error:99`, and secret begin/end job tokens. Full control differences: [[lg-machine-control]] LG-CTRL-22. Connection-side details: [[lg-connection]].
- **Upstream source:** [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (core construction), [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs), [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs)
- **webgrbl notes:** Status: not started. Auto-detect from the banner and keep a manual override per machine profile. Skip VigoWork (proprietary handshake) unless requested.

### LG-CFG-15 Vendor WiFi configuration through settings

- **What it does:** Configures station-mode WiFi on supported vendor boards over USB, then offers to reconnect over the network.
- **Where in the UI:** Menu items "Configure WiFi" (Ortur and Longer variants) and a one-time prompt after connecting a WiFi-capable board over USB (suppressed by `Suppress WiFI Prompt Message`). Visible only for `IsLuckyWiFi` boards on serial transports.
- **Options & defaults:** —
- **Behaviour & gotchas:**
  - Ortur: `$74=<ssid>`, `$75=<password>`, `$WRS` (case preserved). It then waits for `[MSG:Get IP a.b.c.d]` and offers a Telnet connection on `$305` (default 23).
  - Longer: `$radio/mode=sta`, `$sta/ssid=<ssid>`, `$sta/password=<pwd>`, `$wifi/begin`. It waits for `[MSG:Connected with a.b.c.d]` and offers port 8847.
  - Errors are ignored. Details: [[lg-connection]].
- **Upstream source:** [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) (`WriteWiFiConfig`, `WriteOrturWiFi`, `WriteLongerWiFi`, `ManageStaIPMessage`, `ManageLongerIPMessage`), [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) (`PromptForWiFi`, `ShowWiFiConfig`), [`LaserGRBL/WiFiConfigurator/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/WiFiConfigurator)
- **webgrbl notes:** Status: not started. Browsers cannot open raw TCP/Telnet sockets, so the network connection itself needs a WebSocket bridge (some vendor firmwares expose one) or is out of scope. Writing the WiFi settings over Web Serial is still possible. Mask password fields and never log them in the console.

## Reference tables

Copied verbatim from the bundled CSVs at the pinned commit (spelling kept). "Unit" is the CSV unit column.

### `$` settings: GRBL v1.1 (`setting_codes.v1.1.csv`, default table)

| $ | Setting | Unit | Description |
|---|---|---|---|
| 0 | Step pulse time | microseconds | Sets time length per step. Minimum 3usec. |
| 1 | Step idle delay | milliseconds | Sets a short hold delay when stopping to let dynamics settle before disabling steppers. Value 255 keeps motors enabled with no delay. |
| 2 | Step pulse invert | mask | Inverts the step signal. Set axis bit to invert (00000ZYX). |
| 3 | Step direction invert | mask | Inverts the direction signal. Set axis bit to invert (00000ZYX). |
| 4 | Invert step enable pin | boolean | Inverts the stepper driver enable pin signal. |
| 5 | Invert limit pins | boolean | Inverts all of the limit input pins. |
| 6 | Invert probe pin | boolean | Inverts the probe input pin signal. |
| 10 | Status report options | mask | Alters data included in status reports. |
| 11 | Junction deviation | millimeters | Sets how fast Grbl travels through consecutive motions. Lower value slows it down. |
| 12 | Arc tolerance | millimeters | Sets the G2 and G3 arc tracing accuracy based on radial error. Beware: A very small value may effect performance. |
| 13 | Report in inches | boolean | Enables inch units when returning any position and rate value that is not a settings value. |
| 20 | Soft limits enable | boolean | Enables soft limits checks within machine travel and sets alarm when exceeded. Requires homing. |
| 21 | Hard limits enable | boolean | Enables hard limits. Immediately halts motion and throws an alarm when switch is triggered. |
| 22 | Homing cycle enable | boolean | Enables homing cycle. Requires limit switches on all axes. |
| 23 | Homing direction invert | mask | Homing searches for a switch in the positive direction. Set axis bit (00000ZYX) to search in negative direction. |
| 24 | Homing locate feed rate | mm/min | Feed rate to slowly engage limit switch to determine its location accurately. |
| 25 | Homing search seek rate | mm/min | Seek rate to quickly find the limit switch before the slower locating phase. |
| 26 | Homing switch debounce delay | milliseconds | Sets a short delay between phases of homing cycle to let a switch debounce. |
| 27 | Homing switch pull-off distance | millimeters | Retract distance after triggering switch to disengage it. Homing will fail if switch isn't cleared. |
| 30 | Maximum spindle speed | RPM | Maximum spindle speed. Sets PWM to 100% duty cycle. |
| 31 | Minimum spindle speed | RPM | Minimum spindle speed. Sets PWM to 0.4% or lowest duty cycle. |
| 32 | Laser-mode enable | boolean | Enables laser mode. Consecutive G1/2/3 commands will not halt when spindle speed is changed. |
| 100 | X-axis travel resolution | step/mm | X-axis travel resolution in steps per millimeter. |
| 101 | Y-axis travel resolution | step/mm | Y-axis travel resolution in steps per millimeter. |
| 102 | Z-axis travel resolution | step/mm | Z-axis travel resolution in steps per millimeter. |
| 110 | X-axis maximum rate | mm/min | X-axis maximum rate. Used as G0 rapid rate. |
| 111 | Y-axis maximum rate | mm/min | Y-axis maximum rate. Used as G0 rapid rate. |
| 112 | Z-axis maximum rate | mm/min | Z-axis maximum rate. Used as G0 rapid rate. |
| 120 | X-axis acceleration | mm/sec^2 | X-axis acceleration. Used for motion planning to not exceed motor torque and lose steps. |
| 121 | Y-axis acceleration | mm/sec^2 | Y-axis acceleration. Used for motion planning to not exceed motor torque and lose steps. |
| 122 | Z-axis acceleration | mm/sec^2 | Z-axis acceleration. Used for motion planning to not exceed motor torque and lose steps. |
| 130 | X-axis maximum travel | millimeters | Maximum X-axis travel distance from homing switch. Determines valid machine space for soft-limits and homing search distances. |
| 131 | Y-axis maximum travel | millimeters | Maximum Y-axis travel distance from homing switch. Determines valid machine space for soft-limits and homing search distances. |
| 132 | Z-axis maximum travel | millimeters | Maximum Z-axis travel distance from homing switch. Determines valid machine space for soft-limits and homing search distances. |

### `$` settings: GRBL v0.9 (`setting_codes.v0.9.csv`)

Same rows as v1.1 **without `$30`, `$31`, `$32`** (31 entries). The only text difference: `$5` reads "Inverts the all of the limit input pins."

### `$` settings: GRBL v0.8 (`setting_codes.v0.8.csv`)

| $ | Setting | Unit | Description |
|---|---|---|---|
| 0 | X-axis travel resolution | step/mm | X-axis travel resolution in steps per millimeter. |
| 1 | Y-axis travel resolution | step/mm | Y-axis travel resolution in steps per millimeter. |
| 2 | Z-axis travel resolution | step/mm | Z-axis travel resolution in steps per millimeter. |
| 3 | Step pulse time | microseconds | Sets time length per step. |
| 4 | Default feed rates | mm/min | This setting sets the default seek rates (G0) after Grbl powers on and initializes |
| 5 | Default seek rates | mm/min | This setting sets the default feed rates(G1 G2 G3) after Grbl powers on and initializes |
| 6 | Step port invert mask | int:00000000 | Inverts the step signal. |
| 7 | step idle delay | msec | Sets a short hold delay when stopping to let dynamics settle before disabling steppers. Value 255 keeps motors enabled with no delay. |
| 8 | acceleration | mm/sec^2 | Used for motion planning to not exceed motor torque and lose steps. |
| 9 | junction deviation | mm | Sets how fast Grbl travels through consecutive motions. Lower value slows it down. |
| 10 | arc | mm/segment | |
| 11 | n-arc correction | int | This is an advanced setting that shouldn't be changed unless there are circumstances that you need to. |
| 12 | n-decimals | int | Set how many decimal places all of the floating point values Grbl reports. |
| 13 | report inches | bool | Enables inch units when returning any position and rate value that is not a settings value. |
| 14 | auto start | bool | |
| 15 | invert step enable | bool | |
| 16 | hard limits | bool | |
| 17 | homing cycle | bool | |
| 18 | homing dir invert mask | int:00000000 | |
| 19 | homing feed | mm/min | |
| 20 | homing seek | mm/min | |
| 21 | homing debounce | msec | |
| 22 | homing pull-off | mm | |

(The CSV swaps the descriptions of `$4` and `$5`; LaserGRBL reads `$4`/`$5` as max rate X/Y on v0.8, see LG-CFG-07.)

### `$` settings: Ortur variants

- **Ortur 1.4.x** (`setting_codes.ortur.v1.4.x.csv`): v1.1 table plus `$33` G-sensor threshold (double), "Safety threshold for shock and movement detection". `$5` uses the v0.9 wording.
- **Ortur 1.5.x** (`setting_codes.ortur.v1.5.x.csv`): identical to 1.7.x below except that it ends at `$263`.
- **Ortur 1.7.x** (`setting_codes.ortur.v1.7.x.csv`). Rows `$0`–`$13`, `$20`, `$22`–`$27`, `$30`, `$31` and `$100`–`$132` match v1.1 apart from small wording changes (e.g. `$1` "Value 255 keeps motors enabled.", `$5` is a mask "Inverts the axis limit input signals.", units "mm"). Additional or changed rows:

| $ | Setting | Unit | Description |
|---|---|---|---|
| 4 | Invert step enable pin | boolean | Inverts the stepper driver enable signals (active low). If the stepper drivers shares the same enable signal only X is used. |
| 14 | Invert control pins | mask | Inverts the control signals (active low). |
| 15 | Invert coolant pins | mask | Inverts the coolant and mist signals (active low). |
| 16 | Invert spindle signals | mask | Inverts the spindle on counterclockwise and PWM signals (active low). |
| 17 | Pullup disable control pins | mask | Disable the control signals pullup resistors. Potentially enables pulldown resistor if available. |
| 18 | Pullup disable limit pins | mask | Disable the limit signals pullup resistors. Potentially enables pulldown resistor if available. |
| 19 | Pullup disable probe pin | boolean | Disable the probe signal pullup resistor. Potentially enables pulldown resistor if available. |
| 21 | Hard limits enable | mask | When enabled immediately halts motion and throws an alarm when switch is triggered. In strict mode only homing is possible after switch is triggered. |
| 28 | G73 Retract distance | mm | G73 retract distance (for chip breaking drilling). |
| 29 | Pulse delay | microseconds | Step pulse delay. |
| 32 | Mode of operation | integer | Laser mode: consecutive G1/2/3 commands will not halt when spindle speed is changed. Lathe mode: allows use of G7/G8/G96 and G97. |
| 33 | PWM frequency | Hz | PWM frequency. |
| 34 | PWM off value | percent | PWM off value in percent (duty cycle). |
| 35 | PWM min value | percent | PWM min value in percent (duty cycle). |
| 36 | PWM max value | percent | PWM max value in percent (duty cycle). |
| 37 | Steppers deenergize | mask | Specifies which steppers not to disable when stopped. |
| 39 | Enable legacy RT commands | boolean | Enables "normal" processing of ? ! and ~ characters when part of $setting or comment. If disabled then they are added to the input string instead. |
| 40 | Limit jog commands | boolean | Limit jog commands to machine limits for homed axes. |
| 41 | Safety Door | boolean | Enable Safety Door. |
| 42 | Safety Door | mask | Define which axis that performs the parking motion. |
| 43 | Homing passes | integer | Number of homing passes. Minimum 1 maximum 128. |
| 44 | Axes homing | mask | Axes to home in first pass. |
| 45 | Axes homing | mask | Axes to home in second pass. |
| 46 | Axes homing | mask | Axes to home in third pass. |
| 56 | Safety Door | boolean | Spindle pull out and plunge distance in mm. Incremental distance. |
| 57 | Safety Door | integer | Pull out/plunge slow feed rate in mm/min. |
| 58 | Safety Door | integer | Parking axis target. In mm  as machine coordinate |
| 59 | Safety Door | integer | Parking fast rate after pull out in mm/min. |
| 60 | Restore overrides | boolean | Restore overrides to default values at program end. |
| 61 | Ignore door when idle | boolean | Enable this if it is desirable to open the safety door when in IDLE mode (eg. for jogging). |
| 62 | Sleep enable | boolean | Enable sleep mode. |
| 63 | Disable laser | boolean | Disable laser during hold. |
| 64 | Force init alarm | boolean | Starts Grbl in alarm mode after a cold reset. |
| 65 | Check limits at init | boolean | If limit switches are engaged after reset this forces Grbl to start in alarm mode. |
| 259 | Ortur Flame Sensor Debug | boolean | Flame Sensor Debug Mode (On/OFF) |
| 260 | Ortur Flame Sensor Delta | integer | Flame Sensor Trigger Delta Value |
| 261 | Ortur Flame Sensor Count | integer | Flame Sensor Trigger Count Treshold |
| 262 | Ortur Gshock Sensor Threshold | integer | Gshock Sensor Treshold |
| 263 | Ortur Auto Power Off | minutes | Auto Power Off in Minutes |
| 264 | DLC Total Duration | seconds | Digital Laser Control - Total Laser Duration in Seconds |
| 265 | DLC Calibration Focus | mm | Digital Laser Control - Calibration Focus for Autofocus |
| 266 | DLC Communication Rate | | Digital Laser Control - Communication Rate |
| 267 | DLC Mode | boolean | Digital Laser Control- Laser-driven mode (Default PWM mode, Digital mode) |
| 268 | Console Echo Debug | | Set Echo Debug On Console (Default 0) [Incompatible with LightBurn Versions Under 1.0.0] |
| 269 | Power Source Debug | | Set Debug Output for Output Voltage and Current. Allows diagnostics on input power source |
| 270 | Offline controller Baud Rate | integer | Set the Baud Rate for offline screen communication x100 (default 5120) |

- **Ortur grblHAL** (`setting_codes.ortur.GrblHal.csv`, 114 rows). Codes and names (descriptions in the file):
  - `$0` Step pulse time (min 2 µs), `$1` Step idle delay, `$2` Step pulse invert, `$3` Step direction invert, `$4` Invert stepper enable pin(s), `$5` Invert limit pins, `$7` Disable spindle with zero speed.
  - `$10` Status report options, `$11` Junction deviation, `$12` Arc tolerance, `$13` Report in inches, `$14` Invert control pins, `$15` Invert coolant pins, `$16` Invert spindle signals, `$17` Pullup disable control pins, `$18` Pullup disable limit pins.
  - `$20` Soft limits enable, `$21` Hard limits enable, `$22` Homing cycle, `$23`–`$27` homing direction/feed/seek/debounce/pull-off, `$28` G73 Retract distance, `$29` Pulse delay.
  - `$30` / `$31` max/min spindle speed, `$32` Mode of operation, `$33` Spindle PWM frequency, `$34`–`$36` Spindle PWM off/min/max value (%), `$37` Steppers deenergize, `$39` Enable legacy RT commands, `$40` Limit jog commands, `$43` Homing passes, `$44`–`$46` Axes homing first/second/third pass.
  - `$62` Sleep enable, `$63` Feed hold actions, `$64` Force init alarm.
  - `$70` Network Services, `$73` WiFi Mode, `$74` WiFi Station (STA) SSID (string), `$75` WiFi Station (STA) Password (string), `$76` WiFi Access Point (AP) SSID, `$77` WiFi Access Point (AP) Password.
  - `$100`–`$132` per-axis resolution, max rate, acceleration and max travel; `$140`–`$142` motor current (mA); `$150`–`$152` microsteps; `$160`–`$162` backlash compensation (mm); `$200`–`$202` StallGuard4 fast threshold; `$210`–`$212` hold current (%); `$220`–`$222` StallGuard4 slow threshold.
  - `$300` Hostname, `$302` IP Address, `$303` Gateway, `$304` Netmask, `$305` Telnet port, `$306` HTTP port, `$307` Websocket port, `$308` FTP port, `$310` Hostname (AP), `$312`–`$314` AP IP/Gateway/Netmask.
  - `$330` Admin Password, `$331` User Password, `$339` Sensorless homing, `$341` Tool change mode, `$342` Tool change probing distance, `$343` Tool change locate feed rate, `$344` Tool change search seek rate, `$345` Tool change probe pull-off rate, `$384` Disable G92 persistence.
  - `$600` Power log enable, `$601` Voltage offset, `$602` device auto poweroff time (s), `$603` Shock detection alarm threshold (0–1000, recommended 3, 0 = off), `$604` Skew detection alarm threshold (0–1000, recommended 4, 0 = off), `$605` Buzz enable, `$606` Homing upon power up enable, `$607` Report echo line received enable, `$608` Return Line number enable, `$609` Homing switch seek pull-off distance, `$610` Language, `$611` Auto power on forever, `$612` Webui auth enable, `$622` Homing cycle (duplicate of `$22` text).

### `$` settings: Longer NanoDuo (`setting_codes.longer.nanoduo.csv`)

Same 34 codes as v1.1. Differences: `$0` "Minimum 1 usec.", the masks in `$2`, `$3` and `$23` are written `000000YX` (2-axis machine), and `$12` reads "may affect performance".

### Error codes

Standard (`error_codes.csv`, used for stock GRBL and every vendor not listed below):

| Code | Brief | Description |
|---|---|---|
| 1 | Expected command letter | G-code words consist of a letter and a value. Letter was not found. |
| 2 | Bad number format | Missing the expected G-code word value or numeric value format is not valid. |
| 3 | Invalid statement | Grbl '$' system command was not recognized or supported. |
| 4 | Value < 0 | Negative value received for an expected positive value. |
| 5 | Setting disabled | Homing cycle failure. Homing is not enabled via settings. |
| 6 | Value < 3 usec | Minimum step pulse time must be greater than 3usec. |
| 7 | EEPROM read fail. Using defaults | An EEPROM read failed. Auto-restoring affected EEPROM to default values. |
| 8 | Not idle | Grbl '$' command cannot be used unless Grbl is IDLE. Ensures smooth operation during a job. |
| 9 | G-code lock | G-code commands are locked out during alarm or jog state. |
| 10 | Homing not enabled | Soft limits cannot be enabled without homing also enabled. |
| 11 | Line overflow | Max characters per line exceeded. Received command line was not executed. |
| 12 | Step rate > 30kHz | Grbl '$' setting value cause the step rate to exceed the maximum supported. |
| 13 | Check Door | Safety door detected as opened and door state initiated. |
| 14 | Line length exceeded | Build info or startup line exceeded EEPROM line length limit. Line not stored. |
| 15 | Travel exceeded | Jog target exceeds machine travel. Jog command has been ignored. |
| 16 | Invalid jog command | Jog command has no '=' or contains prohibited g-code. |
| 18 | Emergency stop engaged | Please rotate emergency stop button to release. |
| 20 | Unsupported command | Unsupported or invalid g-code command found in block. |
| 21 | Modal group violation | More than one g-code command from same modal group found in block. |
| 22 | Undefined feed rate | Feed rate has not yet been set or is undefined. |
| 23 | Invalid gcode ID:23 | G-code command in block requires an integer value. |
| 24 | Invalid gcode ID:24 | More than one g-code command that requires axis words found in block. |
| 25 | Invalid gcode ID:25 | Repeated g-code word found in block. |
| 26 | Invalid gcode ID:26 | No axis words found in block for g-code command or current modal state which requires them. |
| 27 | Invalid gcode ID:27 | Line number value is invalid. |
| 28 | Invalid gcode ID:28 | G-code command is missing a required value word. |
| 29 | Invalid gcode ID:29 | G59.x work coordinate systems are not supported. |
| 30 | Invalid gcode ID:30 | G53 only allowed with G0 and G1 motion modes. |
| 31 | Invalid gcode ID:31 | Axis words found in block when no command or current modal state uses them. |
| 32 | Invalid gcode ID:32 | G2 and G3 arcs require at least one in-plane axis word. |
| 33 | Invalid gcode ID:33 | Motion command target is invalid. |
| 34 | Invalid gcode ID:34 | Arc radius value is invalid. |
| 35 | Invalid gcode ID:35 | G2 and G3 arcs require at least one in-plane offset word. |
| 36 | Invalid gcode ID:36 | Unused value words found in block. |
| 37 | Invalid gcode ID:37 | G43.1 dynamic tool length offset is not assigned to configured tool length axis. |

Ortur grblHAL (`error_codes.ortur.GrblHal.csv`): codes 1–16 and 20–37 have the same briefs. The descriptions differ slightly: "$' system command…", 5 "Homing is not configured via settings", 6 "Step pulse time must be greater or equal to 2 microseconds", 7 "A settings read failed…", and 8, 12 and 14 drop "Grbl"/"EEPROM". Additional codes:

| Code | Brief | Description |
|---|---|---|
| 17 | PWM is needed | Laser mode requires PWM output. |
| 18 | Reset asserted | Reset asserted |
| 19 | Non positive value | Non positive value |
| 38 | Invalid gcode ID:38 | Tool number greater than max supported value or undefined tool selected. |
| 39 | Invalid gcode ID:39 | Value out of range. |
| 40 | Invalid gcode ID:40 | G-code command not allowed when tool change is pending. |
| 41 | Invalid gcode ID:41 | Spindle not running when motion commanded in CSS or spindle sync mode. |
| 42 | Invalid gcode ID:42 | Plane must be ZX for threading. |
| 43 | Invalid gcode ID:43 | Max. feed rate exceeded. |
| 44 | Invalid gcode ID:44 | RPM out of range. |
| 45 | Invalid gcode ID:45 | Only homing is allowed when a limit switch is engaged. |
| 46 | Invalid gcode ID:46 | Home machine to continue. |
| 47 | Invalid gcode ID:47 | ATC: current tool is not set. Set current tool with M61. |
| 48 | Invalid gcode ID:48 | Value word conflict. |
| 49 | POST Failed | Power on self test failed. A hard reset is required. |
| 50 | Emergency stop | Emergency stop active. |
| 51 | Motor fault | Motor fault. |
| 52 | Value out of range | Setting value is out of range. |
| 53 | Invalid gcode ID:53 | Setting is not available  possibly due to limited driver support. |
| 54 | Invalid gcode ID:54 | Retract position is less than drill depth. |
| 60 | SD Error 60 | SD Card mount failed. |
| 61 | SD Error 61 | SD Card file open/read failed. |
| 62 | SD Error 62 | SD Card directory listing failed. |
| 63 | SD Error 63 | SD Card directory not found. |
| 64 | SD Error 64 | SD Card file empty. |
| 65 | Function error | function is error. |
| 90 | WiFi error | WiFi error. |

Longer NanoDuo (`error_codes.longer.nanoduo.csv`). This is a **renumbered** set in the FluidNC/Grbl_ESP32 style. Brief and description are identical, so only one column is shown:

| Code | Message | Code | Message |
|---|---|---|---|
| 1 | Expected GCodecommand letter | 32 | Gcode invalid target |
| 2 | Bad GCode number format | 33 | Gcode arc radius error |
| 3 | Invalid $ statement | 34 | Gcode no offsets in plane |
| 4 | Negative value | 35 | Gcode unused words |
| 5 | Setting disabled | 36 | Gcode G43 dynamic axis error |
| 6 | Step pulse too short | 37 | Gcode max value exceeded |
| 7 | Failed to read settings | 38 | P param max exceeded |
| 8 | Command requires idle state | 39 | Failed to mount device |
| 9 | GCode cannot be executed in lock or alarm state | 40 | Failed to read |
| 10 | Soft limit error | 41 | Failed to open directory |
| 11 | Line too long | 42 | Directory not found |
| 12 | Max step rate exceeded | 43 | File empty |
| 13 | Check door | 44 | File not found |
| 14 | Startup line too long | 45 | Failed to open file |
| 15 | Max travel exceeded during jog | 46 | Device is busy |
| 16 | Invalid jog command | 47 | Failed to delete directory |
| 17 | Laser mode requires PWM output | 48 | Failed to delete file |
| 18 | No Homing/Cycle defined in settings | 49 | Bluetooth failed to start |
| 19 | Unsupported GCode command | 50 | WiFi failed to start |
| 20 | Gcode modal group violation | 51 | Number out of range for setting |
| 21 | Gcode undefined feed rate | 52 | Invalid value for setting |
| 22 | Gcode command value not integer | 53 | Failed to send message |
| 23 | Gcode axis command conflict | 54 | Failed to store setting |
| 24 | Gcode word repeated | 55 | Failed to get setting status |
| 25 | Gcode no axis words | 56 | Authentication failed! |
| 26 | Gcode invalid line number | 57 | Another interface is busy |
| 27 | Gcode value word missing | 58 | Jog Cancelled |
| 28 | Gcode unsupported coordinate system | 59 | Zip file failed to open |
| 29 | Gcode G53 invalid motion mode | 60 | Failed to get information from zip file |
| 30 | Gcode extra axis words | 61 | The upgraded firmware was not found |
| 31 | Gcode no axis words in plane | 62 | Upgrade failed |

### Alarm codes

Standard (`alarm_codes.csv`):

| Code | Brief | Description |
|---|---|---|
| 1 | Hard limit | Hard limit has been triggered. Machine position is likely lost due to sudden halt. Re-homing is highly recommended. |
| 2 | Soft limit | Soft limit alarm. G-code motion target exceeds machine travel. Machine position retained. Alarm may be safely unlocked. |
| 3 | Abort during cycle | Reset while in motion. Machine position is likely lost due to sudden halt. Re-homing is highly recommended. |
| 4 | Probe fail | Probe fail. Probe is not in the expected initial state before starting probe cycle when G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered. |
| 5 | Probe fail | Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4. |
| 6 | Homing fail | Homing fail. The active homing cycle was reset. |
| 7 | Homing fail | Homing fail. Safety door was opened during homing cycle. |
| 8 | Homing fail | Homing fail. Pull off travel failed to clear limit switch. Try increasing pull-off setting or check wiring. |
| 9 | Homing fail | Homing fail. Could not find limit switch within search distances. Try increasing max travel or decreasing pull-off distance or check wiring. |

Ortur grblHAL (`alarm_codes.ortur.GrblHal.csv`) = 1–9 as above, plus:

| Code | Brief | Description |
|---|---|---|
| 10 | EStop fail | EStop asserted. Clear and reset |
| 11 | Homing required | Homing required. Execute homing command ($H) to continue. |
| 12 | Hard limit | Limit switch engaged. Clear before continuing. |
| 13 | Probe fail | Probe protection triggered. Clear before continuing. |
| 14 | Spindle timeout | Spindle at speed timeout. Clear before continuing. |
| 15 | Homing fail | Homing fail. Could not find second limit switch for auto squared axis within search distances. Try increasing max travel decreasing pull-off distance or check wiring. |
| 16 | POS fail | Power on selftest (POS) failed. |
| 17 | Motor fault | Motor fault. |

Longer NanoDuo (`alarm_codes.longer.nanoduo.csv`) = 1–9 as above, plus:

| Code | Brief | Description |
|---|---|---|
| 10 | SpindleControl | Spindle Control |
| 11 | MontionSensor | Warning!! MOTION Sensor Triggered |
| 12 | FlameSensor | Warning!! FLAME Sensor Triggered |
| 13 | TemperatureSensor | Warning!! TEMPERATURE Sensor Triggered |

## Upstream Source

- [`LaserGRBL/GrblConfig.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblConfig.cs) - `$$` editor dialog: read, write, import, export, close prompt, validation hook
- [`LaserGRBL/Core/GrblCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/GrblCore.cs) - `RefreshConfig`, `WriteConfig`, `GrblConfST` (config model and derived values), `GrblVersionInfo`, banner parsing, `$I`, issue detection, buffer-stuck recovery, WiFi writes
- [`LaserGRBL/GrblCommand.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/GrblCommand.cs) - `CSVD` table selection, error/alarm/setting decoding in the log, `IsWriteEEPROM`
- [`LaserGRBL/CSV/CsvDictionary.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV/CsvDictionary.cs) - CSV loader
- [`LaserGRBL/CSV/`](https://github.com/arkypita/LaserGRBL/tree/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/CSV) - setting, error and alarm tables per firmware
- [`LaserGRBL/IssueDetectorForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/IssueDetectorForm.cs) - issue dialog
- [`LaserGRBL/Core/SmoothieCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/SmoothieCore.cs), [`LaserGRBL/Core/MarlinCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/MarlinCore.cs), [`LaserGRBL/Core/VigoCore.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/Core/VigoCore.cs) - firmware variants (config disabled for Smoothie and Marlin)
- [`LaserGRBL/SettingsForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/SettingsForm.cs) - firmware type, issue detector toggle, `$I` query toggle
- [`LaserGRBL/MainForm.cs`](https://github.com/arkypita/LaserGRBL/blob/1f9337b3af27133f8b1696e41cc110f2af74d04f/LaserGRBL/MainForm.cs) - menu entry, issue dialog trigger, buffer-stuck button, WiFi prompt

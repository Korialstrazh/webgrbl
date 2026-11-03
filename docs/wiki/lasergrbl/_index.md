---
title: LaserGRBL Feature Reference
created: 2026-10-30
provenance: LaserGRBL upstream https://github.com/arkypita/LaserGRBL at commit 1f9337b3af27133f8b1696e41cc110f2af74d04f (2025-05-29)
---

# LaserGRBL Feature Reference

Catalog of every LaserGRBL feature, written as the reference for building webgrbl to at least feature parity (see [[vision]]). Each article describes the user-facing behaviour, options and defaults, exact GRBL commands, upstream quirks, and links to the C# source pinned to one upstream commit.

## Key Takeaways

- **Feature IDs.** Every feature has a stable ID (`LG-<AREA>-NN`). Use it in specs, plans, commits and the checklist below, so a requirement can be traced back to its upstream behaviour.
- **Look things up in this order.** Read the article first. For algorithm detail, follow its permalinks or read the local clone at `.reference/LaserGRBL/` (gitignored, read-only, never built or run). To recreate it: `git clone --depth 1 https://github.com/arkypita/LaserGRBL.git .reference/LaserGRBL`, then `git -C .reference/LaserGRBL checkout 1f9337b3af27133f8b1696e41cc110f2af74d04f` (fetch that commit if the shallow clone has moved on).
- **Upstream quirks are documented, not prescribed.** Some upstream behaviour is a bug or a legacy compromise: the soft abort that leaves the planner running, G20 ignored, `WPos.*` returning MPos, conflicting defaults. Articles flag these under "Behaviour & gotchas". webgrbl decides case by case whether to fix them.
- **Online endpoints are null in the public source.** These cover auto-update, material DB refresh, usage stats, Telegram and laser statistics. Their payloads cannot be verified from the code.
- **Licensing.** LaserGRBL is GPLv3, and the Potrace tracer it bundles is GPL too. Re-implement behaviour from these descriptions, and check licence compatibility before porting code or bundling GPL libraries (for example a WASM Potrace build).
- **Keeping this current.** When a webgrbl feature ships, set its row's status in the checklist and fill the feature's "webgrbl notes" with the matching webgrbl wiki article. That article's `## Source` lists webgrbl's own files; these articles have no `## Source` because they describe external code.

## Articles

- [[lg-connection]] - Transports (serial, telnet, WebSocket, emulator), handshake and version detection, firmware cores (Grbl/Smoothie/Marlin/Vigo), Wi-Fi discovery and setup, firmware flashing, logs.
- [[lg-streaming]] - Character-counting streaming, status polling, realtime commands and overrides, job lifecycle, passes, run-from-position, resume after failure, error handling, console.
- [[lg-machine-control]] - Jogging, homing, unlock, reset, work zero, overrides UI, status and position display, custom buttons (code language, default set with framing), hotkeys.
- [[lg-grbl-configuration]] - `$$` settings editor, import/export, issue detector, version detection, plus full reference tables of `$` settings, error codes and alarm codes per firmware.
- [[lg-gcode-files]] - Open/append/reload, file types, G-code parsing and analysis, bounding box, time estimation, advanced save (header/footer/passes), `.lps` projects.
- [[lg-svg-import]] - SVG elements, units and DPI, curve flattening, arcs, colour filter, G-code output shape.
- [[lg-raster-import]] - Image import wizard: adjustments, line-to-line, dithering (all kernels), passthrough, size and position, white skip, generated G-code.
- [[lg-vectorization]] - Potrace vectorizing, Bézier-to-biarc G2/G3, Clipper fill patterns and inset, Autotrace centerline.
- [[lg-preview]] - Toolpath rendering, grid and rulers, zoom and pan, laser cursor, progress drawing, click-to-jog, colour schemes.
- [[lg-generators]] - Power-vs-speed, cutting and shake tests, accuracy file, Hershey font, material database and power/speed helper.
- [[lg-app-features]] - Main window and full menu tree, every setting with defaults, themes, localization, auto-update, sounds, Telegram, laser lifespan, safety countdown, logs.

## Features covered in more than one article

Some features touch several areas. Their articles cross-link each other, and the checklist tracks the primary ID (listed first).

| Feature | Primary | Also in |
| --- | --- | --- |
| Realtime overrides | LG-STRM-09 | LG-CTRL-12 |
| Feed hold / resume / reset | LG-STRM-08 | LG-CTRL-09, LG-CTRL-10 |
| Machine state display | LG-STRM-07 | LG-CTRL-13 |
| Issue detector | LG-STRM-18 | LG-CFG-10 |
| Buffer-stuck recovery | LG-STRM-20 | LG-CFG-11 |
| Firmware type selection | LG-CONN-12 | LG-CFG-14 |
| Version-specific message tables | LG-CONN-16 | LG-CFG-05, LG-APP-10 |
| Vendor Wi-Fi configuration | LG-CONN-18 | LG-CFG-15 |
| Safety countdown | LG-STRM-11 | LG-APP-19 |
| Syncro start | LG-STRM-25 | LG-APP-20 |
| Click-to-jog | LG-CTRL-05 | LG-PREV-10 |
| Time estimation | LG-GCODE-08 | LG-PREV-13, LG-STRM-15 |
| Colour schemes | LG-APP-07 | LG-PREV-12 |
| Hershey font | LG-GEN-05 | LG-GCODE-12 |
| Laser module selection | LG-APP-17 | LG-CTRL-21 |
| Session / communication logs | LG-CONN-21, LG-CONN-22 | LG-APP-25 |
| CH340 driver, firmware flashing | LG-CONN-20, LG-CONN-19 | LG-APP-28 |
| Raster filling of vector shapes | LG-RAST-21 | LG-VECT-10 |

## Parity checklist

**Scope** is a first proposal, to be confirmed in brainstorming:

- `core`: needed for parity.
- `adapt`: needed, but must be reworked for the web platform. Examples: driver install becomes a driver guide, keep-awake uses the Screen Wake Lock API, file association uses PWA `file_handlers`, crash reporting has no native dialog.
- `later`: niche, vendor-specific, or needs a network bridge that browsers lack, such as raw TCP for telnet.
- `skip`: desktop- or Windows-only with no web meaning: renderer fallback, splash screen, multi-instance sync, usage telemetry, Windows serial driver workarounds, the dead SVG raster chooser.

**Status** values: `not started`, `in progress`, `done`, `improved` (beyond LaserGRBL). Update a row when its feature ships.

### Connection - [[lg-connection]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-CONN-01 | [[lg-connection#LG-CONN-01 Connection panel & protocol selection\|Connection panel & protocol selection]] | core | done |
| LG-CONN-02 | [[lg-connection#LG-CONN-02 Serial port selection & baud rate\|Serial port selection & baud rate]] | core | done |
| LG-CONN-03 | [[lg-connection#LG-CONN-03 Serial driver variants & CH340 read workaround\|Serial driver variants & CH340 read workaround]] | skip | not started |
| LG-CONN-04 | [[lg-connection#LG-CONN-04 Telnet (raw TCP) transport\|Telnet (raw TCP) transport]] | later | not started |
| LG-CONN-05 | [[lg-connection#LG-CONN-05 WebSocket transport (LaserWebESP8266)\|WebSocket transport (LaserWebESP8266)]] | later | not started |
| LG-CONN-06 | [[lg-connection#LG-CONN-06 Built-in Grbl emulator\|Built-in Grbl emulator]] | core | done |
| LG-CONN-07 | [[lg-connection#LG-CONN-07 Connect / disconnect flow\|Connect / disconnect flow]] | core | done |
| LG-CONN-08 | [[lg-connection#LG-CONN-08 Reset on connect (soft / hard)\|Reset on connect (soft / hard)]] | core | done |
| LG-CONN-09 | [[lg-connection#LG-CONN-09 Handshake: welcome & vendor message parsing\|Handshake: welcome & vendor message parsing]] | core | done |
| LG-CONN-10 | [[lg-connection#LG-CONN-10 Post-connect configuration & machine-info query\|Post-connect configuration & machine-info query]] | core | done |
| LG-CONN-11 | [[lg-connection#LG-CONN-11 Connection timeout, failed-connection help & connection-lost behaviour\|Connection timeout, failed-connection help & connection-lost behaviour]] | core | done |
| LG-CONN-12 | [[lg-connection#LG-CONN-12 Firmware type (core) selection\|Firmware type (core) selection]] | core | not started |
| LG-CONN-13 | [[lg-connection#LG-CONN-13 Smoothieware core\|Smoothieware core]] | later | not started |
| LG-CONN-14 | [[lg-connection#LG-CONN-14 Marlin core\|Marlin core]] | later | not started |
| LG-CONN-15 | [[lg-connection#LG-CONN-15 VigoWork core\|VigoWork core]] | skip | not started |
| LG-CONN-16 | [[lg-connection#LG-CONN-16 Version-dependent message dictionaries\|Version-dependent message dictionaries]] | core | not started |
| LG-CONN-17 | [[lg-connection#LG-CONN-17 Wi-Fi discovery (LAN scan)\|Wi-Fi discovery (LAN scan)]] | later | not started |
| LG-CONN-18 | [[lg-connection#LG-CONN-18 Wi-Fi setup for Ortur / Longer machines\|Wi-Fi setup for Ortur / Longer machines]] | later | not started |
| LG-CONN-19 | [[lg-connection#LG-CONN-19 Grbl firmware flashing\|Grbl firmware flashing]] | later | not started |
| LG-CONN-20 | [[lg-connection#LG-CONN-20 CH340 driver install\|CH340 driver install]] | adapt | not started |
| LG-CONN-21 | [[lg-connection#LG-CONN-21 Session log\|Session log]] | core | not started |
| LG-CONN-22 | [[lg-connection#LG-CONN-22 Extended communication log\|Extended communication log]] | core | not started |

### Job streaming & console - [[lg-streaming]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-STRM-01 | [[lg-streaming#LG-STRM-01 G-code line model (`GrblCommand`)\|G-code line model (`GrblCommand`)]] | core | done |
| LG-STRM-02 | [[lg-streaming#LG-STRM-02 Buffered streaming (character counting) & buffer size\|Buffered streaming (character counting) & buffer size]] | core | done |
| LG-STRM-03 | [[lg-streaming#LG-STRM-03 Synchronous & RepeatOnError streaming modes\|Synchronous & RepeatOnError streaming modes]] | core | not started |
| LG-STRM-04 | [[lg-streaming#LG-STRM-04 EEPROM-write synchronisation\|EEPROM-write synchronisation]] | core | done |
| LG-STRM-05 | [[lg-streaming#LG-STRM-05 Threading mode (poll rate & loop timing)\|Threading mode (poll rate & loop timing)]] | core | not started |
| LG-STRM-06 | [[lg-streaming#LG-STRM-06 Status polling & report parsing\|Status polling & report parsing]] | core | done |
| LG-STRM-07 | [[lg-streaming#LG-STRM-07 Machine states & status display\|Machine states & status display]] | core | done |
| LG-STRM-08 | [[lg-streaming#LG-STRM-08 Realtime commands: feed hold, resume, soft reset, safety door\|Realtime commands: feed hold, resume, soft reset, safety door]] | core | improved |
| LG-STRM-09 | [[lg-streaming#LG-STRM-09 Realtime overrides\|Realtime overrides]] | core | not started |
| LG-STRM-10 | [[lg-streaming#LG-STRM-10 Job start (Send to machine)\|Job start (Send to machine)]] | core | not started |
| LG-STRM-11 | [[lg-streaming#LG-STRM-11 Safety countdown\|Safety countdown]] | core | not started |
| LG-STRM-12 | [[lg-streaming#LG-STRM-12 Multiple passes (loop counter)\|Multiple passes (loop counter)]] | core | not started |
| LG-STRM-13 | [[lg-streaming#LG-STRM-13 Job completion\|Job completion]] | core | not started |
| LG-STRM-14 | [[lg-streaming#LG-STRM-14 Abort job\|Abort job]] | core | not started |
| LG-STRM-15 | [[lg-streaming#LG-STRM-15 Job progress & time projection\|Job progress & time projection]] | core | not started |
| LG-STRM-16 | [[lg-streaming#LG-STRM-16 Run from position\|Run from position]] | core | not started |
| LG-STRM-17 | [[lg-streaming#LG-STRM-17 Resume interrupted job\|Resume interrupted job]] | core | not started |
| LG-STRM-18 | [[lg-streaming#LG-STRM-18 Issue detector (job fault detection)\|Issue detector (job fault detection)]] | core | not started |
| LG-STRM-19 | [[lg-streaming#LG-STRM-19 Error & alarm handling while streaming\|Error & alarm handling while streaming]] | core | improved |
| LG-STRM-20 | [[lg-streaming#LG-STRM-20 Buffer-stuck recovery & broken-ok handling\|Buffer-stuck recovery & broken-ok handling]] | core | not started |
| LG-STRM-21 | [[lg-streaming#LG-STRM-21 Command log / console\|Command log / console]] | core | done |
| LG-STRM-22 | [[lg-streaming#LG-STRM-22 Manual command entry & history\|Manual command entry & history]] | core | done |
| LG-STRM-23 | [[lg-streaming#LG-STRM-23 Pending-queue model for side requests\|Pending-queue model for side requests]] | core | not started |
| LG-STRM-24 | [[lg-streaming#LG-STRM-24 Automatic cooling cycles\|Automatic cooling cycles]] | later | not started |
| LG-STRM-25 | [[lg-streaming#LG-STRM-25 Syncro start across instances\|Syncro start across instances]] | skip | not started |

### Machine control - [[lg-machine-control]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-CTRL-01 | [[lg-machine-control#LG-CTRL-01 Jog panel (directional pad, step and speed)\|Jog panel (directional pad, step and speed)]] | core | done |
| LG-CTRL-02 | [[lg-machine-control#LG-CTRL-02 Step jog command generation\|Step jog command generation]] | core | done |
| LG-CTRL-03 | [[lg-machine-control#LG-CTRL-03 Continuous jog\|Continuous jog]] | core | not started |
| LG-CTRL-04 | [[lg-machine-control#LG-CTRL-04 Z jog\|Z jog]] | core | not started |
| LG-CTRL-05 | [[lg-machine-control#LG-CTRL-05 Click-to-jog on the preview\|Click-to-jog on the preview]] | core | not started |
| LG-CTRL-06 | [[lg-machine-control#LG-CTRL-06 Go to work origin ("Home" jog button)\|Go to work origin ("Home" jog button)]] | core | done |
| LG-CTRL-07 | [[lg-machine-control#LG-CTRL-07 Homing cycle\|Homing cycle]] | core | done |
| LG-CTRL-08 | [[lg-machine-control#LG-CTRL-08 Unlock / kill alarm\|Unlock / kill alarm]] | core | done |
| LG-CTRL-09 | [[lg-machine-control#LG-CTRL-09 Soft reset\|Soft reset]] | core | not started |
| LG-CTRL-10 | [[lg-machine-control#LG-CTRL-10 Feed hold / resume\|Feed hold / resume]] | core | not started |
| LG-CTRL-11 | [[lg-machine-control#LG-CTRL-11 Set work zero\|Set work zero]] | core | done |
| LG-CTRL-12 | [[lg-machine-control#LG-CTRL-12 Realtime overrides (feed, rapid, power)\|Realtime overrides (feed, rapid, power)]] | core | not started |
| LG-CTRL-13 | [[lg-machine-control#LG-CTRL-13 Machine status display\|Machine status display]] | core | not started |
| LG-CTRL-14 | [[lg-machine-control#LG-CTRL-14 Position display (machine vs work coordinates)\|Position display (machine vs work coordinates)]] | core | not started |
| LG-CTRL-15 | [[lg-machine-control#LG-CTRL-15 Custom buttons: types and enable conditions\|Custom buttons: types and enable conditions]] | core | not started |
| LG-CTRL-16 | [[lg-machine-control#LG-CTRL-16 Custom button code language (placeholders, expressions, realtime bytes)\|Custom button code language (placeholders, expressions, realtime bytes)]] | core | not started |
| LG-CTRL-17 | [[lg-machine-control#LG-CTRL-17 Custom button management: storage, import/export, reorder\|Custom button management: storage, import/export, reorder]] | core | not started |
| LG-CTRL-18 | [[lg-machine-control#LG-CTRL-18 Default button set: framing and laser test fire\|Default button set: framing and laser test fire]] | core | in progress |
| LG-CTRL-19 | [[lg-machine-control#LG-CTRL-19 Hotkeys: actions and default bindings\|Hotkeys: actions and default bindings]] | core | not started |
| LG-CTRL-20 | [[lg-machine-control#LG-CTRL-20 Hotkey editor\|Hotkey editor]] | core | not started |
| LG-CTRL-21 | [[lg-machine-control#LG-CTRL-21 Laser head selection (laser life counter)\|Laser head selection (laser life counter)]] | later | not started |
| LG-CTRL-22 | [[lg-machine-control#LG-CTRL-22 Firmware-specific control differences\|Firmware-specific control differences]] | core | not started |
| LG-CTRL-23 | [[lg-machine-control#LG-CTRL-23 Command availability gates\|Command availability gates]] | core | in progress |

### GRBL configuration - [[lg-grbl-configuration]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-CFG-01 | [[lg-grbl-configuration#LG-CFG-01 GRBL settings editor dialog\|GRBL settings editor dialog]] | core | not started |
| LG-CFG-02 | [[lg-grbl-configuration#LG-CFG-02 Read configuration (`$$`)\|Read configuration (`$$`)]] | core | not started |
| LG-CFG-03 | [[lg-grbl-configuration#LG-CFG-03 Write configuration\|Write configuration]] | core | not started |
| LG-CFG-04 | [[lg-grbl-configuration#LG-CFG-04 Export / import configuration file\|Export / import configuration file]] | core | not started |
| LG-CFG-05 | [[lg-grbl-configuration#LG-CFG-05 Version-specific setting metadata (CSV tables)\|Version-specific setting metadata (CSV tables)]] | core | not started |
| LG-CFG-06 | [[lg-grbl-configuration#LG-CFG-06 Setting validation\|Setting validation]] | core | not started |
| LG-CFG-07 | [[lg-grbl-configuration#LG-CFG-07 Config values the app depends on\|Config values the app depends on]] | core | not started |
| LG-CFG-08 | [[lg-grbl-configuration#LG-CFG-08 Error code decoding\|Error code decoding]] | core | not started |
| LG-CFG-09 | [[lg-grbl-configuration#LG-CFG-09 Alarm code decoding\|Alarm code decoding]] | core | not started |
| LG-CFG-10 | [[lg-grbl-configuration#LG-CFG-10 Issue detector\|Issue detector]] | core | not started |
| LG-CFG-11 | [[lg-grbl-configuration#LG-CFG-11 Buffer-stuck detection and manual unlock\|Buffer-stuck detection and manual unlock]] | core | not started |
| LG-CFG-12 | [[lg-grbl-configuration#LG-CFG-12 Firmware version and build detection, `$I` at connect\|Firmware version and build detection, `$I` at connect]] | core | not started |
| LG-CFG-13 | [[lg-grbl-configuration#LG-CFG-13 Parser state (`$G`), check mode (`$C`) and other `$` commands\|Parser state (`$G`), check mode (`$C`) and other `$` commands]] | core | not started |
| LG-CFG-14 | [[lg-grbl-configuration#LG-CFG-14 Firmware type selection\|Firmware type selection]] | core | not started |
| LG-CFG-15 | [[lg-grbl-configuration#LG-CFG-15 Vendor WiFi configuration through settings\|Vendor WiFi configuration through settings]] | later | not started |

### G-code files & projects - [[lg-gcode-files]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-GCODE-01 | [[lg-gcode-files#LG-GCODE-01 Open file and type dispatch\|Open file and type dispatch]] | core | not started |
| LG-GCODE-02 | [[lg-gcode-files#LG-GCODE-02 Append file to the current program\|Append file to the current program]] | core | not started |
| LG-GCODE-03 | [[lg-gcode-files#LG-GCODE-03 Reload last file\|Reload last file]] | core | not started |
| LG-GCODE-04 | [[lg-gcode-files#LG-GCODE-04 Drag-and-drop and command-line opening\|Drag-and-drop and command-line opening]] | core | in progress |
| LG-GCODE-05 | [[lg-gcode-files#LG-GCODE-05 G-code file loading and line normalisation\|G-code file loading and line normalisation]] | core | not started |
| LG-GCODE-06 | [[lg-gcode-files#LG-GCODE-06 Program analysis: modal state and positions\|Program analysis: modal state and positions]] | core | not started |
| LG-GCODE-07 | [[lg-gcode-files#LG-GCODE-07 Bounding box / ranges and quadrant\|Bounding box / ranges and quadrant]] | core | not started |
| LG-GCODE-08 | [[lg-gcode-files#LG-GCODE-08 Time estimation and projected time\|Time estimation and projected time]] | core | in progress |
| LG-GCODE-09 | [[lg-gcode-files#LG-GCODE-09 Save G-code (quick and advanced)\|Save G-code (quick and advanced)]] | core | not started |
| LG-GCODE-10 | [[lg-gcode-files#LG-GCODE-10 Project files (.lps)\|Project files (.lps)]] | adapt | in progress |
| LG-GCODE-11 | [[lg-gcode-files#LG-GCODE-11 File loading events and program state\|File loading events and program state]] | core | not started |
| LG-GCODE-12 | [[lg-gcode-files#LG-GCODE-12 Hershey single-stroke font (internal)\|Hershey single-stroke font (internal)]] | core | not started |

### SVG import - [[lg-svg-import]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-SVG-01 | [[lg-svg-import#LG-SVG-01 Open an SVG file\|Open an SVG file]] | core | in progress |
| LG-SVG-02 | [[lg-svg-import#LG-SVG-02 Vector vs raster mode chooser (disabled)\|Vector vs raster mode chooser (disabled)]] | skip | not started |
| LG-SVG-03 | [[lg-svg-import#LG-SVG-03 Laser options dialog ("Target image")\|Laser options dialog ("Target image")]] | core | not started |
| LG-SVG-04 | [[lg-svg-import#LG-SVG-04 Supported elements and parsing order\|Supported elements and parsing order]] | core | not started |
| LG-SVG-05 | [[lg-svg-import#LG-SVG-05 Units, DPI, viewBox and coordinate mapping\|Units, DPI, viewBox and coordinate mapping]] | core | in progress |
| LG-SVG-06 | [[lg-svg-import#LG-SVG-06 Curve flattening (smart vs legacy Bézier)\|Curve flattening (smart vs legacy Bézier)]] | core | done |
| LG-SVG-07 | [[lg-svg-import#LG-SVG-07 Arc output (G3 for circles and rounded corners)\|Arc output (G3 for circles and rounded corners)]] | core | not started |
| LG-SVG-08 | [[lg-svg-import#LG-SVG-08 Color filter\|Color filter]] | core | improved |
| LG-SVG-09 | [[lg-svg-import#LG-SVG-09 G-code output shape\|G-code output shape]] | core | done |
| LG-SVG-10 | [[lg-svg-import#LG-SVG-10 Append SVG to the current job\|Append SVG to the current job]] | core | in progress |

### Raster import - [[lg-raster-import]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-RAST-01 | [[lg-raster-import#LG-RAST-01 Raster file import entry points and formats\|Raster file import entry points and formats]] | core | not started |
| LG-RAST-02 | [[lg-raster-import#LG-RAST-02 Wizard flow, live preview and settings persistence\|Wizard flow, live preview and settings persistence]] | core | not started |
| LG-RAST-03 | [[lg-raster-import#LG-RAST-03 Image editing toolbar\|Image editing toolbar]] | core | not started |
| LG-RAST-04 | [[lg-raster-import#LG-RAST-04 Resize interpolation\|Resize interpolation]] | core | not started |
| LG-RAST-05 | [[lg-raster-import#LG-RAST-05 Grayscale conversion formula\|Grayscale conversion formula]] | core | not started |
| LG-RAST-06 | [[lg-raster-import#LG-RAST-06 Brightness and contrast\|Brightness and contrast]] | core | not started |
| LG-RAST-07 | [[lg-raster-import#LG-RAST-07 White Clip\|White Clip]] | core | not started |
| LG-RAST-08 | [[lg-raster-import#LG-RAST-08 B&W threshold\|B&W threshold]] | core | not started |
| LG-RAST-09 | [[lg-raster-import#LG-RAST-09 Conversion tool selection\|Conversion tool selection]] | core | not started |
| LG-RAST-10 | [[lg-raster-import#LG-RAST-10 Line To Line tracing (grayscale power modulation)\|Line To Line tracing (grayscale power modulation)]] | core | not started |
| LG-RAST-11 | [[lg-raster-import#LG-RAST-11 Engraving direction and unidirectional mode\|Engraving direction and unidirectional mode]] | core | not started |
| LG-RAST-12 | [[lg-raster-import#LG-RAST-12 Quality (lines/mm) and Resolution Helper\|Quality (lines/mm) and Resolution Helper]] | core | not started |
| LG-RAST-13 | [[lg-raster-import#LG-RAST-13 Line Preview overlay\|Line Preview overlay]] | core | not started |
| LG-RAST-14 | [[lg-raster-import#LG-RAST-14 1-bit dithering\|1-bit dithering]] | core | not started |
| LG-RAST-15 | [[lg-raster-import#LG-RAST-15 Passthrough (no processing)\|Passthrough (no processing)]] | core | not started |
| LG-RAST-16 | [[lg-raster-import#LG-RAST-16 Target size and position\|Target size and position]] | core | not started |
| LG-RAST-17 | [[lg-raster-import#LG-RAST-17 Speed settings and material database\|Speed settings and material database]] | core | not started |
| LG-RAST-18 | [[lg-raster-import#LG-RAST-18 Laser mode (M3/M4) and power range (S-MIN/S-MAX)\|Laser mode (M3/M4) and power range (S-MIN/S-MAX)]] | core | not started |
| LG-RAST-19 | [[lg-raster-import#LG-RAST-19 White skip and fast-skip optimisation\|White skip and fast-skip optimisation]] | core | not started |
| LG-RAST-20 | [[lg-raster-import#LG-RAST-20 Generated G-code format (raster tools)\|Generated G-code format (raster tools)]] | core | not started |
| LG-RAST-21 | [[lg-raster-import#LG-RAST-21 Raster filling of vectorized shapes\|Raster filling of vectorized shapes]] | core | in progress |

### Vectorization - [[lg-vectorization]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-VECT-01 | [[lg-vectorization#LG-VECT-01 Vectorize! tool and image preparation\|Vectorize! tool and image preparation]] | core | not started |
| LG-VECT-02 | [[lg-vectorization#LG-VECT-02 Potrace tracing parameters\|Potrace tracing parameters]] | core | not started |
| LG-VECT-03 | [[lg-vectorization#LG-VECT-03 Adaptive quality (tracing resolution)\|Adaptive quality (tracing resolution)]] | core | not started |
| LG-VECT-04 | [[lg-vectorization#LG-VECT-04 Downsampling\|Downsampling]] | core | not started |
| LG-VECT-05 | [[lg-vectorization#LG-VECT-05 Vector preview\|Vector preview]] | core | not started |
| LG-VECT-06 | [[lg-vectorization#LG-VECT-06 Border (outline) G-code and path ordering\|Border (outline) G-code and path ordering]] | core | not started |
| LG-VECT-07 | [[lg-vectorization#LG-VECT-07 Bézier to biarc conversion (G2/G3)\|Bézier to biarc conversion (G2/G3)]] | core | not started |
| LG-VECT-08 | [[lg-vectorization#LG-VECT-08 Vector fill patterns (Clipper hatch)\|Vector fill patterns (Clipper hatch)]] | core | not started |
| LG-VECT-09 | [[lg-vectorization#LG-VECT-09 Inset filling (Clipper offset)\|Inset filling (Clipper offset)]] | core | not started |
| LG-VECT-10 | [[lg-vectorization#LG-VECT-10 Raster filling of traced shapes\|Raster filling of traced shapes]] | core | not started |
| LG-VECT-11 | [[lg-vectorization#LG-VECT-11 Filling quality\|Filling quality]] | core | not started |
| LG-VECT-12 | [[lg-vectorization#LG-VECT-12 Vector power, speed and non-PWM behaviour\|Vector power, speed and non-PWM behaviour]] | core | not started |
| LG-VECT-13 | [[lg-vectorization#LG-VECT-13 Centerline tracing (Autotrace)\|Centerline tracing (Autotrace)]] | later | not started |
| LG-VECT-14 | [[lg-vectorization#LG-VECT-14 Centerline G-code generation\|Centerline G-code generation]] | later | not started |

### Preview - [[lg-preview]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-PREV-01 | [[lg-preview#LG-PREV-01 Renderer selection and fallback\|Renderer selection and fallback]] | skip | not started |
| LG-PREV-02 | [[lg-preview#LG-PREV-02 Toolpath rendering (burning vs travel, power shading)\|Toolpath rendering (burning vs travel, power shading)]] | core | done |
| LG-PREV-03 | [[lg-preview#LG-PREV-03 Grid, origin axes and rulers\|Grid, origin axes and rulers]] | core | not started |
| LG-PREV-04 | [[lg-preview#LG-PREV-04 Bounding box and job dimensions\|Bounding box and job dimensions]] | core | not started |
| LG-PREV-05 | [[lg-preview#LG-PREV-05 Zoom, pan and auto-size\|Zoom, pan and auto-size]] | core | not started |
| LG-PREV-06 | [[lg-preview#LG-PREV-06 Laser position cursor and coordinate overlay\|Laser position cursor and coordinate overlay]] | core | not started |
| LG-PREV-07 | [[lg-preview#LG-PREV-07 Job progress drawing (executed commands)\|Job progress drawing (executed commands)]] | core | in progress |
| LG-PREV-08 | [[lg-preview#LG-PREV-08 Show/hide laser-off movements\|Show/hide laser-off movements]] | core | done |
| LG-PREV-09 | [[lg-preview#LG-PREV-09 Cross cursor and mouse coordinates\|Cross cursor and mouse coordinates]] | core | not started |
| LG-PREV-10 | [[lg-preview#LG-PREV-10 Click-to-jog on the preview\|Click-to-jog on the preview]] | core | not started |
| LG-PREV-11 | [[lg-preview#LG-PREV-11 Status overlays (loading, tips, diagnostics)\|Status overlays (loading, tips, diagnostics)]] | later | not started |
| LG-PREV-12 | [[lg-preview#LG-PREV-12 Colour schemes for the preview\|Colour schemes for the preview]] | core | not started |
| LG-PREV-13 | [[lg-preview#LG-PREV-13 Estimated / projected time display\|Estimated / projected time display]] | core | in progress |
| LG-PREV-14 | [[lg-preview#LG-PREV-14 UsageClassPreview (not a job preview)\|UsageClassPreview (not a job preview)]] | later | not started |

### Generators & material DB - [[lg-generators]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-GEN-01 | [[lg-generators#LG-GEN-01 Power vs Speed test generator\|Power vs Speed test generator]] | core | not started |
| LG-GEN-02 | [[lg-generators#LG-GEN-02 Cutting test generator\|Cutting test generator]] | core | in progress |
| LG-GEN-03 | [[lg-generators#LG-GEN-03 Shake test generator\|Shake test generator]] | later | not started |
| LG-GEN-04 | [[lg-generators#LG-GEN-04 Accuracy test file\|Accuracy test file]] | later | not started |
| LG-GEN-05 | [[lg-generators#LG-GEN-05 Hershey vector font for generator labels\|Hershey vector font for generator labels]] | core | not started |
| LG-GEN-06 | [[lg-generators#LG-GEN-06 Material database (data model, storage, updates)\|Material database (data model, storage, updates)]] | core | in progress |
| LG-GEN-07 | [[lg-generators#LG-GEN-07 Material DB editor\|Material DB editor]] | core | not started |
| LG-GEN-08 | [[lg-generators#LG-GEN-08 Power/Speed helper (apply preset to import)\|Power/Speed helper (apply preset to import)]] | core | not started |

### Application features - [[lg-app-features]]

| ID | Feature | Scope | Status |
| --- | --- | --- | --- |
| LG-APP-01 | [[lg-app-features#LG-APP-01 Main window layout and status bar\|Main window layout and status bar]] | core | not started |
| LG-APP-02 | [[lg-app-features#LG-APP-02 Main menu tree\|Main menu tree]] | core | not started |
| LG-APP-03 | [[lg-app-features#LG-APP-03 Persisted settings store\|Persisted settings store]] | core | not started |
| LG-APP-04 | [[lg-app-features#LG-APP-04 Settings dialog (all tabs and options)\|Settings dialog (all tabs and options)]] | core | not started |
| LG-APP-05 | [[lg-app-features#LG-APP-05 Retained UI settings (autosave toggles)\|Retained UI settings (autosave toggles)]] | core | not started |
| LG-APP-06 | [[lg-app-features#LG-APP-06 Window and layout persistence\|Window and layout persistence]] | core | not started |
| LG-APP-07 | [[lg-app-features#LG-APP-07 Colour schemes\|Colour schemes]] | core | not started |
| LG-APP-08 | [[lg-app-features#LG-APP-08 Native dark theming and icon set\|Native dark theming and icon set]] | adapt | not started |
| LG-APP-09 | [[lg-app-features#LG-APP-09 UI localization\|UI localization]] | core | not started |
| LG-APP-10 | [[lg-app-features#LG-APP-10 GRBL code descriptions (CSV dictionaries)\|GRBL code descriptions (CSV dictionaries)]] | core | not started |
| LG-APP-11 | [[lg-app-features#LG-APP-11 Application auto-update\|Application auto-update]] | adapt | not started |
| LG-APP-12 | [[lg-app-features#LG-APP-12 Material database refresh (online)\|Material database refresh (online)]] | later | not started |
| LG-APP-13 | [[lg-app-features#LG-APP-13 Sound events\|Sound events]] | core | not started |
| LG-APP-14 | [[lg-app-features#LG-APP-14 Telegram notifications\|Telegram notifications]] | later | not started |
| LG-APP-15 | [[lg-app-features#LG-APP-15 Usage statistics and server messages\|Usage statistics and server messages]] | skip | not started |
| LG-APP-16 | [[lg-app-features#LG-APP-16 Laser lifespan tracking\|Laser lifespan tracking]] | later | not started |
| LG-APP-17 | [[lg-app-features#LG-APP-17 Laser module selector on connect\|Laser module selector on connect]] | later | not started |
| LG-APP-18 | [[lg-app-features#LG-APP-18 Legal disclaimer (first run)\|Legal disclaimer (first run)]] | core | not started |
| LG-APP-19 | [[lg-app-features#LG-APP-19 Safety countdown before job start\|Safety countdown before job start]] | core | not started |
| LG-APP-20 | [[lg-app-features#LG-APP-20 Syncro Start (multi-instance start/hold/resume)\|Syncro Start (multi-instance start/hold/resume)]] | skip | not started |
| LG-APP-21 | [[lg-app-features#LG-APP-21 Splash screen\|Splash screen]] | skip | not started |
| LG-APP-22 | [[lg-app-features#LG-APP-22 License and credits\|License and credits]] | core | not started |
| LG-APP-23 | [[lg-app-features#LG-APP-23 Exception manager (crash reporting)\|Exception manager (crash reporting)]] | adapt | not started |
| LG-APP-24 | [[lg-app-features#LG-APP-24 Help, community, vendor and donate links\|Help, community, vendor and donate links]] | core | not started |
| LG-APP-25 | [[lg-app-features#LG-APP-25 Session log and extended communication log\|Session log and extended communication log]] | core | not started |
| LG-APP-26 | [[lg-app-features#LG-APP-26 Startup, command line, file association and multi-instance\|Startup, command line, file association and multi-instance]] | adapt | not started |
| LG-APP-27 | [[lg-app-features#LG-APP-27 Keep the system awake during jobs\|Keep the system awake during jobs]] | adapt | not started |
| LG-APP-28 | [[lg-app-features#LG-APP-28 Tools menu: CH340 driver and GRBL firmware flasher\|Tools menu: CH340 driver and GRBL firmware flasher]] | skip | not started |

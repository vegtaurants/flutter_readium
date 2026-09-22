# Hand-maintained parts of `assets/helpers/flutterReadiumTools.js`

`assets/helpers/flutterReadiumTools.js` has **exactly three lines**, and they have different origins:

| Line | Content | Origin |
|---|---|---|
| 1 | The helper bundle | webpack output of `../src/` (`npm run build:flutter`) |
| 2 | Image tap-to-zoom for `img.zoomable`, magnifier badge, tap bridge | **Generated from `imageZoom.src.js` in this folder** (the source of truth) |
| 3 | In-book search result positioning (Android) | Hand-written payload, maintained separately |

Lines 1 and 3 are separate payloads. Line 2 must never be edited by hand in the helper; edit `imageZoom.src.js`
and regenerate it.

## Do not rebuild the helper blindly

A normal webpack build writes `flutterReadiumTools.js` with `clean: true`, which **deletes lines 2 and 3**. Do not
run it to "refresh" the helper. If line 1 ever has to be rebuilt, re-append lines 2 and 3 afterwards and verify
them byte for byte against the previous file.

## Regenerating line 2

Minify only the image-zoom source, then splice only line 2:

```bash
terser imageZoom.src.js -c -m --comments false -f ascii_only=true -o /tmp/line2.min.js   # terser 5.31.6
# new line 2 = ";" + contents of /tmp/line2.min.js (trimmed); lines 1 and 3 are copied unchanged
```

Before committing, prove:

- the helper still has exactly three lines and no trailing newline;
- lines 1 and 3 are byte-identical to the previous helper (compare their MD5s);
- minifying the previous `imageZoom.src.js` with the same command reproduces the previous line 2 exactly
  (this confirms the toolchain before trusting the new output).

## Native counterparts

- Android: `EpubReaderFragment.kt` registers the `FlutterReadiumImageTap` JavaScript interface (`mark(src)`) and
  consumes the value in its single tap listener, choosing once per tap between the zoom viewer and
  `DirectionalNavigationAdapter`.
- iOS: `EPUBReaderView.swift` receives the `imageTapped` message and sets `window.flutterReadiumImageZoom` at
  document start.

## Helper CSS (`assets/helpers/flutterReadiumTools.css`) - text-selection deterrence (AO)

The helper CSS has **exactly two lines**: line 1 is `../src/NotaComicBookPage.scss` and line 2 is
`../src/FlutterReadiumTools.scss`, each compiled with `sass` 1.99.0 `--style=compressed` (byte-identical to the webpack
output). The end of `FlutterReadiumTools.scss` disables ordinary text selection in EPUB content (`input` and `textarea`
stay selectable; no `contenteditable` exception; never add `pointer-events`). This is copying deterrence, not DRM.

**Do not run webpack to refresh the CSS** (it also rewrites the helper JS and deletes lines 2 and 3). Regenerate only
line 2:

```bash
npx sass@1.99.0 --style=compressed --no-source-map ../src/FlutterReadiumTools.scss > /tmp/line2.css
# new line 2 = contents of /tmp/line2.css (trailing newline removed); line 1 is copied unchanged
```

Before committing, prove that compiling the previous `FlutterReadiumTools.scss` reproduces the previous line 2 exactly,
that line 1 is unchanged, and that the file still has two lines ending in a newline.

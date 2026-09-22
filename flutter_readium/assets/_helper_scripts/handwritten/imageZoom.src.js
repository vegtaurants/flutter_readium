// flutter_readium - SOURCE OF TRUTH for line 2 of assets/helpers/flutterReadiumTools.js.
// Line 2 is generated from this file (terser, then spliced in as line 2 only) - see README.md in this folder.
// This file is NOT part of the webpack/TypeScript build: a webpack rebuild (clean: true) DELETES line 2.
//
// Image tap-to-zoom, opt-in per image:
//  - Only <img class="zoomable"> can open the app's zoom viewer. The EPUB marker is the single source of truth.
//  - The feature is enabled per reader by window.flutterReadiumImageZoom === true, which the native layer sets
//    when the app has wired an image-tap handler (i.e. when the app's own admin switch is ON).
//  - When enabled, every img.zoomable gets a small magnifier badge in one corner. The badge is absolutely
//    positioned inside the image's existing parent, takes no layout space (no reflow, no pagination change),
//    carries no text, is hidden from assistive tech, and ignores pointer events so taps reach the image.
//  - When disabled (or the flag is absent), nothing is recorded and no badge is drawn.
(function () {
  var BADGE_CLASS = 'rdm-zoom-badge';
  var SIZE = 26;   // px - provisional
  var INSET = 8;   // px from the image edge - provisional
  var ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.4" ' +
    'stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><line x1="15" y1="15" x2="20" y2="20"/>' +
    '<line x1="10.5" y1="8" x2="10.5" y2="13"/><line x1="8" y1="10.5" x2="13" y2="10.5"/></svg>');

  function enabled() {
    return window.flutterReadiumImageZoom === true;
  }

  // ---- tap bridge ----
  // Capture phase on document, so it runs before Readium's bubble-phase click listener for the SAME click.
  // It records a value on EVERY click while enabled (the img.zoomable src, or nothing), so a value can never
  // survive into a later click.
  //  - Android: synchronous hand-off to the native FlutterReadiumImageTap interface; Readium's Android.onTap
  //    for this same click then consumes it (EpubReaderFragment), deciding once between zoom and page turn.
  //  - iOS: push to the imageTapped message handler (the native tap pipeline is inert in the Flutter embedding).
  window.__rdmLastImageTap = null;
  document.addEventListener('click', function (e) {
    if (!enabled()) return;
    var t = e.target;
    var img = t && t.closest ? t.closest('img.zoomable') : null;
    var src = img ? img.src : null;
    window.__rdmLastImageTap = src;
    if (window.FlutterReadiumImageTap && window.FlutterReadiumImageTap.mark) {
      window.FlutterReadiumImageTap.mark(src || '');
    }
    if (src && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.imageTapped) {
      window.webkit.messageHandlers.imageTapped.postMessage(src);
    }
  }, true);
  window.__rdmConsumeImageTap = function () {
    var s = window.__rdmLastImageTap;
    window.__rdmLastImageTap = null;
    return s;
  };

  // ---- magnifier badge ----
  function place(img, badge) {
    var w = img.offsetWidth, h = img.offsetHeight;
    if (!(w > SIZE + 2 * INSET && h > SIZE + 2 * INSET)) { badge.style.display = 'none'; return; }
    badge.style.display = 'block';
    badge.style.left = (img.offsetLeft + INSET) + 'px';                 // bottom-left corner - provisional
    badge.style.top = (img.offsetTop + h - SIZE - INSET) + 'px';
  }

  function decorate(img) {
    if (img.__rdmBadge) return;
    var parent = img.parentElement;
    if (!parent) return;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    var badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.setAttribute('aria-hidden', 'true');
    badge.style.cssText =
      'position:absolute;display:none;width:' + SIZE + 'px;height:' + SIZE + 'px;margin:0;padding:0;border:0;' +
      'border-radius:50%;background:rgba(255,255,255,0.88) url("' + ICON + '") center/68% no-repeat;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.35);pointer-events:none;z-index:1;line-height:0;';
    parent.appendChild(badge);
    img.__rdmBadge = badge;
    var update = function () { place(img, badge); };
    if (window.ResizeObserver) new ResizeObserver(update).observe(img);
    img.addEventListener('load', update);
    window.addEventListener('resize', update);
    update();
  }

  function decorateAll() {
    if (!enabled()) return;
    var imgs = document.querySelectorAll('img.zoomable');
    for (var i = 0; i < imgs.length; i++) decorate(imgs[i]);
  }

  // The native layer may set the flag at document start (iOS) or inject it into the page head (Android);
  // __rdmSetImageZoom lets it be (re)applied after load as well.
  window.__rdmSetImageZoom = function (on) {
    window.flutterReadiumImageZoom = on === true;
    var badges = document.querySelectorAll('.' + BADGE_CLASS);
    if (!enabled()) { for (var i = 0; i < badges.length; i++) badges[i].style.display = 'none'; return; }
    decorateAll();
    var imgs = document.querySelectorAll('img.zoomable');
    for (var j = 0; j < imgs.length; j++) if (imgs[j].__rdmBadge) place(imgs[j], imgs[j].__rdmBadge);
  };

  // Decorate only after the page (and Readium's own setup) has finished loading. Reading image geometry earlier,
  // during DOMContentLoaded, forces a layout before ReadiumCSS pagination settles and was observed (offline harness)
  // to leave the page scrolled by one page.
  function later() { requestAnimationFrame(decorateAll); }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later);
})();

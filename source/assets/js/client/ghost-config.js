'use strict';

// Shared configuration for the moved-activity "ghost" marker (02-§119.19,
// §119.20).
//
// GHOST_MAX_ACTIVITIES_BETWEEN is the single knob that tunes how aggressively a
// previous-slot ghost is hidden for a SAME-DAY move. When a move stays within
// the day and at most this many activities start strictly between the old and
// the new start time, the ghost is suppressed — the highlighted real row is
// close enough that the pointer would just be clutter. A move to a DIFFERENT day
// always keeps its ghost, however few activities lie between, because the old
// day would otherwise show no trace of it. Raise this number to hide ghosts for
// bigger same-day jumps; lower it to show ghosts more readily.
//
// Consumed by:
//   • `source/build/moved.js`                 (Node build, via require)
//   • `source/assets/js/client/events-today.js` (browser, via the global)
//
// UMD wrapper so the same file serves both CommonJS and a browser global —
// matching `conflict-check.js`. Pure data, no DOM, no side effects.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SBGhostConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    GHOST_MAX_ACTIVITIES_BETWEEN: 5,
  };
});

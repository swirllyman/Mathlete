/**
 * The exact build, always on screen.
 *
 * Deliberately inert — `pointer-events: none` — because it sits in a corner a
 * toddler will absolutely mash, and nothing here should ever take a tap away
 * from the game.
 */
export const BUILD = {
  version: __APP_VERSION__,
  sha: __BUILD_SHA__,
  date: __BUILD_DATE__,
}

export const BUILD_LABEL = `v${BUILD.version} · ${BUILD.sha}`

export function BuildStamp() {
  return (
    <span className="build-stamp" aria-hidden="true">
      {BUILD_LABEL}
    </span>
  )
}

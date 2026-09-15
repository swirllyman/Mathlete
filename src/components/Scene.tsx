import { useMemo } from 'react'
import { getItem } from '../game/catalog'

/** Deterministic pseudo-random so a scene's stars and snow don't jitter on rerender. */
function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * The full-bleed backdrop behind the robot.
 *
 * It is built in three layers rather than one scaled SVG: a stretched sky
 * gradient, decorations positioned in percentages (so a sun stays sun-sized on
 * a phone and on a TV), and a stretched ground silhouette pinned to the
 * bottom. Everything is soft and low-contrast so the UI stays readable on top.
 */
export function Scene({ id }: { id: string }) {
  const scene = getItem(id)

  const specks = useMemo(() => {
    const rand = seeded(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7919)
    return Array.from({ length: 40 }, () => ({
      left: rand() * 100,
      top: rand() * 78,
      size: 2 + rand() * 4,
      opacity: 0.35 + rand() * 0.55,
      delay: rand() * 5,
    }))
  }, [id])

  const dark = id === 'scene-night' || id === 'scene-space'

  return (
    <div className="scene" aria-hidden="true">
      <div
        className="scene__sky"
        style={{ background: `linear-gradient(175deg, ${scene.color} 0%, ${scene.accent ?? scene.color} 100%)` }}
      />

      {dark && (
        <div className="scene__specks">
          {specks.map((s, i) => (
            <span
              key={i}
              className="scene__twinkle"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {id === 'scene-snow' && (
        <div className="scene__specks">
          {specks.slice(0, 26).map((s, i) => (
            <span
              key={i}
              className="scene__flake"
              style={{ left: `${s.left}%`, width: s.size + 2, height: s.size + 2, animationDelay: `${s.delay * 2}s` }}
            />
          ))}
        </div>
      )}

      {/* --- sun / moon / planet --- */}
      {id === 'scene-night' && <div className="scene__orb scene__orb--moon" />}
      {id === 'scene-space' && <div className="scene__orb scene__orb--planet" />}
      {(id === 'scene-meadow' || id === 'scene-beach') && <div className="scene__orb scene__orb--sun" />}

      {/* --- clouds --- */}
      {(id === 'scene-meadow' || id === 'scene-beach' || id === 'scene-candy') && (
        <>
          <Cloud left="12%" top="14%" scale={1} />
          <Cloud left="62%" top="8%" scale={0.7} delay={-9} />
          <Cloud left="38%" top="22%" scale={0.5} delay={-16} />
        </>
      )}

      {/* --- candy canes --- */}
      {id === 'scene-candy' && (
        <div className="scene__canes">
          {[8, 27, 71, 90].map((left, i) => (
            <span key={left} className="scene__cane" style={{ left: `${left}%`, bottom: `${8 + (i % 2) * 6}%` }} />
          ))}
        </div>
      )}

      {/* --- ground --- */}
      <svg className="scene__ground" viewBox="0 0 100 40" preserveAspectRatio="none">
        {id === 'scene-beach' && <path d="M0 0h100v14H0z" fill="#8fd4ff" opacity="0.75" />}
        <path d={GROUND[id]?.back ?? 'M0 12q25-10 50 0t50 0v28H0z'} fill={GROUND[id]?.backFill ?? '#8fd9b0'} opacity="0.95" />
        <path d={GROUND[id]?.front ?? 'M0 22q25-8 50 0t50 0v18H0z'} fill={GROUND[id]?.frontFill ?? '#72c996'} />
      </svg>
    </div>
  )
}

/** Per-scene ground silhouettes, drawn in a 100×40 strip pinned to the bottom. */
const GROUND: Record<string, { back: string; front: string; backFill: string; frontFill: string }> = {
  'scene-meadow': {
    back: 'M0 12q25-12 50 0t50 0v28H0z',
    front: 'M0 24q25-9 50 0t50 0v16H0z',
    backFill: '#8fd9b0',
    frontFill: '#6ec293',
  },
  'scene-beach': {
    back: 'M0 16q25-7 50 0t50 0v24H0z',
    front: 'M0 26q25-6 50 0t50 0v14H0z',
    backFill: '#ffdca8',
    frontFill: '#f5c882',
  },
  'scene-snow': {
    back: 'M0 14q22-18 44 0t56 0v26H0z',
    front: 'M0 26q30-9 52 0t48 0v14H0z',
    backFill: '#ffffff',
    frontFill: '#eaf4ff',
  },
  'scene-night': {
    back: 'M0 18q25-14 50 0t50 0v22H0z',
    front: 'M0 28q25-8 50 0t50 0v12H0z',
    backFill: '#2e3363',
    frontFill: '#242a52',
  },
  'scene-space': {
    back: 'M0 20q16-12 30 0t34-4 36 6v18H0z',
    front: 'M0 30q26-8 52 0t48 0v10H0z',
    backFill: '#4b3f85',
    frontFill: '#3b3169',
  },
  'scene-candy': {
    back: 'M0 14q25-12 50 0t50 0v26H0z',
    front: 'M0 26q25-8 50 0t50 0v14H0z',
    backFill: '#ffc2dd',
    frontFill: '#ffaed2',
  },
}

function Cloud({ left, top, scale, delay = 0 }: { left: string; top: string; scale: number; delay?: number }) {
  return (
    <span className="scene__cloud" style={{ left, top, transform: `scale(${scale})`, animationDelay: `${delay}s` }}>
      <span />
      <span />
      <span />
    </span>
  )
}

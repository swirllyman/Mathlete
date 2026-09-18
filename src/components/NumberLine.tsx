import { useMemo } from 'react'
import type { ProblemKind } from '../game/types'

/**
 * The number line: the same line, every question, so it becomes a place a
 * child knows their way around.
 *
 * Counting objects teaches how many. A line teaches *where* — that numbers sit
 * in an order, that seven is further along than three, and that adding is a
 * hop forward while taking away is a hop back. Two fixed spans (0–10 and
 * 0–20), never a range that shifts under them question to question.
 */

const STEP = 10
const PAD = 13
const BASE_Y = 18
const ARC_TOP = 6
const HEIGHT = 30

export function lineMaxFor(levelMax: number): 10 | 20 {
  return levelMax <= 10 ? 10 : 20
}

interface NumberLineProps {
  max: 10 | 20
  kind: ProblemKind
  /** Where the journey starts: the first addend, or the total being reduced. */
  from: number
  /** Where it ends: the answer. */
  to: number
  /** How many single hops have been travelled so far. */
  hops: number
  /** Reveal the landing spot (after a correct answer). */
  landed: boolean
}

export function NumberLine({ max, kind, from, to, hops, landed }: NumberLineProps) {
  const x = (n: number) => PAD + n * STEP
  const width = PAD * 2 + max * STEP
  const back = to < from
  const totalHops = Math.abs(to - from)
  const travelled = Math.min(hops, totalHops)
  const at = back ? from - travelled : from + travelled

  // A 0–20 line cannot label every tick on a phone without the numbers
  // colliding, so it labels the even ones and ticks the rest.
  const labelEvery = max === 10 ? 1 : 2

  // Counting questions have no journey: the line just shows where the answer
  // lives once it has been found.
  const showMarker = kind !== 'count' || landed
  const markerAt = kind === 'count' ? to : at

  const arcs = useMemo(() => {
    return Array.from({ length: travelled }, (_, i) => {
      const a = back ? from - i : from + i
      const b = back ? a - 1 : a + 1
      const [x1, x2] = [x(a), x(b)]
      const mid = (x1 + x2) / 2
      return { d: `M${x1} ${BASE_Y - 3} Q${mid} ${ARC_TOP} ${x2} ${BASE_Y - 3}`, key: `${a}-${b}` }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelled, from, back])

  return (
    <div className="numline" style={{ maxWidth: `min(100%, ${max * 34 + 70}px)` }}>
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="numline__svg" role="img" aria-label={`Number line from 0 to ${max}`}>
        {/* the line itself, with an arrowhead so it reads as "keeps going" */}
        <line x1={PAD - 6} y1={BASE_Y} x2={width - PAD + 6} y2={BASE_Y} className="numline__axis" />
        <polygon
          points={`${width - PAD + 9},${BASE_Y} ${width - PAD + 3},${BASE_Y - 2.6} ${width - PAD + 3},${BASE_Y + 2.6}`}
          className="numline__arrow"
        />

        {Array.from({ length: max + 1 }, (_, n) => {
          // Always name where the marker is, even on a line that otherwise only
          // labels every other number — a marker parked on a nameless tick is
          // the opposite of helpful. Only where it *is*, though: labelling the
          // destination would point at the answer before it has been found.
          const labelled = n % labelEvery === 0 || (showMarker && n === markerAt)
          const isEnd = n === markerAt && landed
          return (
            <g key={n} className={isEnd ? 'numline__stop numline__stop--land' : 'numline__stop'}>
              <line x1={x(n)} y1={BASE_Y - (labelled ? 3.5 : 2)} x2={x(n)} y2={BASE_Y + (labelled ? 3.5 : 2)} className="numline__tick" />
              {labelled && (
                <text x={x(n)} y={BASE_Y + 12} className="numline__label" textAnchor="middle">
                  {n}
                </text>
              )}
            </g>
          )
        })}

        {/* hops already travelled */}
        {arcs.map((arc) => (
          <path key={arc.key} d={arc.d} className="numline__arc" />
        ))}

        {/* where we started, left behind as a ghost once we move */}
        {kind !== 'count' && travelled > 0 && <circle cx={x(from)} cy={BASE_Y} r="3" className="numline__origin" />}

        {showMarker && (
          <g className="numline__marker" style={{ transform: `translateX(${x(markerAt)}px)` }}>
            <circle cy={BASE_Y} r="4.8" className="numline__dot" />
            <circle cy={BASE_Y} r="2" className="numline__pupil" />
          </g>
        )}
      </svg>
    </div>
  )
}

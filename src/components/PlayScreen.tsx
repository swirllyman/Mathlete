import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sfx } from '../audio/sfx'
import { speech } from '../audio/speech'
import { makeLevelProblems, numberWord } from '../game/problems'
import { useGame } from '../game/store'
import type { Problem } from '../game/types'
import { LEVELS_PER_WORLD, PROBLEMS_PER_LEVEL, worldById } from '../game/worlds'
import { Confetti } from './Confetti'
import { Robot, type RobotMood } from './Robot'
import { TopBar } from './TopBar'

const PRAISE = ['Yes!', 'You got it!', 'Great job!', 'Wow, nice one!', "That's right!", 'Super!', 'Brilliant!']
const ENCOURAGE = [
  'Ooh, so close. Try again!',
  'Not quite. You can do it!',
  "Let's try one more time.",
  'Almost! Have another go.',
]

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

interface PlayScreenProps {
  worldId: string
  level: number
  onExit: () => void
  onFinished: (worldId: string, level: number) => void
}

export function PlayScreen({ worldId, level, onExit, onFinished }: PlayScreenProps) {
  const { save, say, awardStars, completeLevel } = useGame()
  const world = worldById(worldId)
  const spec = world.levels[level - 1]

  const [problems] = useState<Problem[]>(() => makeLevelProblems(spec, PROBLEMS_PER_LEVEL))
  const [index, setIndex] = useState(0)
  const [mood, setMood] = useState<RobotMood>('idle')
  const [locked, setLocked] = useState(false)
  const [wrongChoices, setWrongChoices] = useState<number[]>([])
  const [misses, setMisses] = useState(0)
  const [burst, setBurst] = useState(0)
  const [countingAt, setCountingAt] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [earned, setEarned] = useState(0)
  const [perfectRun, setPerfectRun] = useState(false)
  // A ref, not state: `answer` needs to read it synchronously within a turn.
  const perfectRef = useRef(true)
  const timers = useRef<number[]>([])

  const problem = problems[index]

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout)
      speech.stop()
    },
    [],
  )

  const askQuestion = useCallback(
    (p: Problem) => {
      say(p.spoken)
    },
    [say],
  )

  // Read each new question out loud as it appears.
  useEffect(() => {
    if (finished || !problem) return
    const id = window.setTimeout(() => askQuestion(problem), 450)
    return () => window.clearTimeout(id)
  }, [problem, finished, askQuestion])

  /**
   * Walks the objects one at a time, saying "one… two… three".
   *
   * The pace is a fixed cadence rather than a chain of speech callbacks: on a
   * device with no installed voices the callbacks resolve instantly and the
   * whole count would flash by before a child could follow it.
   */
  const countAloud = useCallback(() => {
    if (!problem) return
    const total = problem.kind === 'sub' ? problem.answer : problem.kind === 'add' ? problem.a + problem.b : problem.a
    const STEP_MS = 700
    speech.stop()
    for (let n = 1; n <= total; n++) {
      later(() => {
        setCountingAt(n)
        sfx.star()
        speech.speak(numberWord(n), { interrupt: false })
      }, n * STEP_MS)
    }
    later(() => {
      setCountingAt(null)
      say(`${numberWord(total)} ${problem.noun}!`)
    }, (total + 1) * STEP_MS)
  }, [problem, say, later])

  const goNext = useCallback(() => {
    setWrongChoices([])
    setMisses(0)
    setCountingAt(null)
    setMood('idle')
    setLocked(false)
    if (index + 1 < problems.length) {
      setIndex(index + 1)
      return
    }
    // Level cleared: everyone gets a bonus, a clean run gets the most.
    const perfect = perfectRef.current
    const bonus = perfect ? 3 : 2
    setPerfectRun(perfect)
    setEarned(PROBLEMS_PER_LEVEL + bonus)
    awardStars(bonus)
    completeLevel(worldId, level)
    setFinished(true)
    setBurst((b) => b + 1)
    sfx.levelComplete()
    say(
      perfect
        ? `Amazing! You finished ${world.name} level ${level} with no mistakes!`
        : `You did it! You finished ${world.name} level ${level}!`,
    )
  }, [index, problems.length, awardStars, completeLevel, worldId, level, say, world.name])

  const answer = (value: number) => {
    if (locked || !problem) return
    if (value === problem.answer) {
      setLocked(true)
      setMood('happy')
      setBurst((b) => b + 1)
      sfx.correct()
      awardStars(1)
      say(`${pick(PRAISE)} ${numberWord(problem.answer)}!`)
      later(goNext, 1800)
      return
    }

    perfectRef.current = false
    sfx.wrong()
    setMood('oops')
    setWrongChoices((prev) => [...prev, value])
    const nextMisses = misses + 1
    setMisses(nextMisses)
    later(() => setMood('think'), 900)

    if (nextMisses >= 2) {
      // Second miss: stop guessing games and count it out together.
      say("Let's count them together.", countAloud)
    } else {
      say(pick(ENCOURAGE))
    }
  }

  if (finished) {
    return (
      <LevelCleared
        world={world.name}
        level={level}
        earned={earned}
        perfect={perfectRun}
        burst={burst}
        onExit={onExit}
        onFinished={() => onFinished(worldId, level)}
      />
    )
  }

  return (
    <div className="screen screen--play" style={{ ['--world' as string]: world.color, ['--world-dark' as string]: world.accent }}>
      <TopBar onHome={onExit} />
      <Confetti burst={burst} intensity={0.55} />

      <div className="play__dots" aria-label={`Question ${index + 1} of ${problems.length}`}>
        {problems.map((_, i) => (
          <span key={i} className={`play__dot ${i < index ? 'play__dot--done' : ''} ${i === index ? 'play__dot--now' : ''}`} />
        ))}
      </div>

      <div className="play__stage">
        <Robot equipped={save.equipped} mood={mood} size="min(20vh, 22vw, 150px)" className="play__robot" />

        <button
          className={`speech-bubble speech-bubble--prompt ${problem.kind === 'count' ? 'speech-bubble--words' : ''}`}
          onClick={() => askQuestion(problem)}
        >
          <span className="play__written">{problem.written}</span>
          <span className="speech-bubble__icon" aria-hidden="true">🔊</span>
        </button>
      </div>

      <Manipulatives problem={problem} countingAt={countingAt} />

      <div className={`play__answers play__answers--${problem.choices.length}`}>
        {problem.choices.map((choice) => (
          <AnswerBubble
            key={choice}
            value={choice}
            emoji={problem.emoji}
            state={
              locked && choice === problem.answer
                ? 'right'
                : wrongChoices.includes(choice)
                  ? 'wrong'
                  : 'idle'
            }
            onPick={() => answer(choice)}
          />
        ))}
      </div>

      <button className="play__hint" onClick={countAloud}>
        <span aria-hidden="true">🤔</span> Help me count
      </button>
    </div>
  )
}

/* ------------------------------------------------------- counting objects */

function Manipulatives({ problem, countingAt }: { problem: Problem; countingAt: number | null }) {
  const groups = useMemo(() => {
    if (problem.kind === 'count') return [{ n: problem.a, faded: 0 }]
    if (problem.kind === 'add') return [{ n: problem.a, faded: 0 }, { n: problem.b, faded: 0 }]
    return [{ n: problem.a, faded: problem.b }]
  }, [problem])

  // For counting, the highlight walks across the objects that still count:
  // for subtraction that means skipping the ones that floated away.
  let counter = 0

  const total = groups.reduce((sum, g) => sum + g.n, 0)
  // More things on screen means smaller things, so a pile of fourteen still
  // fits next to its neighbour without either one wrapping oddly.
  const scale = total <= 5 ? 'xl' : total <= 10 ? 'lg' : total <= 16 ? 'md' : 'sm'

  const split = groups.length > 1
  // How many objects sit side by side across every tray. The stylesheet
  // divides the usable width by this, so a wide layout (five and five) shrinks
  // to fit a phone instead of running off the edge of it.
  const columns = groups.reduce((sum, g) => sum + columnsFor(g.n), 0)

  return (
    <div
      className={`objects objects--${scale} ${split ? 'objects--split' : ''}`}
      style={{ ['--columns' as string]: columns }}
    >
      {groups.map((group, gi) => (
        <Fragment key={gi}>
          {gi > 0 && (
            <span className="objects__op" aria-hidden="true">
              +
            </span>
          )}
          <div
            className={`tray tray--${split ? TRAY_TONE[gi] : 'solo'}`}
            style={{ ['--cols' as string]: columnsFor(group.n) }}
          >
            {Array.from({ length: group.n }, (_, i) => {
              const gone = i >= group.n - group.faded
              if (!gone) counter += 1
              const lit = !gone && countingAt !== null && counter <= countingAt
              return (
                <span
                  key={i}
                  className={`object ${gone ? 'object--gone' : ''} ${lit ? 'object--lit' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  aria-hidden="true"
                >
                  {problem.emoji}
                </span>
              )
            })}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

/**
 * Each addend gets its own coloured tray. Two piles of the same thing, sitting
 * in a straight line, can be counted end to end without ever thinking about
 * the plus — so the trays are tinted differently, tilted opposite ways so they
 * never line up into one row, and separated by a real operator token.
 */
const TRAY_TONE = ['a', 'b'] as const

/**
 * Lays a pile out the way a child is taught to see it: single rows up to
 * three, a square of four, then rows of five like a ten-frame, so seven reads
 * as "five and two" instead of an amorphous blob.
 */
function columnsFor(n: number): number {
  if (n <= 3) return n
  if (n === 4) return 2
  return 5
}

/* -------------------------------------------------------- answer bubbles */

function AnswerBubble({
  value,
  emoji,
  state,
  onPick,
}: {
  value: number
  emoji: string
  state: 'idle' | 'right' | 'wrong'
  onPick: () => void
}) {
  return (
    <button className={`bubble bubble--${state}`} onClick={onPick} aria-label={`${value}`}>
      <span className="bubble__num">{value}</span>
      <span className="bubble__pips" aria-hidden="true">
        {Array.from({ length: Math.min(value, 12) }, (_, i) => (
          <span key={i} className="bubble__pip">
            {emoji}
          </span>
        ))}
      </span>
    </button>
  )
}

/* ------------------------------------------------------- level-clear card */

function LevelCleared({
  world,
  level,
  earned,
  perfect,
  burst,
  onExit,
  onFinished,
}: {
  world: string
  level: number
  earned: number
  perfect: boolean
  burst: number
  onExit: () => void
  onFinished: () => void
}) {
  const { save } = useGame()
  return (
    <div className="screen screen--cleared">
      <Confetti burst={burst} intensity={2} />
      <h2 className="cleared__title">{perfect ? 'Perfect!' : 'You did it!'}</h2>
      <p className="cleared__sub">
        {world} · Level {level}
        {level >= LEVELS_PER_WORLD ? ' · All done!' : ''}
      </p>
      <Robot equipped={save.equipped} mood="cheer" size="min(34vh, 250px)" />
      <div className="cleared__stars">
        {Array.from({ length: Math.min(earned, 10) }, (_, i) => (
          <span key={i} className="cleared__star" style={{ animationDelay: `${i * 0.08}s` }} aria-hidden="true">
            ⭐
          </span>
        ))}
        <span className="cleared__count">+{earned}</span>
      </div>
      <div className="title__row">
        <button className="big-btn big-btn--play" onClick={onFinished}>
          Keep going!
        </button>
        <button className="big-btn big-btn--small big-btn--quiet" onClick={onExit}>
          Map
        </button>
      </div>
    </div>
  )
}

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

/** Hard Mode misses get extra credit for trying, never a sharper nudge. */
const HARD_ENCOURAGE = [
  'That one is tough! Try again.',
  'Hard Mode is really tricky. Have another go!',
  'Good thinking! Try once more.',
  "Not that one, but I love that you're trying!",
]

/** Extra stars for clearing a Hard Mode level. */
const HARD_BONUS = 3
/** Stars for every milestone reached in endless play. */
const ENDLESS_MILESTONE_BONUS = 2

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

/** How many questions to keep queued ahead in endless play. */
const ENDLESS_BATCH = 6
/** Correct answers per endless milestone celebration. */
const ENDLESS_MILESTONE = 5

interface PlayScreenProps {
  worldId: string
  level: number
  /** Endless play: no finish line, just more questions at this difficulty. */
  endless: boolean
  onExit: () => void
  onFinished: (worldId: string, level: number) => void
}

export function PlayScreen({ worldId, level, endless, onExit, onFinished }: PlayScreenProps) {
  const { save, say, awardStars, completeLevel } = useGame()
  const world = worldById(worldId)
  const spec = world.levels[level - 1]
  const hard = spec.hard

  const [problems, setProblems] = useState<Problem[]>(() =>
    makeLevelProblems(spec, endless ? ENDLESS_BATCH : PROBLEMS_PER_LEVEL),
  )
  const [rightCount, setRightCount] = useState(0)
  // Hard Mode only: the lid is lifted for this question after a peek or a hint.
  const [peeking, setPeeking] = useState(false)
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

  const peek = useCallback(() => {
    setPeeking((was) => {
      if (!was) {
        sfx.tap()
        say('Peek!')
      }
      return true
    })
  }, [say])

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

  // Hard Mode is announced up front, and framed as brave rather than scary.
  const greeted = useRef(false)
  useEffect(() => {
    if (greeted.current || !hard) return
    greeted.current = true
    const id = window.setTimeout(
      () =>
        say(
          "This one is Hard Mode! Some of them are hiding, so you have to think. I'm proud of you for trying!",
        ),
      300,
    )
    return () => window.clearTimeout(id)
  }, [hard, say])

  /**
   * Walks the objects one at a time, saying "one… two… three".
   *
   * The pace is a fixed cadence rather than a chain of speech callbacks: on a
   * device with no installed voices the callbacks resolve instantly and the
   * whole count would flash by before a child could follow it.
   */
  const countAloud = useCallback(() => {
    if (!problem) return
    // Nothing to count while a pile is still hidden, so a hint always reveals.
    setPeeking(true)
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
    setPeeking(false)

    if (endless) {
      // Top the queue up before it runs dry, so questions never stall.
      if (index + 2 >= problems.length) {
        setProblems((prev) => [...prev, ...makeLevelProblems(spec, ENDLESS_BATCH)])
      }
      setIndex(index + 1)
      return
    }

    if (index + 1 < problems.length) {
      setIndex(index + 1)
      return
    }
    // Level cleared: everyone gets a bonus, a clean run gets the most.
    const perfect = perfectRef.current
    const bonus = perfect ? 3 : 2
    setPerfectRun(perfect)
    setEarned(PROBLEMS_PER_LEVEL + bonus + (hard ? HARD_BONUS : 0))
    if (hard) awardStars(HARD_BONUS)
    awardStars(bonus)
    completeLevel(worldId, level)
    setFinished(true)
    setBurst((b) => b + 1)
    sfx.levelComplete()
    say(
      hard
        ? `Wow! You finished a Hard Mode level! That was really tricky and you did it!`
        : perfect
          ? `Amazing! You finished ${world.name} level ${level} with no mistakes!`
          : `You did it! You finished ${world.name} level ${level}!`,
    )
  }, [index, problems.length, awardStars, completeLevel, worldId, level, say, world.name, endless, spec, hard])

  const answer = (value: number) => {
    if (locked || !problem) return
    if (value === problem.answer) {
      setLocked(true)
      setMood('happy')
      setBurst((b) => b + 1)
      sfx.correct()
      awardStars(1)

      const streak = rightCount + 1
      setRightCount(streak)

      if (endless && streak % ENDLESS_MILESTONE === 0) {
        // Endless still pays out on the same rhythm as a finished level, so
        // playing forever is a real way to earn wardrobe pieces.
        awardStars(ENDLESS_MILESTONE_BONUS)
        completeLevel(worldId, level)
        sfx.levelComplete()
        say(`${streak} in a row! You are on fire!`)
      } else {
        say(`${pick(PRAISE)} ${numberWord(problem.answer)}!`)
      }
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
      // Second miss: stop guessing games and count it out together. In Hard
      // Mode that means lifting the lid — the child has earned a look.
      say(hard ? "Hard Mode is tricky! Let's peek and count together." : "Let's count them together.", countAloud)
    } else {
      say(hard ? pick(HARD_ENCOURAGE) : pick(ENCOURAGE))
    }
  }

  if (finished) {
    return (
      <LevelCleared
        world={world.name}
        level={level}
        earned={earned}
        perfect={perfectRun}
        hard={hard}
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

      <div className="play__hud">
        {hard && (
          <span className="badge-hard badge-hard--banner">
            <span aria-hidden="true">🔥</span> Hard Mode
          </span>
        )}

        {endless ? (
          <span className="play__streak" aria-label={`${rightCount} right so far`}>
            <span aria-hidden="true">♾️</span>
            {rightCount} right
          </span>
        ) : (
          <span className="play__dots" aria-label={`Question ${index + 1} of ${PROBLEMS_PER_LEVEL}`}>
            {problems.map((_, i) => (
              <span
                key={i}
                className={`play__dot ${i < index ? 'play__dot--done' : ''} ${i === index ? 'play__dot--now' : ''}`}
              />
            ))}
          </span>
        )}
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

      <Manipulatives
        problem={problem}
        countingAt={countingAt}
        hard={hard}
        peeking={peeking}
        onPeek={peek}
      />

      <div className={`play__answers play__answers--${problem.choices.length}`}>
        {problem.choices.map((choice) => (
          <AnswerBubble
            key={choice}
            value={choice}
            emoji={problem.emoji}
            hard={hard && !peeking}
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

      <div className="play__tools">
        {hard && !peeking && (
          <button className="play__hint play__hint--peek" onClick={peek}>
            <span aria-hidden="true">👀</span> Peek
          </button>
        )}
        <button className="play__hint" onClick={countAloud}>
          <span aria-hidden="true">🤔</span> Help me count
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------- counting objects */

interface Pile {
  n: number
  /** How many at the end of the pile are crossed out. */
  faded: number
  /** Hidden under a lid, with only its numeral showing. */
  covered: boolean
}

function Manipulatives({
  problem,
  countingAt,
  hard,
  peeking,
  onPeek,
}: {
  problem: Problem
  countingAt: number | null
  hard: boolean
  peeking: boolean
  onPeek: () => void
}) {
  // Hard Mode hides whichever pile would otherwise hand over the answer to a
  // child who just counts everything on screen:
  //   addition    - the second addend is covered, so you count ON from the first
  //   subtraction - the starting pile is covered and the leavers stay visible,
  //                 so you count BACK from the total
  // Counting levels are never hardened; counting is the entire point of them.
  const { piles, op } = useMemo<{ piles: Pile[]; op: string }>(() => {
    const conceal = hard && !peeking
    if (problem.kind === 'count') {
      return { piles: [{ n: problem.a, faded: 0, covered: false }], op: '' }
    }
    if (problem.kind === 'add') {
      return {
        piles: [
          { n: problem.a, faded: 0, covered: false },
          { n: problem.b, faded: 0, covered: conceal },
        ],
        op: '+',
      }
    }
    if (conceal) {
      return {
        piles: [
          { n: problem.a, faded: 0, covered: true },
          { n: problem.b, faded: problem.b, covered: false },
        ],
        op: '−',
      }
    }
    return { piles: [{ n: problem.a, faded: problem.b, covered: false }], op: '' }
  }, [problem, hard, peeking])

  const groups = piles

  // For counting, the highlight walks across the objects that still count:
  // for subtraction that means skipping the ones that floated away.
  let counter = 0

  const total = groups.reduce((sum, g) => sum + (g.covered ? 0 : g.n), 0)
  // More things on screen means smaller things, so a pile of fourteen still
  // fits next to its neighbour without either one wrapping oddly.
  const scale = total <= 5 ? 'xl' : total <= 10 ? 'lg' : total <= 16 ? 'md' : 'sm'

  const split = groups.length > 1
  // How many objects sit side by side across every tray. The stylesheet
  // divides the usable width by this, so a wide layout (five and five) shrinks
  // to fit a phone instead of running off the edge of it.
  const columns = groups.reduce((sum, g) => sum + (g.covered ? 2 : columnsFor(g.n)), 0)

  return (
    <div
      className={`objects objects--${scale} ${split ? 'objects--split' : ''}`}
      style={{ ['--columns' as string]: columns }}
    >
      {groups.map((group, gi) => (
        <Fragment key={gi}>
          {gi > 0 && op && (
            <span className="objects__op" aria-hidden="true">
              {op}
            </span>
          )}
          {group.covered ? (
            <button
              className={`tray tray--${split ? TRAY_TONE[gi] : 'solo'} tray--covered`}
              onClick={onPeek}
              aria-label={`${group.n} hidden. Tap to peek.`}
            >
              <span className="tray__count">{group.n}</span>
              <span className="tray__peek">tap to peek</span>
            </button>
          ) : (
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
          )}
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
  hard,
  onPick,
}: {
  value: number
  emoji: string
  state: 'idle' | 'right' | 'wrong'
  /** Hard Mode: numeral only. */
  hard: boolean
  onPick: () => void
}) {
  return (
    <button
      className={`bubble bubble--${state} ${hard ? 'bubble--bare' : ''}`}
      onClick={onPick}
      aria-label={`${value}`}
    >
      <span className="bubble__num">{value}</span>
      {/* The pips are a counting aid, and in Hard Mode they are a loophole: a
          child could ignore the hidden pile entirely and just count the
          answers instead. So Hard Mode shows the numeral alone — until a peek,
          which gives the whole question back. */}
      {!hard && (
        <span className="bubble__pips" aria-hidden="true">
          {Array.from({ length: Math.min(value, 12) }, (_, i) => (
            <span key={i} className="bubble__pip">
              {emoji}
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

/* ------------------------------------------------------- level-clear card */

function LevelCleared({
  world,
  level,
  earned,
  perfect,
  hard,
  burst,
  onExit,
  onFinished,
}: {
  world: string
  level: number
  earned: number
  perfect: boolean
  hard: boolean
  burst: number
  onExit: () => void
  onFinished: () => void
}) {
  const { save } = useGame()
  return (
    <div className="screen screen--cleared">
      <Confetti burst={burst} intensity={2} />
      <h2 className="cleared__title">{hard ? 'So brave!' : perfect ? 'Perfect!' : 'You did it!'}</h2>
      <p className="cleared__sub">
        {hard && (
          <>
            <span className="badge-hard" aria-hidden="true">🔥 Hard Mode</span>{' '}
          </>
        )}
        {world} · Level {level}
        {level >= LEVELS_PER_WORLD ? ' · All done!' : ''}
      </p>
      {hard && <p className="cleared__brag">You beat a Hard Mode level. That was really tough!</p>}
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

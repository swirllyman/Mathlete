import type { LevelSpec, Problem, ProblemKind } from './types'

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty',
]

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

interface Thing {
  emoji: string
  one: string
  many: string
}

/** Friendly, countable, toddler-recognisable things. */
const THINGS: Thing[] = [
  { emoji: '🍎', one: 'apple', many: 'apples' },
  { emoji: '🐥', one: 'chick', many: 'chicks' },
  { emoji: '⭐', one: 'star', many: 'stars' },
  { emoji: '🍌', one: 'banana', many: 'bananas' },
  { emoji: '🐠', one: 'fish', many: 'fish' },
  { emoji: '🎈', one: 'balloon', many: 'balloons' },
  { emoji: '🍓', one: 'strawberry', many: 'strawberries' },
  { emoji: '🐸', one: 'frog', many: 'frogs' },
  { emoji: '🌼', one: 'flower', many: 'flowers' },
  { emoji: '🍪', one: 'cookie', many: 'cookies' },
  { emoji: '🐞', one: 'ladybug', many: 'ladybugs' },
  { emoji: '🧁', one: 'cupcake', many: 'cupcakes' },
  { emoji: '🦆', one: 'duck', many: 'ducks' },
  { emoji: '🚗', one: 'car', many: 'cars' },
  { emoji: '🐝', one: 'bee', many: 'bees' },
]

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function noun(thing: Thing, n: number): string {
  return n === 1 ? thing.one : thing.many
}

function buildChoices(answer: number, count: number, max: number): number[] {
  const options = new Set<number>([answer])
  const ceiling = Math.max(max, answer + 2)
  let guard = 0
  while (options.size < count && guard++ < 200) {
    // Distractors hug the answer so the choice is a real judgement, not a
    // giveaway, but never go negative.
    const delta = pick([-3, -2, -1, 1, 2, 3])
    const candidate = answer + delta
    if (candidate >= 0 && candidate <= ceiling) options.add(candidate)
  }
  // Fall back to filling upward if the answer sat in a tight corner (e.g. 0).
  for (let n = 0; options.size < count; n++) options.add(n)
  return shuffle([...options])
}

export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function makeProblem(kind: ProblemKind, spec: LevelSpec): Problem {
  const thing = pick(THINGS)
  let a: number
  let b: number
  let answer: number
  let spoken: string
  let written: string

  // Levels ramp by growing `max`, so problems are drawn from the top of the
  // range rather than anywhere in it: otherwise level five of a world happily
  // serves up "2 + 1" and the progression stops meaning anything.
  const floor = Math.max(kind === 'sub' ? 2 : 1, spec.max - 2)

  if (kind === 'count') {
    a = randInt(floor, spec.max)
    b = 0
    answer = a
    spoken = `How many ${thing.many} do you see?`
    written = 'How many?'
  } else if (kind === 'add') {
    // Choose the total first so the sum always matches the level's range.
    const total = randInt(Math.max(2, floor), spec.max)
    a = randInt(1, total - 1)
    b = total - a
    answer = total
    spoken = `${numberWord(a)} ${noun(thing, a)}, plus ${numberWord(b)} more. How many ${thing.many} now?`
    written = `${a} + ${b}`
  } else {
    a = randInt(Math.max(2, floor), spec.max)
    b = randInt(1, a - 1)
    answer = a - b
    spoken = `${numberWord(a)} ${noun(thing, a)}. ${numberWord(b)} ${b === 1 ? 'goes' : 'go'} away. How many ${thing.many} are left?`
    written = `${a} − ${b}`
  }

  return {
    kind,
    a,
    b,
    answer,
    emoji: thing.emoji,
    noun: thing.many,
    spoken,
    written,
    choices: buildChoices(answer, spec.choiceCount, spec.max),
  }
}

/** Identity of a problem's maths, ignoring how it happens to be displayed. */
function signature(p: Problem): string {
  return `${p.kind}:${p.a}:${p.b}`
}

/**
 * Builds one level's worth of problems, avoiding back-to-back repeats so the
 * same sum never shows up twice in a row.
 */
export function makeLevelProblems(spec: LevelSpec, count: number): Problem[] {
  const problems: Problem[] = []
  let guard = 0
  while (problems.length < count && guard++ < 500) {
    const kind = spec.kinds[problems.length % spec.kinds.length]
    const next = makeProblem(kind, spec)
    const prev = problems[problems.length - 1]
    if (prev && signature(prev) === signature(next)) continue
    problems.push(next)
  }
  return problems
}

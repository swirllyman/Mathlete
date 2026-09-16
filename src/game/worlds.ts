import type { LevelSpec, ProblemKind, World } from './types'

export const LEVELS_PER_WORLD = 5
export const PROBLEMS_PER_LEVEL = 5

/** Levels from this index up are Hard Mode, in the worlds that have any. */
const HARD_FROM = 4

/**
 * Levels inside a world ramp gently: the number range grows across the five
 * levels and the last two add a fourth answer bubble. Worlds built with
 * `hard` also put their last two levels into Hard Mode.
 */
function makeLevels(kinds: ProblemKind[], minMax: number, maxMax: number, hard = false): LevelSpec[] {
  const levels: LevelSpec[] = []
  for (let i = 0; i < LEVELS_PER_WORLD; i++) {
    const t = i / (LEVELS_PER_WORLD - 1)
    levels.push({
      index: i + 1,
      kinds,
      max: Math.round(minMax + (maxMax - minMax) * t),
      choiceCount: i < 2 ? 3 : 4,
      hard: hard && i + 1 >= HARD_FROM,
    })
  }
  return levels
}

export const WORLDS: World[] = [
  {
    id: 'cove',
    name: 'Counting Cove',
    blurb: 'Splash around and count the shells!',
    emoji: '🐚',
    color: '#6fe0c6',
    accent: '#2fae92',
    levels: makeLevels(['count'], 3, 6),
  },
  {
    id: 'meadow',
    name: 'Adding Meadow',
    blurb: 'Put things together with the busy bees!',
    emoji: '🌻',
    color: '#ffd166',
    accent: '#e0a42c',
    levels: makeLevels(['add'], 4, 6),
  },
  {
    id: 'woods',
    name: 'Taking Away Woods',
    blurb: 'The sneaky squirrels take things away!',
    emoji: '🍄',
    color: '#ff9ecb',
    accent: '#e05fa0',
    levels: makeLevels(['sub'], 4, 6),
  },
  {
    id: 'dunes',
    name: 'Number Dunes',
    blurb: 'Big sandy hills with bigger numbers!',
    emoji: '🐫',
    color: '#ffab73',
    accent: '#e07a3c',
    levels: makeLevels(['add'], 7, 10, true),
  },
  {
    id: 'peak',
    name: 'Frosty Peak',
    blurb: 'Snowballs melt away, one by one!',
    emoji: '⛄',
    color: '#8fb8ff',
    accent: '#4f7ddb',
    levels: makeLevels(['sub'], 7, 10, true),
  },
  {
    id: 'station',
    name: 'Star Station',
    blurb: 'Blast off for the trickiest numbers!',
    emoji: '🚀',
    color: '#c3a6ff',
    accent: '#8c66e0',
    levels: makeLevels(['add', 'sub'], 10, 14, true),
  },
]

export function worldById(id: string): World {
  const world = WORLDS.find((w) => w.id === id)
  if (!world) throw new Error(`Unknown world: ${id}`)
  return world
}

/**
 * Nothing on the map is ever locked. Worlds are listed easiest-first as
 * guidance, but a child can play any of them at any time: the only thing stars
 * gate is the wardrobe. A four-year-old who wants to poke at Star Station is
 * never told no, and nobody can get stuck behind a level that is too hard.
 *
 * `progress` is still tracked — it is what puts a star on a finished level and
 * a medal on a finished world — it just doesn't gate anything.
 */
export function totalLevelsDone(progress: Record<string, number>): number {
  return WORLDS.reduce((sum, w) => sum + Math.min(progress[w.id] ?? 0, LEVELS_PER_WORLD), 0)
}

import type { LevelSpec, ProblemKind, World } from './types'

export const LEVELS_PER_WORLD = 5
export const PROBLEMS_PER_LEVEL = 5

/**
 * Levels inside a world ramp gently: the number range grows across the five
 * levels and the last two add a fourth answer bubble.
 */
function makeLevels(kinds: ProblemKind[], minMax: number, maxMax: number): LevelSpec[] {
  const levels: LevelSpec[] = []
  for (let i = 0; i < LEVELS_PER_WORLD; i++) {
    const t = i / (LEVELS_PER_WORLD - 1)
    levels.push({
      index: i + 1,
      kinds,
      max: Math.round(minMax + (maxMax - minMax) * t),
      choiceCount: i < 2 ? 3 : 4,
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
    levels: makeLevels(['add'], 7, 10),
  },
  {
    id: 'peak',
    name: 'Frosty Peak',
    blurb: 'Snowballs melt away, one by one!',
    emoji: '⛄',
    color: '#8fb8ff',
    accent: '#4f7ddb',
    levels: makeLevels(['sub'], 7, 10),
  },
  {
    id: 'station',
    name: 'Star Station',
    blurb: 'Blast off for the trickiest numbers!',
    emoji: '🚀',
    color: '#c3a6ff',
    accent: '#8c66e0',
    levels: makeLevels(['add', 'sub'], 10, 14),
  },
]

export function worldById(id: string): World {
  const world = WORLDS.find((w) => w.id === id)
  if (!world) throw new Error(`Unknown world: ${id}`)
  return world
}

/**
 * A world opens once the previous world's first level is done, so a younger
 * kid is never fully walled in by a world that is too hard for them.
 */
export function isWorldOpen(worldIndex: number, progress: Record<string, number>): boolean {
  if (worldIndex === 0) return true
  const prev = WORLDS[worldIndex - 1]
  return (progress[prev.id] ?? 0) >= 1
}

export function isLevelOpen(world: World, levelIndex: number, progress: Record<string, number>): boolean {
  return levelIndex <= (progress[world.id] ?? 0) + 1
}

export function totalLevelsDone(progress: Record<string, number>): number {
  return WORLDS.reduce((sum, w) => sum + Math.min(progress[w.id] ?? 0, LEVELS_PER_WORLD), 0)
}

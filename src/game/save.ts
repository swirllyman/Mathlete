import { DEFAULT_EQUIPPED, STARTER_IDS } from './catalog'
import type { SaveData, SlotId } from './types'

const KEY = 'mathlete.save.v1'
const VERSION = 1

export function freshSave(): SaveData {
  return {
    version: VERSION,
    stars: 0,
    claimed: 0,
    unlocked: [...STARTER_IDS],
    equipped: { ...DEFAULT_EQUIPPED },
    progress: {},
    settings: {
      voiceOn: true,
      musicOn: true,
      voiceURI: null,
      rate: 0.92,
      pitch: 1.35,
    },
  }
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshSave()
    const parsed = JSON.parse(raw) as Partial<SaveData>
    if (parsed.version !== VERSION) return freshSave()
    const base = freshSave()
    return {
      ...base,
      ...parsed,
      // Merge rather than replace so items added to the catalog in a later
      // build don't blow up an existing save.
      unlocked: [...new Set([...base.unlocked, ...(parsed.unlocked ?? [])])],
      equipped: { ...base.equipped, ...(parsed.equipped ?? {}) } as Record<SlotId, string>,
      progress: { ...(parsed.progress ?? {}) },
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    // A corrupt or unavailable localStorage should never stop the game.
    return freshSave()
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save))
  } catch {
    // Private-mode / quota failures are non-fatal; play continues in memory.
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Ignore.
  }
}

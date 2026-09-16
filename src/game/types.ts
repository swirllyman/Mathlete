/** Core game types for Mathlete. */

export type SlotId = 'body' | 'face' | 'hat' | 'item' | 'scene'

export interface WardrobeItem {
  id: string
  slot: SlotId
  /** Spoken + displayed name, e.g. "Party Hat". */
  name: string
  /** Primary color, used for body/scene swatches and gift-box tinting. */
  color: string
  /** Secondary color for two-tone art. */
  accent?: string
  /** Items with `starter` are owned from the very first launch. */
  starter?: boolean
}

export type Equipped = Record<SlotId, string>

export type ProblemKind = 'count' | 'add' | 'sub'

export interface Problem {
  kind: ProblemKind
  a: number
  b: number
  answer: number
  /** Emoji used for the counting manipulatives. */
  emoji: string
  /** Plural noun for the emoji, e.g. "apples". */
  noun: string
  /** Fully spelled-out prompt for the voice, e.g. "three plus two". */
  spoken: string
  /** Short symbolic form for the screen, e.g. "3 + 2". */
  written: string
  choices: number[]
}

export interface LevelSpec {
  /** 1-based index within its world. */
  index: number
  kinds: ProblemKind[]
  /** Largest number that may appear in a problem. */
  max: number
  /** How many answer bubbles to show. */
  choiceCount: number
  /**
   * Hard Mode. The pile a child would otherwise just count sits under a lid,
   * so the sum has to be reasoned about rather than tallied. Reserved for the
   * tail end of the last worlds.
   */
  hard: boolean
}

export interface World {
  id: string
  name: string
  /** Spoken blurb when the world is selected. */
  blurb: string
  emoji: string
  color: string
  accent: string
  levels: LevelSpec[]
}

export interface SaveData {
  version: number
  /** Total stars ever earned. Drives the reward track. */
  stars: number
  /** Star count already "spent" claiming reward-track gifts. */
  claimed: number
  unlocked: string[]
  equipped: Equipped
  /** `worldId` -> highest level index completed (0 = none yet). */
  progress: Record<string, number>
  settings: Settings
}

export interface Settings {
  voiceOn: boolean
  musicOn: boolean
  /** `voiceURI` of the chosen speechSynthesis voice, or null for auto-pick. */
  voiceURI: string | null
  rate: number
  pitch: number
}

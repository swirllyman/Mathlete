import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { sfx } from '../audio/sfx'
import { speech } from '../audio/speech'
import { REWARD_ORDER, STARS_PER_GIFT, getItem } from './catalog'
import { freshSave, loadSave, persistSave } from './save'
import type { SaveData, Settings, SlotId, WardrobeItem } from './types'

interface GameValue {
  save: SaveData
  /** Read a line aloud, respecting the voice toggle. */
  say: (text: string, onEnd?: () => void) => void
  saySequence: (parts: string[], onEnd?: () => void) => void
  awardStars: (n: number) => void
  completeLevel: (worldId: string, level: number) => void
  equip: (item: WardrobeItem) => void
  /** The next gift waiting to be opened, or null. */
  pendingGift: WardrobeItem | null
  claimGift: () => void
  /** Stars still needed before the next gift pops. */
  starsToNextGift: number
  updateSettings: (patch: Partial<Settings>) => void
  resetEverything: () => void
}

const GameContext = createContext<GameValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveData>(() => loadSave())

  // Push settings into the audio singletons whenever they change.
  useEffect(() => {
    speech.enabled = save.settings.voiceOn
    speech.rate = save.settings.rate
    speech.pitch = save.settings.pitch
    speech.setVoice(save.settings.voiceURI)
    sfx.setSound(true)
    sfx.setMusic(save.settings.musicOn)
  }, [save.settings])

  useEffect(() => {
    persistSave(save)
  }, [save])

  const say = useCallback((text: string, onEnd?: () => void) => {
    speech.speak(text, { onEnd })
  }, [])

  const saySequence = useCallback((parts: string[], onEnd?: () => void) => {
    speech.speakSequence(parts, 200, onEnd)
  }, [])

  const awardStars = useCallback((n: number) => {
    setSave((prev) => ({ ...prev, stars: prev.stars + n }))
  }, [])

  const completeLevel = useCallback((worldId: string, level: number) => {
    setSave((prev) => ({
      ...prev,
      progress: { ...prev.progress, [worldId]: Math.max(prev.progress[worldId] ?? 0, level) },
    }))
  }, [])

  const equip = useCallback((item: WardrobeItem) => {
    setSave((prev) => ({
      ...prev,
      equipped: { ...prev.equipped, [item.slot as SlotId]: item.id },
    }))
  }, [])

  const giftsEarned = Math.min(Math.floor(save.stars / STARS_PER_GIFT), REWARD_ORDER.length)
  const pendingGiftId = giftsEarned > save.claimed ? REWARD_ORDER[save.claimed] : null
  const pendingGift = pendingGiftId ? getItem(pendingGiftId) : null

  const claimGift = useCallback(() => {
    setSave((prev) => {
      const id = REWARD_ORDER[prev.claimed]
      if (!id) return prev
      const item = getItem(id)
      return {
        ...prev,
        claimed: prev.claimed + 1,
        unlocked: prev.unlocked.includes(id) ? prev.unlocked : [...prev.unlocked, id],
        // Wearing the new thing immediately is the whole payoff.
        equipped: { ...prev.equipped, [item.slot]: item.id },
      }
    })
  }, [])

  const starsToNextGift = save.claimed >= REWARD_ORDER.length
    ? 0
    : STARS_PER_GIFT - (save.stars % STARS_PER_GIFT)

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSave((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const resetEverything = useCallback(() => {
    // Wipe progress but leave the grown-up's sound choices alone.
    setSave((prev) => ({ ...freshSave(), settings: prev.settings }))
  }, [])

  const value = useMemo<GameValue>(
    () => ({
      save,
      say,
      saySequence,
      awardStars,
      completeLevel,
      equip,
      pendingGift,
      claimGift,
      starsToNextGift,
      updateSettings,
      resetEverything,
    }),
    [save, say, saySequence, awardStars, completeLevel, equip, pendingGift, claimGift, starsToNextGift, updateSettings, resetEverything],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameValue {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside a GameProvider')
  return value
}

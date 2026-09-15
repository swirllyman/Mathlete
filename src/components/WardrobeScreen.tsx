import { useEffect, useState } from 'react'
import { sfx } from '../audio/sfx'
import { CATALOG, REWARD_ORDER, SLOT_EMOJI, SLOT_LABEL, SLOT_ORDER, STARS_PER_GIFT } from '../game/catalog'
import { useGame } from '../game/store'
import type { SlotId, WardrobeItem } from '../game/types'
import { Robot } from './Robot'
import { TopBar } from './TopBar'

export function WardrobeScreen({ onHome }: { onHome: () => void }) {
  const { save, say, equip } = useGame()
  const [slot, setSlot] = useState<SlotId>('hat')

  useEffect(() => {
    say('Dress up Bloop! Pick anything you like.')
  }, [say])

  const items = CATALOG.filter((item) => item.slot === slot)
  const owned = new Set(save.unlocked)

  const pickItem = (item: WardrobeItem) => {
    if (owned.has(item.id)) {
      sfx.tap()
      equip(item)
      say(item.name)
      return
    }
    sfx.wrong()
    say(`Keep playing to unlock the ${item.name}!`)
  }

  return (
    <div className="screen screen--wardrobe">
      <TopBar onHome={onHome} title="Dress Up" />

      <div className="wardrobe__stage">
        <Robot equipped={save.equipped} mood="happy" size="min(30vh, 230px)" />
      </div>

      <nav className="wardrobe__tabs">
        {SLOT_ORDER.map((id) => (
          <button
            key={id}
            className={`tab ${slot === id ? 'tab--on' : ''}`}
            onClick={() => {
              sfx.tap()
              setSlot(id)
              say(SLOT_LABEL[id])
            }}
          >
            <span aria-hidden="true">{SLOT_EMOJI[id]}</span>
            <span className="tab__label">{SLOT_LABEL[id]}</span>
          </button>
        ))}
      </nav>

      <div className="wardrobe__grid">
        {items.map((item) => {
          const unlocked = owned.has(item.id)
          const worn = save.equipped[item.slot] === item.id
          const rewardIndex = REWARD_ORDER.indexOf(item.id)
          const starsNeeded = rewardIndex >= 0 ? (rewardIndex + 1) * STARS_PER_GIFT : 0
          return (
            <button
              key={item.id}
              className={`swatch ${worn ? 'swatch--on' : ''} ${unlocked ? '' : 'swatch--locked'}`}
              onClick={() => pickItem(item)}
              aria-label={unlocked ? item.name : `${item.name}, locked`}
            >
              <span
                className="swatch__chip"
                style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent ?? item.color})` }}
              >
                {unlocked ? (
                  <PreviewGlyph item={item} />
                ) : (
                  <span className="swatch__lock" aria-hidden="true">🔒</span>
                )}
              </span>
              <span className="swatch__name">
                {unlocked ? item.name : `⭐ ${starsNeeded}`}
              </span>
              {worn && <span className="swatch__check" aria-hidden="true">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** A tiny stand-in glyph so each swatch reads at a glance. */
function PreviewGlyph({ item }: { item: WardrobeItem }) {
  const glyphs: Record<string, string> = {
    'hat-none': '—',
    'hat-party': '🎉',
    'hat-crown': '👑',
    'hat-beanie': '🧢',
    'hat-propeller': '🚁',
    'hat-chef': '👨‍🍳',
    'hat-wizard': '🧙',
    'hat-flower': '🌸',
    'hat-cowboy': '🤠',
    'hat-space': '🧑‍🚀',
    'hat-bow': '🎀',
    'hat-cat': '🐱',
    'item-none': '—',
    'item-balloon': '🎈',
    'item-icecream': '🍦',
    'item-flower': '🌻',
    'item-wand': '🪄',
    'item-book': '📖',
    'item-duck': '🦆',
    'item-guitar': '🎸',
    'item-star': '⭐',
    'item-kite': '🪁',
    'face-happy': '😊',
    'face-stars': '🤩',
    'face-hearts': '😍',
    'face-sleepy': '😴',
    'face-visor': '🕶️',
    'face-swirl': '😵‍💫',
    'face-wink': '😉',
    'face-blush': '☺️',
    'face-goggles': '🥽',
    'scene-meadow': '🌳',
    'scene-night': '🌙',
    'scene-beach': '🏖️',
    'scene-space': '🪐',
    'scene-snow': '❄️',
    'scene-candy': '🍬',
  }
  const glyph = glyphs[item.id]
  if (!glyph) return null
  return <span className="swatch__glyph" aria-hidden="true">{glyph}</span>
}

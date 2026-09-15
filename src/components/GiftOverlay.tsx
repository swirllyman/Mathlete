import { useEffect, useState } from 'react'
import { sfx } from '../audio/sfx'
import { SLOT_LABEL } from '../game/catalog'
import { useGame } from '../game/store'
import type { Equipped, WardrobeItem } from '../game/types'
import { Confetti } from './Confetti'
import { Robot } from './Robot'

/**
 * The gift-box moment: a wrapped present the child taps to open, then Bloop
 * appears already wearing the new thing.
 */
export function GiftOverlay({ item, onDone }: { item: WardrobeItem; onDone: () => void }) {
  const { save, saySequence, say, claimGift } = useGame()
  const [opened, setOpened] = useState(false)
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    sfx.star()
    saySequence(['You earned a surprise!', 'Tap the present to open it!'])
  }, [saySequence])

  // Show Bloop already wearing the prize, without committing it to the save
  // until the child taps through.
  const previewEquipped: Equipped = { ...save.equipped, [item.slot]: item.id }

  const open = () => {
    if (opened) return
    setOpened(true)
    setBurst((b) => b + 1)
    sfx.unlock()
    claimGift()
    saySequence(['Ta-daa!', `You unlocked the ${item.name}!`])
  }

  return (
    <div className="overlay">
      <Confetti burst={burst} intensity={2.4} />
      {!opened ? (
        <button className="gift" onClick={open} aria-label="Open your present">
          <svg viewBox="0 0 120 120" width="min(46vh, 320px)" height="min(46vh, 320px)" className="gift__svg">
            <rect x="12" y="44" width="96" height="66" rx="10" fill={item.color} />
            <rect x="12" y="38" width="96" height="20" rx="8" fill={item.accent ?? item.color} />
            <rect x="52" y="38" width="16" height="72" fill="#fff" opacity="0.85" />
            <path d="M60 38c-10-2-22-6-22-14a8 8 0 0 1 14-5c4 4 6 12 8 19z" fill="#fff" opacity="0.9" />
            <path d="M60 38c10-2 22-6 22-14a8 8 0 0 0-14-5c-4 4-6 12-8 19z" fill="#fff" opacity="0.9" />
            <circle cx="60" cy="34" r="6" fill="#fff" />
          </svg>
          <span className="gift__label">Tap to open!</span>
        </button>
      ) : (
        <div className="gift__reveal">
          <h2 className="gift__title">{item.name}!</h2>
          <p className="gift__slot">A new {SLOT_LABEL[item.slot].toLowerCase().replace(/s$/, '')} for Bloop</p>
          <Robot equipped={previewEquipped} mood="cheer" size="min(40vh, 300px)" />
          <button
            className="big-btn big-btn--play"
            onClick={() => {
              sfx.tap()
              say('Yay!')
              onDone()
            }}
          >
            Yay!
          </button>
        </div>
      )}
    </div>
  )
}

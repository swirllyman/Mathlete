import { useEffect, useRef } from 'react'
import { sfx } from '../audio/sfx'
import { REWARD_ORDER, STARS_PER_GIFT, getItem } from '../game/catalog'
import { useGame } from '../game/store'

/**
 * The reward path. Claimed prizes are revealed, the next one is a present the
 * child is working toward, and everything after that is a mystery box.
 */
export function RewardTrack() {
  const { save, say, starsToNextGift } = useGame()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLLIElement>(null)

  // Keep the node you're working toward in view whenever stars change.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [save.claimed, save.stars])

  const allDone = save.claimed >= REWARD_ORDER.length

  return (
    <div className="track">
      <button
        className="track__title"
        onClick={() => {
          sfx.tap()
          say(
            allDone
              ? 'Wow! You collected every single prize!'
              : `${starsToNextGift} more ${starsToNextGift === 1 ? 'star' : 'stars'} until your next surprise!`,
          )
        }}
      >
        <span aria-hidden="true">🎁</span>
        {allDone ? 'All prizes collected!' : `${starsToNextGift} more ${starsToNextGift === 1 ? 'star' : 'stars'} to a surprise!`}
      </button>

      <div className="track__rail" ref={scrollerRef}>
        <ol className="track__nodes">
          {REWARD_ORDER.map((id, i) => {
            const item = getItem(id)
            const needed = (i + 1) * STARS_PER_GIFT
            const claimed = i < save.claimed
            const isNext = i === save.claimed
            return (
              <li
                key={id}
                ref={isNext ? currentRef : undefined}
                className={`node ${claimed ? 'node--got' : ''} ${isNext ? 'node--next' : ''}`}
              >
                <button
                  className="node__dot"
                  style={claimed ? { background: `linear-gradient(135deg, ${item.color}, ${item.accent ?? item.color})` } : undefined}
                  onClick={() => {
                    sfx.tap()
                    say(
                      claimed
                        ? `You already have the ${item.name}.`
                        : `A surprise at ${needed} stars. You have ${save.stars}.`,
                    )
                  }}
                  aria-label={claimed ? item.name : `Surprise at ${needed} stars`}
                >
                  <span aria-hidden="true">{claimed ? '✓' : isNext ? '🎁' : '❓'}</span>
                </button>
                <span className="node__label">{claimed ? item.name : `⭐ ${needed}`}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

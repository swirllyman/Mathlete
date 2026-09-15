import { sfx } from '../audio/sfx'
import { REWARD_ORDER, STARS_PER_GIFT } from '../game/catalog'
import { useGame } from '../game/store'

interface TopBarProps {
  onHome?: () => void
  onWardrobe?: () => void
  onGrownUps?: () => void
  title?: string
}

/** Persistent HUD: star count, progress to the next gift, and navigation. */
export function TopBar({ onHome, onWardrobe, onGrownUps, title }: TopBarProps) {
  const { save, say } = useGame()
  const allCollected = save.claimed >= REWARD_ORDER.length
  const intoGift = allCollected ? STARS_PER_GIFT : save.stars % STARS_PER_GIFT
  const pct = (intoGift / STARS_PER_GIFT) * 100

  const tap = (fn?: () => void, spoken?: string) => () => {
    sfx.tap()
    if (spoken) say(spoken)
    fn?.()
  }

  return (
    <header className="topbar">
      {onHome && (
        <button className="icon-btn" onClick={tap(onHome, 'Back')} aria-label="Back home">
          <span aria-hidden="true">🏠</span>
        </button>
      )}

      <div className="topbar__stars" onClick={tap(undefined, `You have ${save.stars} stars!`)} role="status">
        <span className="topbar__star" aria-hidden="true">⭐</span>
        <span className="topbar__count">{save.stars}</span>
      </div>

      {title ? (
        <h1 className="topbar__title">{title}</h1>
      ) : (
        <div className="topbar__track" title="Progress to the next surprise">
          <div className="topbar__track-fill" style={{ width: `${pct}%` }} />
          <span className="topbar__gift" aria-hidden="true">
            {allCollected ? '🏆' : '🎁'}
          </span>
        </div>
      )}

      {onWardrobe && (
        <button className="icon-btn" onClick={tap(onWardrobe, 'Dress up Bloop!')} aria-label="Dress up Bloop">
          <span aria-hidden="true">👕</span>
        </button>
      )}
      {onGrownUps && (
        <button className="icon-btn icon-btn--quiet" onClick={tap(onGrownUps)} aria-label="Grown-ups">
          <span aria-hidden="true">⚙️</span>
        </button>
      )}
    </header>
  )
}

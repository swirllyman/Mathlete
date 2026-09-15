import { useEffect } from 'react'
import { sfx } from '../audio/sfx'
import { speech } from '../audio/speech'
import { useGame } from '../game/store'
import { Robot } from './Robot'

interface TitleScreenProps {
  onPlay: () => void
  onWardrobe: () => void
  onGrownUps: () => void
}

export function TitleScreen({ onPlay, onWardrobe, onGrownUps }: TitleScreenProps) {
  const { save, saySequence } = useGame()

  // The first tap anywhere unlocks audio for the whole session.
  useEffect(() => {
    const unlock = () => {
      speech.prime()
      sfx.resume()
      sfx.startMusic()
      saySequence(['Hi! I am Bloop.', 'Want to do some math with me?'])
      window.removeEventListener('pointerdown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    return () => window.removeEventListener('pointerdown', unlock)
  }, [saySequence])

  return (
    <div className="screen screen--title">
      <div className="title__logo">
        <span className="title__word">
          {'Mathlete'.split('').map((letter, i) => (
            <span key={i} className="title__letter" style={{ animationDelay: `${i * 0.09}s` }}>
              {letter}
            </span>
          ))}
        </span>
        <p className="title__tag">Math games with Bloop the robot</p>
      </div>

      <Robot equipped={save.equipped} mood="happy" size="min(46vh, 340px)" className="title__robot" />

      <button
        className="big-btn big-btn--play"
        onClick={() => {
          sfx.whoosh()
          onPlay()
        }}
      >
        <span aria-hidden="true">▶</span> Play
      </button>

      <div className="title__row">
        <button
          className="big-btn big-btn--small"
          onClick={() => {
            sfx.tap()
            onWardrobe()
          }}
        >
          <span aria-hidden="true">👕</span> Dress Up
        </button>
        <button
          className="big-btn big-btn--small big-btn--quiet"
          onClick={() => {
            sfx.tap()
            onGrownUps()
          }}
        >
          <span aria-hidden="true">⚙️</span> Grown-ups
        </button>
      </div>
    </div>
  )
}

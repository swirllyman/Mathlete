import { useEffect, useState } from 'react'
import { sfx } from '../audio/sfx'
import { useGame } from '../game/store'
import { LEVELS_PER_WORLD, WORLDS } from '../game/worlds'
import type { World } from '../game/types'
import { RewardTrack } from './RewardTrack'
import { Robot } from './Robot'
import { TopBar } from './TopBar'

interface MapScreenProps {
  onPlay: (worldId: string, level: number, endless: boolean) => void
  onHome: () => void
  onWardrobe: () => void
  onGrownUps: () => void
}

export function MapScreen({ onPlay, onHome, onWardrobe, onGrownUps }: MapScreenProps) {
  const { save, say } = useGame()
  // One switch rather than a second button on all thirty levels: it decides
  // what tapping any level does, and every level has a forever version.
  const [endless, setEndless] = useState(false)

  useEffect(() => {
    say('Pick a place to play!')
  }, [say])

  return (
    <div className="screen screen--map">
      <TopBar onHome={onHome} onWardrobe={onWardrobe} onGrownUps={onGrownUps} />

      <div className="map__header">
        <Robot equipped={save.equipped} mood="idle" size={92} />
        <button className="speech-bubble" onClick={() => say('Pick a place to play!')}>
          Pick a place to play!
          <span className="speech-bubble__icon" aria-hidden="true">🔊</span>
        </button>
      </div>

      <div className="mode" role="group" aria-label="How long to play">
        <button
          className={`mode__pick ${endless ? '' : 'mode__pick--on'}`}
          onClick={() => {
            sfx.tap()
            setEndless(false)
            say('Five questions.')
          }}
        >
          <span aria-hidden="true">5️⃣</span> Five Questions
        </button>
        <button
          className={`mode__pick ${endless ? 'mode__pick--on' : ''}`}
          onClick={() => {
            sfx.tap()
            setEndless(true)
            say('Play forever! Keep going as long as you like.')
          }}
        >
          <span aria-hidden="true">♾️</span> Forever
        </button>
      </div>

      <button
        className="legend"
        onClick={() => {
          sfx.tap()
          say('The levels with a flame are Hard Mode. They are extra tricky, and it is brave to try them!')
        }}
      >
        <span aria-hidden="true">🔥</span> Flame levels are Hard Mode — extra tricky!
      </button>

      <RewardTrack />

      <div className="map__worlds">
        {WORLDS.map((world) => (
          <WorldRow
            key={world.id}
            world={world}
            done={save.progress[world.id] ?? 0}
            endless={endless}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  )
}

interface WorldRowProps {
  world: World
  /** Highest level finished in this world; drives the stars, not access. */
  done: number
  endless: boolean
  onPlay: (worldId: string, level: number, endless: boolean) => void
}

function WorldRow({ world, done, endless, onPlay }: WorldRowProps) {
  const { say } = useGame()
  const complete = done >= LEVELS_PER_WORLD

  return (
    <section
      className="world"
      style={{ ['--world' as string]: world.color, ['--world-dark' as string]: world.accent }}
    >
      <button
        className="world__badge"
        onClick={() => {
          sfx.tap()
          say(`${world.name}. ${world.blurb}`)
        }}
      >
        <span className="world__emoji" aria-hidden="true">{world.emoji}</span>
        <span className="world__name">{world.name}</span>
        {complete && <span className="world__done" aria-label="finished">🏅</span>}
      </button>

      <div className="world__levels">
        {world.levels.map((level) => {
          const cleared = level.index <= done
          return (
            <button
              key={level.index}
              className={`level ${cleared ? 'level--done' : ''} ${level.hard ? 'level--hard' : ''}`}
              onClick={() => {
                sfx.whoosh()
                onPlay(world.id, level.index, endless)
              }}
              aria-label={`${world.name}, level ${level.index}${level.hard ? ', hard mode' : ''}${
                cleared ? ', finished' : ''
              }`}
            >
              <span className="level__num">{level.index}</span>
              {cleared && <span className="level__star" aria-hidden="true">⭐</span>}
              {level.hard && <span className="level__hard" aria-hidden="true">🔥</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

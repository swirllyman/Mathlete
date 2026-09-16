import { useEffect, useState } from 'react'
import { speech } from './audio/speech'
import { GameProvider, useGame } from './game/store'
import type { WardrobeItem } from './game/types'
import { LEVELS_PER_WORLD, WORLDS } from './game/worlds'
import { GiftOverlay } from './components/GiftOverlay'
import { GrownUps } from './components/GrownUps'
import { MapScreen } from './components/MapScreen'
import { PlayScreen } from './components/PlayScreen'
import { Scene } from './components/Scene'
import { TitleScreen } from './components/TitleScreen'
import { WardrobeScreen } from './components/WardrobeScreen'

type Screen =
  | { name: 'title' }
  | { name: 'map' }
  | { name: 'play'; worldId: string; level: number; endless: boolean }
  | { name: 'wardrobe' }
  | { name: 'grownups' }

export default function App() {
  useEffect(() => {
    speech.init()
    return () => speech.dispose()
  }, [])

  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}

function Game() {
  const { save, pendingGift } = useGame()
  const [screen, setScreen] = useState<Screen>({ name: 'title' })
  // Hold the gift locally: claiming it changes `pendingGift`, and the overlay
  // must survive that change to finish its reveal.
  const [activeGift, setActiveGift] = useState<WardrobeItem | null>(null)
  const [afterGift, setAfterGift] = useState<Screen | null>(null)

  // Outside a level, prizes are handed over as soon as they are earned. Inside
  // one they wait: a present bursting in mid-question steals a child's
  // attention exactly when they are thinking, and buries the star tally.
  useEffect(() => {
    if (pendingGift && !activeGift && screen.name !== 'play') setActiveGift(pendingGift)
  }, [pendingGift, activeGift, screen.name])

  /** Leave a level, letting any prize earned during it land first. */
  const leaveLevel = (target: Screen) => {
    if (pendingGift) {
      setActiveGift(pendingGift)
      setAfterGift(target)
      return
    }
    setScreen(target)
  }

  /** After a level, roll straight into the next one so play keeps flowing. */
  const advance = (worldId: string, level: number) => {
    const endless = screen.name === 'play' ? screen.endless : false
    if (level < LEVELS_PER_WORLD) {
      leaveLevel({ name: 'play', worldId, level: level + 1, endless })
      return
    }
    const next = WORLDS[WORLDS.findIndex((w) => w.id === worldId) + 1]
    leaveLevel(next ? { name: 'play', worldId: next.id, level: 1, endless } : { name: 'map' })
  }

  const closeGift = () => {
    setActiveGift(null)
    // More than one prize can come due at once; show them back to back.
    if (pendingGift) {
      setActiveGift(pendingGift)
      return
    }
    if (afterGift) {
      setScreen(afterGift)
      setAfterGift(null)
    }
  }

  return (
    <div className="app">
      <Scene id={save.equipped.scene} />

      {screen.name === 'title' && (
        <TitleScreen
          onPlay={() => setScreen({ name: 'map' })}
          onWardrobe={() => setScreen({ name: 'wardrobe' })}
          onGrownUps={() => setScreen({ name: 'grownups' })}
        />
      )}

      {screen.name === 'map' && (
        <MapScreen
          onPlay={(worldId, level, endless) => setScreen({ name: 'play', worldId, level, endless })}
          onHome={() => setScreen({ name: 'title' })}
          onWardrobe={() => setScreen({ name: 'wardrobe' })}
          onGrownUps={() => setScreen({ name: 'grownups' })}
        />
      )}

      {screen.name === 'play' && (
        <PlayScreen
          key={`${screen.worldId}-${screen.level}-${screen.endless}`}
          worldId={screen.worldId}
          level={screen.level}
          endless={screen.endless}
          onExit={() => leaveLevel({ name: 'map' })}
          onFinished={advance}
        />
      )}

      {screen.name === 'wardrobe' && <WardrobeScreen onHome={() => setScreen({ name: 'map' })} />}

      {screen.name === 'grownups' && <GrownUps onHome={() => setScreen({ name: 'map' })} />}

      {/* Keyed by prize: two can come due at once, and the second must get a
          freshly wrapped box of its own rather than reusing the opened one. */}
      {activeGift && <GiftOverlay key={activeGift.id} item={activeGift} onDone={closeGift} />}
    </div>
  )
}

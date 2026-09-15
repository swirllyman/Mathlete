import { useEffect, useState } from 'react'
import { sfx } from '../audio/sfx'
import { speech } from '../audio/speech'
import { REWARD_ORDER } from '../game/catalog'
import { useGame } from '../game/store'
import { LEVELS_PER_WORLD, WORLDS, totalLevelsDone } from '../game/worlds'

/**
 * Settings, behind a small multiplication gate so a three-year-old mashing
 * buttons can't wander in and turn the voice off.
 */
export function GrownUps({ onHome }: { onHome: () => void }) {
  const { save, updateSettings, resetEverything, say } = useGame()
  const [unlocked, setUnlocked] = useState(false)
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => speech.listVoices())
  const [confirmReset, setConfirmReset] = useState(false)

  const [gate] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 7)
    const b = 4 + Math.floor(Math.random() * 6)
    return { a, b, answer: a * b }
  })

  useEffect(() => speech.onVoicesChanged(() => setVoices(speech.listVoices())), [])

  if (!unlocked) {
    return (
      <div className="screen screen--gate">
        <h2 className="gate__title">Grown-ups only</h2>
        <p className="gate__prompt">
          What is <strong>{gate.a} × {gate.b}</strong>?
        </p>
        <div className={`gate__display ${shake ? 'gate__display--shake' : ''}`}>{entry || '?'}</div>
        <div className="gate__pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
            <button
              key={n}
              className="gate__key"
              onClick={() => {
                const next = (entry + n).slice(0, 3)
                setEntry(next)
                if (Number(next) === gate.answer) {
                  setUnlocked(true)
                } else if (next.length >= String(gate.answer).length) {
                  setShake(true)
                  window.setTimeout(() => {
                    setShake(false)
                    setEntry('')
                  }, 400)
                }
              }}
            >
              {n}
            </button>
          ))}
          <button className="gate__key gate__key--wide" onClick={() => setEntry('')}>
            Clear
          </button>
        </div>
        <button className="big-btn big-btn--small big-btn--quiet" onClick={onHome}>
          Back to the game
        </button>
      </div>
    )
  }

  const levelsDone = totalLevelsDone(save.progress)
  const totalLevels = WORLDS.length * LEVELS_PER_WORLD
  const unlockedCount = save.unlocked.length
  const totalItems = REWARD_ORDER.length + save.unlocked.filter((id) => !REWARD_ORDER.includes(id)).length

  return (
    <div className="screen screen--settings">
      <header className="settings__head">
        <h2>Grown-ups</h2>
        <button className="big-btn big-btn--small" onClick={onHome}>
          Done
        </button>
      </header>

      <section className="panel">
        <h3>Progress</h3>
        <div className="stats">
          <Stat label="Stars earned" value={save.stars} />
          <Stat label="Levels finished" value={`${levelsDone} / ${totalLevels}`} />
          <Stat label="Items unlocked" value={`${unlockedCount} / ${totalItems}`} />
        </div>
      </section>

      <section className="panel">
        <h3>Sound</h3>
        <Toggle
          label="Read everything aloud"
          hint={speech.supported ? undefined : 'This browser has no speech voices available.'}
          checked={save.settings.voiceOn}
          onChange={(voiceOn) => updateSettings({ voiceOn })}
        />
        <Toggle label="Background music" checked={save.settings.musicOn} onChange={(musicOn) => updateSettings({ musicOn })} />
      </section>

      <section className="panel">
        <h3>Voice</h3>
        <label className="field">
          <span>Which voice</span>
          <select
            value={save.settings.voiceURI ?? ''}
            onChange={(e) => {
              const uri = e.target.value || null
              updateSettings({ voiceURI: uri })
              speech.setVoice(uri)
              window.setTimeout(() => say('Hi! I am Bloop. Ready to count?'), 120)
            }}
          >
            <option value="">Pick automatically</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>

        <Slider
          label="Speed"
          min={0.6}
          max={1.3}
          value={save.settings.rate}
          onChange={(rate) => updateSettings({ rate })}
        />
        <Slider
          label="Pitch"
          min={0.8}
          max={1.8}
          value={save.settings.pitch}
          onChange={(pitch) => updateSettings({ pitch })}
        />

        <button
          className="big-btn big-btn--small"
          onClick={() => {
            sfx.tap()
            speech.rate = save.settings.rate
            speech.pitch = save.settings.pitch
            say('Two plus two is four. Great job!')
          }}
        >
          🔊 Test the voice
        </button>
        {voices.length === 0 && (
          <p className="hint">
            No voices detected yet. Some browsers load them a moment after the page opens, or only once
            you have tapped the screen.
          </p>
        )}
      </section>

      <section className="panel panel--danger">
        <h3>Start over</h3>
        <p className="hint">Clears all stars, unlocked outfits, and level progress. Sound settings are kept.</p>
        {confirmReset ? (
          <div className="title__row">
            <button
              className="big-btn big-btn--small big-btn--danger"
              onClick={() => {
                resetEverything()
                setConfirmReset(false)
              }}
            >
              Yes, erase it all
            </button>
            <button className="big-btn big-btn--small big-btn--quiet" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="big-btn big-btn--small big-btn--danger" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="field field--toggle">
      <span>
        {label}
        {hint && <em className="hint"> {hint}</em>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  )
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="field">
      <span>
        {label} <em className="hint">{value.toFixed(2)}</em>
      </span>
      <input type="range" min={min} max={max} step={0.02} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

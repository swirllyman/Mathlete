/**
 * Thin wrapper around the Web Speech API, tuned for a cute read-aloud voice.
 *
 * Every string the game shows a child goes through here, so this module is
 * deliberately defensive: unsupported browsers, voices that load late, and the
 * Chrome bug where synthesis silently parks itself in a paused state all have
 * to degrade into "no sound" rather than "the game stops working".
 */

export interface SpeakOptions {
  /** Stop whatever is currently being said first. Defaults to true. */
  interrupt?: boolean
  onEnd?: () => void
}

/** Voices that sound friendly rather than newsreader-flat, best first. */
const PREFERRED_VOICES = [
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
  'Google UK English Female',
  'Google US English',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Zira',
  'Fiona',
  'Victoria',
]

class Speech {
  private voices: SpeechSynthesisVoice[] = []
  private chosen: SpeechSynthesisVoice | null = null
  private preferredURI: string | null = null
  private listeners = new Set<() => void>()
  private watchdog: number | null = null
  private primed = false

  enabled = true
  rate = 0.92
  pitch = 1.35

  get supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  init(): void {
    if (!this.supported) return
    this.refreshVoices()
    window.speechSynthesis.addEventListener('voiceschanged', this.refreshVoices)

    // Chrome (desktop) can drop into a paused state after an idle period and
    // then swallow every later utterance. A periodic resume keeps it honest.
    this.watchdog = window.setInterval(() => {
      const synth = window.speechSynthesis
      if (synth.paused && synth.speaking) synth.resume()
    }, 4000)
  }

  dispose(): void {
    if (!this.supported) return
    window.speechSynthesis.removeEventListener('voiceschanged', this.refreshVoices)
    if (this.watchdog !== null) window.clearInterval(this.watchdog)
    this.watchdog = null
  }

  private refreshVoices = (): void => {
    if (!this.supported) return
    this.voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'))
    this.applyChoice()
    this.listeners.forEach((fn) => fn())
  }

  private applyChoice(): void {
    if (this.preferredURI) {
      const exact = this.voices.find((v) => v.voiceURI === this.preferredURI)
      if (exact) {
        this.chosen = exact
        return
      }
    }
    for (const name of PREFERRED_VOICES) {
      const match = this.voices.find((v) => v.name === name)
      if (match) {
        this.chosen = match
        return
      }
    }
    this.chosen = this.voices.find((v) => v.default) ?? this.voices[0] ?? null
  }

  /** Subscribe to voice-list changes (the list loads asynchronously). */
  onVoicesChanged(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  listVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  currentVoiceURI(): string | null {
    return this.chosen?.voiceURI ?? null
  }

  setVoice(uri: string | null): void {
    this.preferredURI = uri
    this.applyChoice()
  }

  /**
   * Browsers only allow speech after a user gesture. Call this from the first
   * tap so later, non-gesture prompts (like a new question) are allowed.
   */
  prime(): void {
    if (this.primed || !this.supported) return
    this.primed = true
    try {
      const warmup = new SpeechSynthesisUtterance(' ')
      warmup.volume = 0
      window.speechSynthesis.speak(warmup)
    } catch {
      // Nothing to do; speech simply stays silent.
    }
  }

  speak(text: string, options: SpeakOptions = {}): void {
    const { interrupt = true, onEnd } = options
    if (!this.supported || !this.enabled || !text.trim()) {
      onEnd?.()
      return
    }
    try {
      const synth = window.speechSynthesis
      if (interrupt) synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      if (this.chosen) utterance.voice = this.chosen
      utterance.rate = this.rate
      utterance.pitch = this.pitch
      utterance.volume = 1

      let finished = false
      let watchdog = 0
      const done = () => {
        if (finished) return
        finished = true
        window.clearTimeout(watchdog)
        onEnd?.()
      }
      utterance.onend = done
      utterance.onerror = done

      // Some browsers (and any device with no installed voices) never fire
      // `onend`. Callers chain screen flow off it, so guarantee it lands.
      const estimate = 900 + text.length * 95
      watchdog = window.setTimeout(done, Math.min(estimate, 12000))

      // `cancel()` immediately followed by `speak()` is racy in Chrome; a tick
      // of breathing room makes the utterance stick.
      window.setTimeout(() => {
        try {
          synth.speak(utterance)
        } catch {
          done()
        }
      }, interrupt ? 60 : 0)
    } catch {
      onEnd?.()
    }
  }

  /** Say several phrases back to back with a small beat between them. */
  speakSequence(parts: string[], gapMs = 220, onEnd?: () => void): void {
    const queue = parts.filter((p) => p.trim())
    const next = (): void => {
      const part = queue.shift()
      if (part === undefined) {
        onEnd?.()
        return
      }
      this.speak(part, {
        interrupt: false,
        onEnd: () => window.setTimeout(next, gapMs),
      })
    }
    if (this.supported && this.enabled) window.speechSynthesis.cancel()
    window.setTimeout(next, 60)
  }

  stop(): void {
    if (!this.supported) return
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore.
    }
  }
}

export const speech = new Speech()

/**
 * All sound effects and the background music are synthesised with the Web
 * Audio API so the game ships with zero audio assets and stays a single
 * self-contained page.
 */

type Wave = OscillatorType

const C_MAJOR_PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicGain: GainNode | null = null
  private musicTimer: number | null = null
  private musicStep = 0

  musicOn = true
  soundOn = true

  /** Must be called from a user gesture; browsers block audio before one. */
  resume(): void {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.32
      this.master.connect(this.ctx.destination)
      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.0
      this.musicGain.connect(this.master)
    } catch {
      this.ctx = null
    }
    return this.ctx
  }

  private tone(freq: number, start: number, duration: number, opts: { wave?: Wave; gain?: number; dest?: AudioNode } = {}): void {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const { wave = 'triangle', gain = 0.5, dest = this.master } = opts
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, start)
    // Short attack, long-ish exponential tail reads as "soft and round".
    env.gain.setValueAtTime(0.0001, start)
    env.gain.exponentialRampToValueAtTime(gain, start + 0.015)
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(env)
    env.connect(dest)
    osc.start(start)
    osc.stop(start + duration + 0.05)
  }

  private melody(freqs: number[], step = 0.09, duration = 0.35, gain = 0.45, wave: Wave = 'triangle'): void {
    const ctx = this.ensure()
    if (!ctx || !this.soundOn) return
    this.resume()
    freqs.forEach((f, i) => this.tone(f, ctx.currentTime + i * step, duration, { gain, wave }))
  }

  tap(): void {
    const ctx = this.ensure()
    if (!ctx || !this.soundOn) return
    this.resume()
    this.tone(880, ctx.currentTime, 0.1, { wave: 'sine', gain: 0.28 })
  }

  correct(): void {
    this.melody([523.25, 659.25, 783.99, 1046.5], 0.08, 0.4, 0.42)
  }

  /** Deliberately warm and low, never a buzzer — a wrong tap is not a failure. */
  wrong(): void {
    const ctx = this.ensure()
    if (!ctx || !this.soundOn) return
    this.resume()
    this.tone(330, ctx.currentTime, 0.18, { wave: 'sine', gain: 0.3 })
    this.tone(294, ctx.currentTime + 0.12, 0.26, { wave: 'sine', gain: 0.26 })
  }

  star(): void {
    this.melody([1046.5, 1318.5], 0.06, 0.28, 0.3, 'sine')
  }

  levelComplete(): void {
    this.melody([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98], 0.1, 0.5, 0.4)
  }

  unlock(): void {
    this.melody([659.25, 783.99, 1046.5, 1318.5, 1046.5, 1318.5, 1567.98], 0.09, 0.45, 0.42)
  }

  whoosh(): void {
    const ctx = this.ensure()
    if (!ctx || !this.soundOn || !this.master) return
    this.resume()
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22)
    env.gain.setValueAtTime(0.0001, ctx.currentTime)
    env.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04)
    env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
    osc.connect(env)
    env.connect(this.master)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  }

  /**
   * A slow, sparse pentatonic twinkle. Random note choice from a pentatonic
   * scale means it never lands on a sour interval and never loops audibly.
   */
  startMusic(): void {
    const ctx = this.ensure()
    if (!ctx || !this.musicGain || this.musicTimer !== null) return
    this.resume()
    this.musicGain.gain.setTargetAtTime(this.musicOn ? 0.14 : 0, ctx.currentTime, 0.5)
    this.musicTimer = window.setInterval(() => {
      if (!this.musicOn || !this.ctx || !this.musicGain) return
      const now = this.ctx.currentTime
      const root = C_MAJOR_PENTATONIC[this.musicStep % C_MAJOR_PENTATONIC.length]
      this.tone(root / 2, now, 1.8, { wave: 'sine', gain: 0.5, dest: this.musicGain })
      this.tone(root, now + 0.35, 1.2, { wave: 'triangle', gain: 0.32, dest: this.musicGain })
      const sparkle = C_MAJOR_PENTATONIC[Math.floor(Math.random() * C_MAJOR_PENTATONIC.length)]
      this.tone(sparkle * 2, now + 0.9, 0.9, { wave: 'sine', gain: 0.12, dest: this.musicGain })
      this.musicStep += Math.random() < 0.5 ? 1 : 2
    }, 2400)
  }

  setMusic(on: boolean): void {
    this.musicOn = on
    const ctx = this.ensure()
    if (ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(on ? 0.14 : 0, ctx.currentTime, 0.3)
    }
    if (on) this.startMusic()
  }

  setSound(on: boolean): void {
    this.soundOn = on
  }
}

export const sfx = new Sfx()

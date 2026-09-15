import { useId } from 'react'
import { getItem } from '../game/catalog'
import type { Equipped } from '../game/types'

export type RobotMood = 'idle' | 'happy' | 'oops' | 'cheer' | 'think'

interface RobotProps {
  equipped: Equipped
  mood?: RobotMood
  /** Any CSS length; the robot scales to fill it. */
  size?: number | string
  className?: string
}

/**
 * Bloop, drawn entirely as SVG so every colour and accessory is swappable
 * without shipping a single image file.
 */
export function Robot({ equipped, mood = 'idle', size = 260, className = '' }: RobotProps) {
  const uid = useId().replace(/:/g, '')
  const body = getItem(equipped.body)
  const face = getItem(equipped.face)
  const hat = getItem(equipped.hat)
  const item = getItem(equipped.item)

  const isRainbow = body.id === 'body-rainbow'
  const shellFill = isRainbow ? `url(#shell-${uid})` : body.color
  const shade = body.accent ?? body.color

  return (
    <svg
      viewBox="0 0 200 230"
      width={size}
      height={size}
      className={`robot robot--${mood} ${className}`}
      role="img"
      aria-label="Bloop the robot"
    >
      <defs>
        <linearGradient id={`shell-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9ecb" />
          <stop offset="35%" stopColor="#ffd166" />
          <stop offset="70%" stopColor="#6fe0c6" />
          <stop offset="100%" stopColor="#8fb8ff" />
        </linearGradient>
        <linearGradient id={`gloss-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`screen-${uid}`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#3d4a6b" />
          <stop offset="100%" stopColor="#202a44" />
        </radialGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse className="robot__shadow" cx="100" cy="214" rx="54" ry="10" fill="#000" opacity="0.13" />

      <g className="robot__bob">
        {/* ---- arms (behind the torso) ---- */}
        <g className="robot__arm robot__arm--left">
          <rect x="26" y="128" width="24" height="48" rx="12" fill={shade} />
          <circle cx="38" cy="180" r="15" fill={shellFill} stroke={shade} strokeWidth="3" />
        </g>
        <g className="robot__arm robot__arm--right">
          <rect x="150" y="128" width="24" height="48" rx="12" fill={shade} />
          <circle cx="162" cy="180" r="15" fill={shellFill} stroke={shade} strokeWidth="3" />
        </g>

        {/* ---- feet ---- */}
        <rect x="58" y="188" width="34" height="18" rx="9" fill={shade} />
        <rect x="108" y="188" width="34" height="18" rx="9" fill={shade} />

        {/* ---- torso ---- */}
        <rect x="46" y="120" width="108" height="76" rx="28" fill={shellFill} stroke={shade} strokeWidth="4" />
        <rect x="72" y="136" width="56" height="42" rx="16" fill={`url(#screen-${uid})`} />
        <circle className="robot__heart" cx="100" cy="157" r="11" fill="#ff6b9d" />
        <path
          className="robot__heart"
          d="M100 163c-6-4.2-9-7-9-10.2a4.4 4.4 0 0 1 8-2.4 4.4 4.4 0 0 1 8 2.4c0 3.2-3 6-7 10.2z"
          fill="#fff"
          opacity="0.9"
        />
        <rect x="52" y="124" width="96" height="26" rx="16" fill={`url(#gloss-${uid})`} />

        {/* ---- neck ---- */}
        <rect x="90" y="108" width="20" height="16" rx="6" fill={shade} />

        {/* ---- antenna ---- */}
        <g className="robot__antenna">
          <rect x="97" y="8" width="6" height="26" rx="3" fill={shade} />
          <circle className="robot__blip" cx="100" cy="10" r="9" fill="#ffd166" stroke="#e0a42c" strokeWidth="3" />
        </g>

        {/* ---- head ---- */}
        <g className="robot__head">
          <rect x="48" y="28" width="104" height="84" rx="30" fill={shellFill} stroke={shade} strokeWidth="4" />
          <rect x="56" y="34" width="88" height="24" rx="14" fill={`url(#gloss-${uid})`} />
          <rect x="62" y="46" width="76" height="52" rx="22" fill={`url(#screen-${uid})`} />
          <Face id={face.id} color={face.color} accent={face.accent} mood={mood} />
          {/* side ears */}
          <rect x="38" y="58" width="12" height="26" rx="6" fill={shade} />
          <rect x="150" y="58" width="12" height="26" rx="6" fill={shade} />
        </g>

        <Hat id={hat.id} color={hat.color} accent={hat.accent ?? hat.color} />
        {/* items are drawn around the old hand position; nudge to match */}
        <g transform="translate(-9 0)">
          <HeldItem id={item.id} color={item.color} accent={item.accent ?? item.color} />
        </g>
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ faces */

function Face({ id, color, accent, mood }: { id: string; color: string; accent?: string; mood: RobotMood }) {
  const lx = 84
  const rx = 116
  const ey = 68

  // Expression beats the equipped face: a celebration should look like one
  // even if the child is wearing sleepy eyes.
  const mouth =
    mood === 'happy' || mood === 'cheer' ? (
      <path d="M86 84q14 14 28 0" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
    ) : mood === 'oops' ? (
      <path d="M88 88q12 -9 24 0" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
    ) : mood === 'think' ? (
      <circle cx="100" cy="85" r="5" fill="#fff" opacity="0.85" />
    ) : (
      <path d="M88 83q12 10 24 0" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
    )

  const blink = mood === 'idle' ? 'robot__eye' : ''

  let eyes
  switch (id) {
    case 'face-stars':
      eyes = (
        <>
          <Star cx={lx} cy={ey} r={12} fill={color} />
          <Star cx={rx} cy={ey} r={12} fill={color} />
        </>
      )
      break
    case 'face-hearts':
      eyes = (
        <>
          <Heart cx={lx} cy={ey} s={1} fill={color} />
          <Heart cx={rx} cy={ey} s={1} fill={color} />
        </>
      )
      break
    case 'face-sleepy':
      eyes = (
        <>
          <path d={`M${lx - 11} ${ey}q11 9 22 0`} stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d={`M${rx - 11} ${ey}q11 9 22 0`} stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      )
      break
    case 'face-visor':
      eyes = (
        <>
          <rect x="68" y="56" width="64" height="24" rx="12" fill={color} />
          <rect x="72" y="60" width="26" height="8" rx="4" fill={accent ?? '#fff'} opacity="0.75" />
        </>
      )
      break
    case 'face-swirl':
      eyes = (
        <>
          <Swirl cx={lx} cy={ey} color={color} />
          <Swirl cx={rx} cy={ey} color={color} />
        </>
      )
      break
    case 'face-wink':
      eyes = (
        <>
          <circle cx={lx} cy={ey} r="10" fill="#fff" />
          <circle cx={lx + 2} cy={ey + 1} r="5" fill={color} />
          <path d={`M${rx - 11} ${ey}q11 8 22 0`} stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      )
      break
    case 'face-blush':
      eyes = (
        <>
          <circle className={blink} cx={lx} cy={ey} r="10" fill="#fff" />
          <circle cx={lx + 2} cy={ey + 1} r="5" fill="#2b2b44" />
          <circle className={blink} cx={rx} cy={ey} r="10" fill="#fff" />
          <circle cx={rx + 2} cy={ey + 1} r="5" fill="#2b2b44" />
          <ellipse cx={lx - 14} cy={ey + 14} rx="9" ry="6" fill={color} opacity="0.75" />
          <ellipse cx={rx + 14} cy={ey + 14} rx="9" ry="6" fill={color} opacity="0.75" />
        </>
      )
      break
    case 'face-goggles':
      eyes = (
        <>
          <rect x="64" y="52" width="72" height="8" rx="4" fill={color} />
          <circle cx={lx} cy={ey} r="15" fill={accent ?? '#fff'} stroke={color} strokeWidth="5" />
          <circle cx={rx} cy={ey} r="15" fill={accent ?? '#fff'} stroke={color} strokeWidth="5" />
          <circle cx={lx + 3} cy={ey + 2} r="5" fill="#2b2b44" />
          <circle cx={rx + 3} cy={ey + 2} r="5" fill="#2b2b44" />
        </>
      )
      break
    default:
      eyes = (
        <>
          <circle className={blink} cx={lx} cy={ey} r="11" fill="#fff" />
          <circle cx={lx + 2} cy={ey + 1} r="5.5" fill="#2b2b44" />
          <circle cx={lx - 2} cy={ey - 3} r="2.5" fill="#fff" />
          <circle className={blink} cx={rx} cy={ey} r="11" fill="#fff" />
          <circle cx={rx + 2} cy={ey + 1} r="5.5" fill="#2b2b44" />
          <circle cx={rx - 2} cy={ey - 3} r="2.5" fill="#fff" />
        </>
      )
  }

  return (
    <g>
      {eyes}
      {id !== 'face-visor' && mouth}
    </g>
  )
}

function Star({ cx, cy, r, fill, opacity }: { cx: number; cy: number; r: number; fill: string; opacity?: number | string }) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.44
    const angle = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} opacity={opacity} />
}

function Heart({ cx, cy, s, fill }: { cx: number; cy: number; s: number; fill: string }) {
  return (
    <path
      transform={`translate(${cx} ${cy}) scale(${s})`}
      d="M0 9c-7-5-11-8.4-11-12.4A5.3 5.3 0 0 1 0-6a5.3 5.3 0 0 1 11 2.6C11 .6 7 4 0 9z"
      fill={fill}
    />
  )
}

function Swirl({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="12" fill="#fff" />
      <path
        d="M0-8a8 8 0 1 1-5.6 13.7"
        stroke={color}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M0-3.5a3.5 3.5 0 1 1-2.5 6" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  )
}

/* -------------------------------------------------------------------- hats */

function Hat({ id, color, accent }: { id: string; color: string; accent: string }) {
  switch (id) {
    case 'hat-party':
      return (
        <g className="robot__hat">
          <polygon points="100,-14 74,32 126,32" fill={color} />
          <polygon points="100,-14 100,32 126,32" fill={accent} opacity="0.45" />
          <circle cx="100" cy="-16" r="8" fill={accent} />
          <circle cx="86" cy="18" r="4" fill={accent} />
          <circle cx="112" cy="24" r="4" fill={accent} />
        </g>
      )
    case 'hat-crown':
      return (
        <g className="robot__hat">
          <path d="M66 30 66-2l14 14 20-20 20 20 14-14v32z" fill={color} stroke="#e0a42c" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="80" cy="6" r="4.5" fill={accent} />
          <circle cx="100" cy="-2" r="5" fill={accent} />
          <circle cx="120" cy="6" r="4.5" fill={accent} />
        </g>
      )
    case 'hat-beanie':
      return (
        <g className="robot__hat">
          <path d="M56 32a44 34 0 0 1 88 0z" fill={color} />
          <rect x="52" y="26" width="96" height="14" rx="7" fill={accent} />
          <circle cx="100" cy="-6" r="11" fill={accent} />
          <rect x="97" y="-4" width="6" height="12" fill={color} />
        </g>
      )
    case 'hat-propeller':
      return (
        <g className="robot__hat">
          <path d="M60 32a40 30 0 0 1 80 0z" fill={color} />
          <rect x="58" y="28" width="84" height="10" rx="5" fill={accent} />
          <rect x="97" y="-10" width="6" height="16" rx="3" fill="#7b8bb0" />
          <g className="robot__prop">
            <ellipse cx="80" cy="-12" rx="22" ry="6" fill={accent} />
            <ellipse cx="120" cy="-12" rx="22" ry="6" fill={accent} opacity="0.8" />
          </g>
          <circle cx="100" cy="-12" r="5" fill="#7b8bb0" />
        </g>
      )
    case 'hat-chef':
      return (
        <g className="robot__hat">
          <circle cx="76" cy="0" r="20" fill={color} />
          <circle cx="100" cy="-8" r="24" fill={color} />
          <circle cx="124" cy="0" r="20" fill={color} />
          <rect x="70" y="8" width="60" height="26" rx="8" fill={color} stroke={accent} strokeWidth="2" />
          <rect x="70" y="24" width="60" height="10" rx="5" fill={accent} />
        </g>
      )
    case 'hat-wizard':
      return (
        <g className="robot__hat">
          <path d="M100-30 68 32h64z" fill={color} />
          <ellipse cx="100" cy="32" rx="46" ry="9" fill={color} />
          <Star cx={100} cy={4} r={9} fill={accent} />
          <Star cx={86} cy={24} r={5} fill={accent} />
          <Star cx={114} cy={22} r={5} fill={accent} />
        </g>
      )
    case 'hat-flower':
      return (
        <g className="robot__hat">
          <path d="M54 30q46-24 92 0" stroke={accent} strokeWidth="9" fill="none" strokeLinecap="round" />
          {[62, 82, 100, 118, 138].map((x, i) => (
            <g key={x} transform={`translate(${x} ${[24, 12, 8, 12, 24][i]})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-7" rx="4.5" ry="7" fill={i % 2 ? '#fff' : color} transform={`rotate(${a})`} />
              ))}
              <circle r="4" fill="#ffd166" />
            </g>
          ))}
        </g>
      )
    case 'hat-cowboy':
      return (
        <g className="robot__hat">
          <path d="M44 30q56 22 112 0-14 10-56 10T44 30z" fill={accent} />
          <ellipse cx="100" cy="30" rx="58" ry="11" fill={color} />
          <path d="M74 30q4-34 26-34t26 34z" fill={color} />
          <rect x="72" y="22" width="56" height="9" rx="4" fill={accent} />
        </g>
      )
    case 'hat-space':
      return (
        <g className="robot__hat">
          <path d="M52 34a48 42 0 0 1 96 0z" fill={color} opacity="0.55" stroke={accent} strokeWidth="4" />
          <path d="M66 18a36 30 0 0 1 24-14" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
          <rect x="46" y="30" width="108" height="12" rx="6" fill={accent} />
        </g>
      )
    case 'hat-bow':
      return (
        <g className="robot__hat">
          <path d="M100 18 68 2v32z" fill={color} />
          <path d="M100 18 132 2v32z" fill={color} />
          <circle cx="100" cy="18" r="10" fill={accent} />
        </g>
      )
    case 'hat-cat':
      return (
        <g className="robot__hat">
          <path d="M58 34 60 0l30 20z" fill={color} />
          <path d="M142 34 140 0l-30 20z" fill={color} />
          <path d="M66 28 67 10l16 11z" fill={accent} />
          <path d="M134 28 133 10l-16 11z" fill={accent} />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------- held items */

function HeldItem({ id, color, accent }: { id: string; color: string; accent: string }) {
  // Everything hangs off the right hand at roughly (171, 180).
  switch (id) {
    case 'item-balloon':
      return (
        <g className="robot__item">
          <path d="M171 176q18 -14 8 -34" stroke="#7b8bb0" strokeWidth="2.5" fill="none" />
          <ellipse cx="177" cy="120" rx="21" ry="25" fill={color} />
          <ellipse cx="170" cy="112" rx="5" ry="7" fill={accent} opacity="0.6" />
          <polygon points="177,145 172,152 182,152" fill={color} />
        </g>
      )
    case 'item-icecream':
      return (
        <g className="robot__item">
          <polygon points="171,190 162,158 180,158" fill={accent} />
          <circle cx="171" cy="154" r="13" fill={color} />
          <circle cx="164" cy="148" r="9" fill="#fff" opacity="0.5" />
          <circle cx="171" cy="140" r="4" fill="#ff6b6b" />
        </g>
      )
    case 'item-flower':
      return (
        <g className="robot__item">
          <path d="M171 186v-38" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="162" cy="164" rx="9" ry="5" fill={accent} />
          <g transform="translate(171 142)">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="0" cy="-12" rx="6" ry="11" fill={color} transform={`rotate(${a})`} />
            ))}
            <circle r="7" fill="#9c6f43" />
          </g>
        </g>
      )
    case 'item-wand':
      return (
        <g className="robot__item">
          <rect x="168" y="140" width="6" height="48" rx="3" fill="#fff" stroke={accent} strokeWidth="2" />
          <Star cx={171} cy={134} r={15} fill={color} />
          <circle className="robot__sparkle" cx="190" cy="126" r="3.5" fill="#fff" />
          <circle className="robot__sparkle" cx="154" cy="140" r="3" fill="#fff" />
        </g>
      )
    case 'item-book':
      return (
        <g className="robot__item">
          <rect x="150" y="160" width="42" height="32" rx="5" fill={color} />
          <rect x="155" y="164" width="32" height="24" rx="3" fill={accent} />
          <rect x="169" y="160" width="4" height="32" fill={color} />
        </g>
      )
    case 'item-duck':
      return (
        <g className="robot__item">
          <ellipse cx="172" cy="176" rx="19" ry="13" fill={color} />
          <circle cx="182" cy="162" r="11" fill={color} />
          <polygon points="191,160 202,164 191,168" fill={accent} />
          <circle cx="185" cy="159" r="2.2" fill="#2b2b44" />
        </g>
      )
    case 'item-guitar':
      return (
        <g className="robot__item" transform="rotate(-18 171 172)">
          <rect x="167" y="128" width="8" height="34" rx="3" fill={accent} />
          <ellipse cx="171" cy="176" rx="20" ry="24" fill={color} />
          <circle cx="171" cy="174" r="7" fill="#5b3f24" />
        </g>
      )
    case 'item-star':
      return (
        <g className="robot__item">
          <Star cx={176} cy={156} r={24} fill={color} />
          <Star cx={176} cy={156} r={12} fill={accent} opacity="0.7" />
        </g>
      )
    case 'item-kite':
      return (
        <g className="robot__item">
          <path d="M171 176q22 -16 20 -40" stroke="#7b8bb0" strokeWidth="2" fill="none" />
          <polygon points="191,104 209,128 191,152 173,128" fill={color} />
          <polygon points="191,104 191,152 209,128" fill={accent} opacity="0.55" />
          <path d="M191 152q-6 10 4 16" stroke={accent} strokeWidth="2.5" fill="none" />
        </g>
      )
    default:
      return null
  }
}

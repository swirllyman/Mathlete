import type { Equipped, SlotId, WardrobeItem } from './types'

/**
 * Everything Bloop the robot can wear. Order matters: this is also the order
 * gifts come off the reward track, so the early items are the loudest ones.
 */
export const CATALOG: WardrobeItem[] = [
  // ---- Body colors -------------------------------------------------------
  { id: 'body-mint', slot: 'body', name: 'Mint Robot', color: '#6fe0c6', accent: '#2fae92', starter: true },
  { id: 'body-bubblegum', slot: 'body', name: 'Bubblegum Robot', color: '#ff9ecb', accent: '#e05fa0' },
  { id: 'body-sunshine', slot: 'body', name: 'Sunshine Robot', color: '#ffd166', accent: '#e0a42c' },
  { id: 'body-blueberry', slot: 'body', name: 'Blueberry Robot', color: '#8fb8ff', accent: '#4f7ddb' },
  { id: 'body-grape', slot: 'body', name: 'Grape Robot', color: '#c3a6ff', accent: '#8c66e0' },
  { id: 'body-tangerine', slot: 'body', name: 'Tangerine Robot', color: '#ffab73', accent: '#e07a3c' },
  { id: 'body-cherry', slot: 'body', name: 'Cherry Robot', color: '#ff8b8b', accent: '#dd4f4f' },
  { id: 'body-cloud', slot: 'body', name: 'Cloud Robot', color: '#e8eefc', accent: '#a9b8d6' },
  { id: 'body-lime', slot: 'body', name: 'Lime Robot', color: '#b6e86a', accent: '#78b02c' },
  { id: 'body-cocoa', slot: 'body', name: 'Cocoa Robot', color: '#d2a679', accent: '#9c6f43' },
  { id: 'body-rainbow', slot: 'body', name: 'Rainbow Robot', color: '#ff9ecb', accent: '#6fe0c6' },

  // ---- Faces -------------------------------------------------------------
  { id: 'face-happy', slot: 'face', name: 'Happy Face', color: '#2b2b44', starter: true },
  { id: 'face-stars', slot: 'face', name: 'Star Eyes', color: '#ffd166' },
  { id: 'face-hearts', slot: 'face', name: 'Heart Eyes', color: '#ff6b9d' },
  { id: 'face-sleepy', slot: 'face', name: 'Sleepy Eyes', color: '#7b8bb0' },
  { id: 'face-visor', slot: 'face', name: 'Cool Visor', color: '#4f7ddb', accent: '#9fd0ff' },
  { id: 'face-swirl', slot: 'face', name: 'Swirly Eyes', color: '#8c66e0' },
  { id: 'face-wink', slot: 'face', name: 'Winky Face', color: '#2b2b44' },
  { id: 'face-blush', slot: 'face', name: 'Blushy Face', color: '#ff8b8b' },
  { id: 'face-goggles', slot: 'face', name: 'Big Goggles', color: '#e0a42c', accent: '#fff3cf' },

  // ---- Hats --------------------------------------------------------------
  { id: 'hat-none', slot: 'hat', name: 'No Hat', color: '#cfd8ea', starter: true },
  { id: 'hat-party', slot: 'hat', name: 'Party Hat', color: '#ff6b9d', accent: '#ffd166' },
  { id: 'hat-crown', slot: 'hat', name: 'Golden Crown', color: '#ffd166', accent: '#ff8b8b' },
  { id: 'hat-beanie', slot: 'hat', name: 'Cozy Beanie', color: '#8fb8ff', accent: '#fff3cf' },
  { id: 'hat-propeller', slot: 'hat', name: 'Propeller Cap', color: '#ff8b8b', accent: '#6fe0c6' },
  { id: 'hat-chef', slot: 'hat', name: 'Chef Hat', color: '#ffffff', accent: '#e8eefc' },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard Hat', color: '#8c66e0', accent: '#ffd166' },
  { id: 'hat-flower', slot: 'hat', name: 'Flower Crown', color: '#ff9ecb', accent: '#b6e86a' },
  { id: 'hat-cowboy', slot: 'hat', name: 'Cowboy Hat', color: '#d2a679', accent: '#9c6f43' },
  { id: 'hat-space', slot: 'hat', name: 'Space Helmet', color: '#cfe6ff', accent: '#8fb8ff' },
  { id: 'hat-bow', slot: 'hat', name: 'Big Bow', color: '#ff6b9d', accent: '#ffb3d1' },
  { id: 'hat-cat', slot: 'hat', name: 'Kitty Ears', color: '#ffab73', accent: '#ff9ecb' },

  // ---- Held items --------------------------------------------------------
  { id: 'item-none', slot: 'item', name: 'Empty Hands', color: '#cfd8ea', starter: true },
  { id: 'item-balloon', slot: 'item', name: 'Red Balloon', color: '#ff6b6b', accent: '#ffffff' },
  { id: 'item-icecream', slot: 'item', name: 'Ice Cream', color: '#ff9ecb', accent: '#e0a42c' },
  { id: 'item-flower', slot: 'item', name: 'Sunflower', color: '#ffd166', accent: '#78b02c' },
  { id: 'item-wand', slot: 'item', name: 'Magic Wand', color: '#ffd166', accent: '#c3a6ff' },
  { id: 'item-book', slot: 'item', name: 'Story Book', color: '#8fb8ff', accent: '#fff3cf' },
  { id: 'item-duck', slot: 'item', name: 'Rubber Ducky', color: '#ffd166', accent: '#ffab73' },
  { id: 'item-guitar', slot: 'item', name: 'Little Guitar', color: '#d2a679', accent: '#9c6f43' },
  { id: 'item-star', slot: 'item', name: 'Shiny Star', color: '#ffe08a', accent: '#ffd166' },
  { id: 'item-kite', slot: 'item', name: 'Flying Kite', color: '#6fe0c6', accent: '#ff6b9d' },

  // ---- Scenes ------------------------------------------------------------
  { id: 'scene-meadow', slot: 'scene', name: 'Sunny Meadow', color: '#bdf0d4', accent: '#8fd9b0', starter: true },
  { id: 'scene-night', slot: 'scene', name: 'Starry Night', color: '#3a3f7a', accent: '#5a62ad' },
  { id: 'scene-beach', slot: 'scene', name: 'Sandy Beach', color: '#ffe6bf', accent: '#ffd08a' },
  { id: 'scene-space', slot: 'scene', name: 'Outer Space', color: '#2a2450', accent: '#453a80' },
  { id: 'scene-snow', slot: 'scene', name: 'Snowy Hill', color: '#e4f2ff', accent: '#c4dff5' },
  { id: 'scene-candy', slot: 'scene', name: 'Candy Land', color: '#ffd9ef', accent: '#ffb3d1' },
]

export const SLOT_ORDER: SlotId[] = ['body', 'face', 'hat', 'item', 'scene']

export const SLOT_LABEL: Record<SlotId, string> = {
  body: 'Colors',
  face: 'Faces',
  hat: 'Hats',
  item: 'Things',
  scene: 'Places',
}

export const SLOT_EMOJI: Record<SlotId, string> = {
  body: '🎨',
  face: '😊',
  hat: '🎩',
  item: '🎁',
  scene: '🏞️',
}

const BY_ID = new Map(CATALOG.map((item) => [item.id, item]))

export function getItem(id: string): WardrobeItem {
  const item = BY_ID.get(id)
  if (!item) throw new Error(`Unknown wardrobe item: ${id}`)
  return item
}

export const STARTER_IDS = CATALOG.filter((i) => i.starter).map((i) => i.id)

export const DEFAULT_EQUIPPED: Equipped = {
  body: 'body-mint',
  face: 'face-happy',
  hat: 'hat-none',
  item: 'item-none',
  scene: 'scene-meadow',
}

/**
 * The reward track, in the order gifts are handed out. Starter items are
 * already owned, so they never appear as a prize.
 */
export const REWARD_ORDER: string[] = CATALOG.filter((i) => !i.starter).map((i) => i.id)

/** Stars needed to open the nth gift box (0-based). */
export const STARS_PER_GIFT = 4

export function giftIndexFor(stars: number): number {
  return Math.floor(stars / STARS_PER_GIFT)
}

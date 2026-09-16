# Mathlete 🤖

A cozy, read-aloud math game for ages 3–6, built around **Bloop** — a robot you
dress up by solving problems.

Everything is spoken out loud, because most players can't read yet. Every
answer is a big tappable picture. Nothing punishes a wrong guess.

## Play it

**https://swirllyman.github.io/Mathlete/**

It is best on a tablet — open that link, add it to the home screen, and it runs
full-screen like an app. Progress is saved in the browser, so it lives on
whichever device it's played on.

To run it locally instead:

```bash
npm install
npm run dev
```

## Hosting

Every push to the repo's **default branch** builds the site and publishes it to
GitHub Pages via `.github/workflows/deploy.yml`. Pushes to any other branch
build nothing, and the workflow figures out which branch is the default on its
own — so renaming the default to `main` later needs no change here.

One-time setup, in the repo's **Settings → Pages**, set **Source** to
**GitHub Actions**. (The deploy step fails until that's switched over from the
default branch-based source.)

The build uses a relative `base`, so the same `dist/` works from a project
subpath like `/Mathlete/`, from a domain root, or opened straight off disk — no
rebuild needed if the site ever moves or gets a custom domain.

## What's in it

**Six worlds, five levels each, none of them locked.** Counting Cove → Adding
Meadow → Taking Away Woods → Number Dunes → Frosty Peak → Star Station.
Counting up to six, then addition and subtraction within ten, then sums up to
fourteen. They're listed easiest-first as guidance, but every one is playable
from the very first launch — a child who wants to poke at the rocket world is
never told no, and nobody gets stuck behind a level that's too hard. Finished
levels earn a star on the map and finished worlds a medal; stars gate the
wardrobe, never the maths.

**Everything is read aloud.** Questions, praise, prize names, world names,
menu labels. Tapping any speech bubble repeats it. Uses the browser's built-in
speech, so there's no API key, no network call, and no per-word cost.

**Answers are pictures, not typing.** Three or four huge bubbles, each showing a
numeral *and* that many little objects. The objects in the question are laid out
like a ten-frame — rows of five — so seven reads as "five and two" rather than a
blob.

**Nothing punishes a wrong tap.** A soft chime, a wobble, and encouragement. On
the second miss, Bloop counts the objects out loud one at a time, lighting each
one up as it's named. There's also a "Help me count" button any time.

**Play forever, at any level.** A switch on the map decides what tapping a
level does: five questions and a finish line, or endless play at that level's
difficulty with fresh random numbers each time. Endless pays out on the same
rhythm — a milestone every five right — so it's a real way to earn wardrobe
pieces, not a side mode.

**Hard Mode** on the last two levels of the last three worlds. The pile a child
would otherwise just tally is hidden under a lid showing only its numeral, so
addition becomes *counting on* from the visible pile and subtraction becomes
*counting back* from a hidden total. Answer bubbles drop their picture-counts
too, or counting the answers would be an easy way around the whole thing. It's
announced up front, badged on the map and on screen, and framed as brave rather
than scary — clearing one says "So brave!", missing one says Bloop is proud you
tried, and a **Peek** button lifts the lid any time, no penalty.

**Stars and a reward track.** One star per correct answer plus a bonus for
finishing a level. Every four stars pops a wrapped present. There are 43 prizes
across five slots — body colors, faces, hats, held items and backdrop scenes —
and each one goes straight onto Bloop when it's opened.

**A grown-ups menu** behind a multiplication gate: sound and voice toggles, a
voice picker with speed and pitch sliders, progress stats, and a reset.

## Built with

TypeScript, React and Vite — a single page, no router, no backend, no asset
files. Bloop and all 43 accessories are hand-drawn SVG; the backdrops are CSS
and SVG; the sound effects and the background music are synthesised at runtime
with the Web Audio API.

```
src/
  game/       types, wardrobe catalog, world & level definitions,
              problem generation, save/load, React context store
  audio/      speech.ts (Web Speech wrapper), sfx.ts (Web Audio)
  components/ Robot, Scene, and one file per screen
  styles.css  the whole look, sized in viewport units so it fits one screen
```

## A note on voices

Voice quality is whatever the device provides. macOS and iOS sound good out of
the box; some Android and Windows voices are flatter. The grown-ups menu lists
every English voice installed and previews the choice. If a device has no voices
at all, the game stays fully playable in silence — the guided count still walks
through the objects at a readable pace.

# Lunar — project notes

A one-page marketing site for a fictional incident-response / on-call SaaS.
No build step, no dependencies, no framework. Three files, open `index.html`.

```
lunar/
├── index.html    markup only
├── style.css     all styles
├── script.js     all behaviour
└── project.md    this file
```

---

## 1. The idea

**Product:** Lunar — on-call software that triages alerts automatically and only
pages a human when something genuinely needs one.

**The one-line pitch:** *"On-call that lets you actually sleep."*

**Why this category.** The brief was a cosmic poster: deep navy, starfield, a
glowing blue planet, and bubbly display lettering arcing over it. Most SaaS
categories would fight that. Incident response doesn't — the night-sky metaphor
*is* the product argument. "We watch while you sleep" is literal. The playful
bubble wordmark also cuts against a category that is normally all red alerts and
dashboards, which is what makes it feel distinctive rather than templated.

**Voice.** Plain, specific, slightly dry. Numbers over adjectives. Every claim is
concrete ("11s median ack", "1 page sent last night") rather than vague
("blazing fast", "best-in-class").

---

## 2. Design direction

### Reference
The whole visual identity derives from one image: a dark cosmic poster with
"AMOUR" in fat, hand-drawn bubble letters arcing over a glowing blue planet,
with a starfield behind and a four-point sparkle bottom-right.

### What was actually copied from it
- The **arc relationship** — letters ride a circle *concentric with the planet*,
  so the word wraps the sphere rather than floating above it.
- The **palette** — near-black ground, periwinkle lettering, deep navy sphere.
- The **crop** — the planet is cut off by the bottom of the frame, reading as a
  planet rising into view.
- The corner sparkle.

### Palette

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#02040f` | page background |
| `--surface` | `#04081a` | alternating section bands |
| `--surface-2` | `#070d22` | stat band, console |
| `--card` | `rgba(140,175,255,.045)` | card fills |
| `--periwinkle` | `#A9C7FF` | primary accent, buttons, eyebrows |
| `--text` | `#E8EEFF` | body text |
| `--muted` | `#93A4CC` | secondary text |
| `--dim` | `#6B7CA6` | labels, timestamps |
| `--line` | `rgba(169,199,255,.13)` | borders |
| `--green` | `#5DE2A0` | "resolved / good" state |
| `--amber` | `#F5C46B` | "genuinely on fire" state |

Wordmark fill is `#86AEE2` (slightly cooler than `--periwinkle`, set per the
final spec).

### Type
- **Bagel Fat One** — display only, the `LUNAR` wordmark. Fat bubble letterforms.
- **Inter** (400/500/600) — all UI and body copy.
- **JetBrains Mono** (400/500) — timestamps, code chips, runbook snippet, hour labels.

Weights `550` and `650` appear in the CSS and snap to the nearest loaded weight.
Harmless, but if you ever want them exact, add those weights to the font URL.

### Layout rules
- Container max-width `1200px`, padding `28px` (`20px` on mobile).
- Section padding `clamp(76px, 9vw, 132px)`.
- **All six section headers are centred.** This was inconsistent at one point
  (four centred, two left) and read as broken alignment. Keep them uniform.

---

## 3. The hero orb — the hard part

This took the most iteration. Read this before changing anything in the hero.

### Geometry is driven by two custom properties

```css
.hero{
  --orb: min(62vw, 100svh, 1150px);
  --crop: .62;
}
.planet-wrap, .orbit{
  width: var(--orb);
  top: calc(100% - var(--crop) * var(--orb));
  aspect-ratio: 1;
}
```

**Why both elements share `--orb`:** the wordmark wraps a circle concentric with
the planet. If the two are sized independently they drift apart and the wrap
breaks. One variable drives both, so they are concentric *by construction*.

**Why `top` and not `bottom`:** `top: calc(100% - crop * orb)` pins the rim at a
fixed fraction of the viewport at any size. A bottom offset drifts as soon as the
width cap engages — this caused a real bug where the width and the crop were
computed from different values.

**Why the height caps:** the word scales with the orb. An unbounded orb pushes
its own arc off the top of the frame. `100svh` is what keeps the lettering on
screen; it is not cosmetic.

### The wordmark arc

```html
<path id="arc" d="M -11.9 362.8 A 530 530 0 0 1 1011.9 362.8"/>
```

A 150° arc of radius 530 in a 1000-unit box, concentric at (500,500) — so
`r = 1.06 × planet radius`, letters sitting just outside the sphere. Text is
`font-size: 268px` with `text-anchor: middle` and `startOffset: 50%`.

**Hand-drawn wobble.** Bagel Fat One is clean and geometric; the reference is
irregular. Rather than tracing custom paths, a filter warps the glyph outlines:

```svg
<filter id="wobble">
  <feTurbulence baseFrequency="0.0034" numOctaves="3" seed="5"/>
  <feDisplacementMap scale="17" xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

That produces the uneven stroke weight the font doesn't have.

### The sphere

Final version copied verbatim from a build the client approved:

```css
background: radial-gradient(circle at 50% 12%,
  #284ca7 0%, #193278 22%, #0f1f50 45%, #070d24 70%, #03050e 95%);
```

Plus three box-shadows (two inset rim glows, one outer atmosphere glow), a
`.planet-texture` layer (white radial through an `feTurbulence` noise filter at
`opacity .35`, `mix-blend-mode: overlay`) and a `.planet-shadow` linear ramp to
`#020308`.

**The gradient is centred at `50% 12%`, not the circle's centre.** That
off-centre light point is what makes it read as lit-from-above: the top has a
short distance to travel while the bottom has far more, so the bottom falls dark
naturally. A centred gradient reads as an evenly lit ball.

**The crop and the gradient are coupled.** The approved build showed ~61.5% of
the sphere. Ours shows 62%. If you change `--crop` significantly, the stops land
somewhere else and the orb will look wrong — the near-black stops can end up
below the crop line where they never render.

### Dead ends worth not repeating

- **A purely vertical (linear) gradient reads as a flat disc**, not a sphere —
  horizontal bands mean the left and right edges stay as bright as the centre.
- **Mapping vertical stops to radial distance** over-corrects: the sides hit black
  at the same height the centre is still blue, because a point at the limb is much
  further from the top pole than one directly below it.
- **A radial gradient anchored at the top cannot draw a rim light.** It makes a
  blob at the top-centre. A rim that follows the curve has to be a ring (an
  annulus), masked to fade down the sides.
- **Stacking vertical darkening in two layers** crushes the blues twice; if the
  body gradient handles the vertical fall, the overlay must only do limb darkening.
- **A stale gradient left in the background stack** caused a hotspot that survived
  hiding every other layer. If something looks wrong and nothing explains it,
  print `getComputedStyle(el).backgroundImage` and count the layers.

---

## 4. Page structure

| # | Section | Purpose |
|---|---|---|
| 1 | Hero | Wordmark, orb, one line, one button |
| 2 | Logo strip | Social proof |
| 3 | The 3am problem | 68 / 23 / 9 stacked bar — the core argument |
| 4 | How it works | Three steps + live incident console |
| 5 | Features | Bento grid, 6 cards |
| 6 | Stats | 94% / 11s / 4.2h / 99.99% |
| 7 | Integrations | Orbital map |
| 8 | Testimonial | Single quote |
| 9 | Pricing | Free / Team $18 / Enterprise |
| 10 | FAQ | 5 native `<details>` accordions |
| 11 | Final CTA | "Last night" readout + buttons |
| 12 | Footer | Five columns |

### Sections that carry weight

**The 3am problem** is the argument the page rests on: 68% duplicates, 23%
self-resolving, 9% genuinely on fire. Everything after it is evidence.

**The incident console** proves the claim instead of restating it — a real
timeline from 47 alerts at 02:14:07 through to recovery at 02:14:38 with nobody
woken. Rows stagger in like a live feed.

**The features bento** is deliberately asymmetric (one `span 2`, four standard,
one `span 3`). Six identical tiles looked templated. The two large cards carry
actual content — a runbook snippet and a postmortem preview — not just more text.

**The integrations orbit** replaced a 12-tile grid, which was the most generic
thing on the page. Inner ring = alert sources, outer ring = destinations, with
the two rings counter-rotating.

**The final CTA** opens with an hour-by-hour bar chart of a normal night
(22:00–07:00), eight periwinkle bars and one amber spike at 02:00. It proves the
value once more before asking.

---

## 5. Motion

Everything is gated behind `prefers-reduced-motion: reduce`.

| Effect | How |
|---|---|
| Hero parallax | Planet, wordmark and copy at three rates (0.20 / 0.06 / 0.30) + fade |
| Mouse parallax | Planet 8px, word 15px, eased 0.06/frame |
| Scroll reveals | `IntersectionObserver`, stagger via `--i` |
| Stat count-up | Fires when `.stats` enters view, cubic-eased |
| Breakdown bar | `flex-grow` 0 → 68/23/9 |
| Console feed | Rows stagger 170ms via `--r` |
| CTA night bars | `scaleY` 0 → 1, stagger 70ms via `--h` |
| Orbit rings | 90s and 140s counter-rotation |
| Cursor glow | Radial highlight tracking `--mx`/`--my` on cards |

### Entrance split
The entrance animation lives on inner wrappers (`.planet-rise`, `.orbit-rise`)
while scroll parallax owns the outer element's `transform`. Both on one element
and they overwrite each other.

### Font gate
The hero entrance waits on **the display face only**:

```js
document.fonts.load('1em "Bagel Fat One"').then(load, load);
setTimeout(load, 600);
```

`document.fonts.ready` waits for all six font files, which left the hero blank
for up to 1.5s. Only the display face changes the arc's metrics.

---

## 6. Performance

There are **no images** — the entire page is CSS and inline SVG. One external
request (Google Fonts). Nothing to compress.

Measured: HTML 29KB, CSS 31KB, JS 8KB, fonts 13KB. DOMContentLoaded ~790ms,
load ~1.07s on localhost.

### The three fixes that mattered

**1. Layout thrash in the animation loop.** `motion()` called
`hero.offsetHeight` *and* `finalSec.getBoundingClientRect()` every frame. Both
force synchronous layout, so the browser recalculated the whole page 60×/second
to read two numbers that only change on resize. Now cached in `remeasure()`,
refreshed on resize and after fonts load. **Do not reintroduce a layout read
inside `motion()`.**

**2. Offscreen starfields.** Both canvases drew forever. Each now skips its draw
when its canvas isn't intersecting.

**3. The font gate** (above).

### Known ceilings
- `feTurbulence` and `feDisplacementMap` are not cheap. They're static and
  rasterised once, so they cost at load, not per frame. If the hero ever feels
  heavy on low-end mobile, the wobble filter is the first thing to drop.
- Weights `550`/`650` synthesise. Add them to the font URL if it ever shows.

---

## 7. Responsive

Breakpoints: `1000px`, `900px`, `680px`, plus `max-height: 760px`.

**The short-viewport rule matters.** The word's apex scales with the orb but the
nav doesn't, so short windows need a smaller orb or the letters hit the nav. It
must go through `--orb`, never `width` directly — setting `width` alone leaves
the crop computed from a different value.

**Portrait decouples deliberately.** A 62vw orb cropped to 57% leaves a phone
screen mostly empty, so mobile uses `--orb: min(132vw, 104svh)`, `--crop: .99`
and 158px lettering. The word runs at ~91% of screen width there — close to the
edge, so don't increase mobile type without shrinking the mobile orb.

Below 680px the orbit map collapses to a centred chip list (rings and core
hidden) and the bento drops to one column.

---

## 8. Gotchas

- **Cascade order bit us once.** A later `.step,.feat,.plan,.intg{position:relative}`
  rule silently overrode the orbit chips' `position:absolute`. Horizontal
  placement still looked plausible while vertical was wrong. If positioned
  elements misbehave, check the computed value, not the rule you wrote.
- **Absolutely positioned flex children don't always shrink-to-fit** — the orbit
  chips rendered at the full map width until given `width: max-content`.
- **Percentage heights need a definite parent.** The CTA bars collapsed to zero
  until `.hour` got an explicit height. They use pixel heights now.
- **Orbit ring angles must interleave.** Inner and outer chips at the same angle
  collide. Current layout is 6+6 with the outer ring offset 30°.
- **`getBoundingClientRect()` on SVG text returns the layout box**, which includes
  a large empty ascender band — it reports the word overlapping the nav while the
  visible glyphs are ~80px clear. To measure real ink, render the font to a canvas
  and scan pixel rows. Measured cap height for Bagel Fat One: **0.730 of font-size**.

---

## 9. Before this goes live

- **Every number and company name is invented** — the 4.1M alerts, 94%, Kestrel,
  Priya Raman, the logo strip. The footer discloses it's a fictional demo brand.
  Replace them or keep the disclosure.
- All CTAs are `href="#"`.
- No analytics, no cookie banner, no form handling.
- No favicon or OG image.
- Add `<html lang>`-appropriate copy if localising; the arc wordmark is
  hard-coded to five letters and would need new geometry for a different word.

## 10. Running it

Static files — any server works.

```bash
npx http-server lunar -c-1
```

Configured in `.claude/launch.json` as `lunar` with `autoPort: true`.

# Lunar

Live: https://mowais2004.github.io/Lunar/

https://github.com/user-attachments/assets/0930c136-32b0-4a84-9ce7-a4c79bf0945b


**On-call that lets you actually sleep.**

A one-page landing site for a fictional on-call tool. Plain HTML, CSS and JS: no framework, no build step, no dependencies, no images.

![Lunar hero](preview.jpg)

## What's inside

- **The planet hero.** A CSS sphere lit from above, with the `LUNAR` wordmark riding an SVG arc that shares the planet's center, so the word always wraps the sphere. An SVG turbulence filter gives the letters a hand-drawn wobble.
- **The 3am problem.** A stacked bar that grows to 68 / 23 / 9: duplicates, self-resolving alerts, and the ones genuinely on fire.
- **A live incident console.** Log rows stagger in, from 47 alerts at 02:14:07 to recovery at 02:14:38, with nobody woken.
- **A features grid.** Six cards in an uneven layout, with a cursor glow that follows the pointer.
- **Stats that count up** when they scroll into view.
- **An integrations orbit.** Alert sources on the inner ring and destinations on the outer ring, rotating in opposite directions.
- **The final CTA.** A night of alerts drawn as bars from 22:00 to 07:00, with one amber spike at 02:00, over a rising moon.

All motion respects `prefers-reduced-motion`.

## Built with

- Plain HTML, CSS and JS. The visuals are all CSS gradients and inline SVG.
- Fonts: Bagel Fat One, Inter and JetBrains Mono (Google Fonts, the only external request)
- Size: HTML 29 KB, CSS 31 KB, JS 8 KB

```
index.html    markup
style.css     styles
script.js     behaviour
project.md    design notes: the hero geometry, dead ends, gotchas
```

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx http-server . -c-1
```

## Notes

Lunar is a fictional brand built as a design demo. Every company name, person and number on the page is made up, and the footer says so. All CTAs link to `#`.

See [project.md](project.md) for the full design and build notes.

---

Free for everyone. Made by [MOwais2004](https://github.com/MOwais2004).

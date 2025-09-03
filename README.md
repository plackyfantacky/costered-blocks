# Costered Blocks

> *"Because not every block needs to be blessed by the cult of Gutenberg."*

**Costered Blocks** is a plugin for developers who've spent too many hours arguing with the block editor and `theme.json`, only to give up and go back to styling things with `functions.php`, `style.css`, a blood pressure monitor, and a crowbar.

It adds a set of layout and styling controls to the block editor — powered by pure attribute storage — that actually work in both **traditional WordPress themes** and **headless frontends** (GraphQL/REST).  

> You get back control. Gutenberg gets a politely worded warning.

## About The Name
Coster had a beef with Gutenberg, and I have a beef with the Block Editor. History repeats.

Named after **Laurens Coster**, an obscure Dutch guy who invented movable type before Gutenberg (_maybe_, allegedly), this plugin is for everyone who's ever said "Sure, I'll update the client's website, just let me get my hazmat suit".

This plugin is a toolbox for devs who want blocks to just BEHAVE THEMSELVES and look like the thing we want, not some fancy-pants paradigm cooked up in a UX committee meeting.

## What This Plugin Is Not
- A page builder or design system.
- Another block library full of "stylish buttons" and 18 variations of a call-to-action.  
- Friendly to `theme.json` purists.
- A scam-plugin that gives users barely any control, just so it can push users to a PRO version.

## What It *Is*
- A simple sidebar that lets you brute-force styles directly into block attributes, where they belong.
- A developer-focused middle finger to some of Gutenberg's irritating decisions.
- Made of equal parts React, caffeine, regret, and spite (with just enough PHP to keep WordPress from throwing a tantrum).

## Developer-Centric/Sane by Design 
This plugin assumes:

- You can write or modify your own themes (and want to keep it that way).
- You've cursed at `theme.json` at least once.
- You don't want to spend 40 minutes disabling core styles just to make a div act like a div.
- It has been `x` number of days since someone asked you to "make the logo bigger", and you either cringe or look at them with a 1000 yard stare.

If that sounds like you, congrats. You've been *Costered*.

## Features

### All Blocks
- **Padding and Margin controls:** now with units you actually use! Yes! that includes `px`, `em`, `%` and even `var()` and `calc()`.
- **Display and visibility options:** use `block`, `inline`, `flex`, `grid`, and variants - because layout should be more than vibes.
- **Width/Height fields (including min/max variants):** adjust the dimensions of ANY BLOCK (_well... ones that aren't inline_) Finally a `<div>` can be a normal element - not some mystical entity we're not allowed to touch.

### Flexbox & Grid
- **Flexbox:** direction, wrap, gap, and alignment — because `display: flex` shouldn’t mean “good luck, you’re on your own.”  
- **Flexbox Items:** grow, shrink, basis, `align-self`, `justify-self`, and `order` — finally tell your block children to sit still and behave.  
- **Grid:** columns, rows, gaps, and template areas (Simple/Advanced modes) — tracks and areas, not guesswork and grief.

### Changes To Core Blocks
- **core/group:** Removed the option to switch between 'Row' and 'Stack' variants - because it’s a `<div>` cosplaying as a flex container, and it needs to calm down.
- **core/button:** Added support for InnerBlocks — now you can finally add an icon to a button without invoking four plugins and a Gutenberg ritual. How novel.
- **core/cover:** Removed the Alignment toolbar button — because covers aren't images, and floating a layout container left in 2025 should be a crime.

### Misc
- **Per-user Preferences:** editing modes are remembered per block type — so you don’t have to tick the same bloody toggle every time.  
- **Headless-Friendly:** all styles are stored in block attributes, queryable via WPGraphQL or REST — your frontend gets data, and you get your time back.

## How This Thing Works
Abuses WordPress’s beloved block API against itself by storing everything as block attributes and `style` properties. 
Yes...inline styles, I know. Don't shoot me — it actually works. That's the point. I might come up with a cleaner solution later...or I might not.

## Documentation & Guides
- [Wiki](https://github.com/plackyfantacky/costered-blocks/wiki):
- [Getting Started](https://github.com/plackyfantacky/costered-blocks/wiki/Getting-Started)  
- [Roadmap](https://github.com/plackyfantacky/costered-blocks/wiki/Roadmap)  
- [Developers & Contributors](https://github.com/plackyfantacky/costered-blocks/wiki/Developing-and-Contributing)

## Future Plans
- Continue removing or reworking confusing block options that make life harder for devs *and* content editors.
- See the actual roadmap in the [wiki](https://github.com/plackyfantacky/costered-blocks/wiki/Roadmap)
- _Maybe: write a rant about `theme.json` and include it as a feature._

## License
Dual-licensed under **MIT** and **GPL-2.0-or-later**. You may choose either license.
See [`LICENSE`](./LICENSE) (MIT) and [`LICENSE-GPL`](./LICENSE-GPL) (GPL-2.0)

> Because you should be free to do whatever you like, just like Gutenberg (the guy) was before WordPress got involved.

## Acknowledgements
Interface icons are SVG files found at [Iconify](https://iconify.design/). Sets used include:
- Radix Icons (license: MIT)
- Lucide (license: ISC)
- Material Design Icons (license: Apache 2.0)
- Material Symbols (license: Apache 2.0)
- Iconoir (license: MIT)
- _If I’ve missed a license attribution, please open an issue or PR._
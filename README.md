# Costered Blocks

> *"Because not every block needs to be blessed by the cult of Gutenberg."*

**Costered Blocks** is a plugin for developers who've spent too many hours arguing with the block editor, only to end up styling things in `theme.json`, `functions.php`, `editor-styles.css`, a blood pressure monitor, and `style.css`.

Named after **Laurens Coster**, an obscure Dutch guy who maybe invented movable type *before* Gutenberg (*allegedly*), this plugin is for everyone who's ever thought "The Block Editor is fine, I guess... if you *hate* fun".

This plugin is a toolbox for devs who want blocks that behave like normal code, not something cooked up in a UX committee meeting.

## What This Plugin Is Not
- A page builder.  
- A design system.
- Another block library full of "stylish buttons" and 18 variations of a call-to-action.  
- Friendly to `theme.json` purists.
- Made of equal parts React, caffiene, and spite.

## What It *Is*
- A small collection of deliberate, developer-focused middle fingers to some of Gutenberg's irritating decisions.


## Developer-Centric/Sane by Design 
This plugin assumes:

- You write your own themes (and want to keep it that way).
- You've cursed at `@wordpress/scripts` at least once.
- You don't want to spend 40 minutes disabling core styles just to make a div act like a div.

If that sounds like you, congrats. You've been *Costered*.

## Features

### `core/group`
- Removes/hides the `Inner blocks use content width` panel because nobody knows what it means and even fewer people want it there.
- Adds padding and margin controls with units you actually use (yes, that includes `px`, `em`, `%` and even `var` and `calc`).
- Adds custom row and column gap controls - because layout should be more than vibes.
- Adds width and height controls like it's a normal container and not a mystical entity.

### `core/cover`
- Removes the Alignment toolbar button — because covers aren't images, and floating them left or right is a crime against layout.

## How This Thing Works
Abuses WordPress's own beloved block API against itself by storing everything in block attributes and `style` properties.  
Yes, inline styles. Yes, I know. Don't shoot me — it actually works. That's the point.

## Future Plans
- Fix `core/button`, because clearly every button on the internet falls into one of two styles and fits neatly into four width presets. Thanks, WordPress.
- Continue removing or reworking confusing block options that make life harder for devs *and* content editors.
- Add more sensible layout controls to blocks that pretend they don't need them.
- Possibly: write a rant about `theme.json` and include it as a feature.

## Status
This is an active work in progress. Nothing is sacred. Everything is up for override.  
File issues, submit PRs, or just fork it and rename it **Fust & Furious** — you won't hurt my feelings.

## Licence
MIT. Because you should be free to do whatever you like, just like Gutenberg was... before Gutenberg.

## Acknowledgements
Interface icons are SVG files found at [Iconify](https://iconify.design/). Set used:
- Radix Icons (radix-icons:dimensions / license: MIT)
- Lucide (lucide:box / license: ISC)
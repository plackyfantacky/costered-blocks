# Costered Blocks

> *"Because not every block needs to be blessed by the cult of Gutenberg."*

**Costered Blocks** is a plugin for developers who've spent too many hours arguing with the block editor and `theme.json`, only to give up and go back to styling things with `functions.php`, `style.css`, a blood pressure monitor, and a crowbar.

## About The Name
Coster had a beef with Gutenberg, and I have a beef with the Block Editor. History repeats.

Named after **Laurens Coster**, an obscure Dutch guy who maybe invented movable type before Gutenberg (allegedly), this plugin is for everyone who's ever said "Sure, I'll update the client's website, just let me get my hazmat suit".

This plugin is a toolbox for devs who want blocks to just BEHAVE THEMSELVES and look like the thing we want, not some fancy-pants paradigm cooked up in a UX committee meeting.

## What This Plugin Is Not
- A page builder or design system.
- Another block library full of "stylish buttons" and 18 variations of a call-to-action.  
- Friendly to `theme.json` purists.

## What It *Is*
- A simple sidebar that lets you brute force CSS styles without needing to add code in some obscure admin screen that is almost impossible to find.
- A developer-focused middle finger to some of Gutenberg's irritating decisions.
- Made of equal parts React, caffeine, and spite. Some PHP was also used so be forewarned. 

## Developer-Centric/Sane by Design 
This plugin assumes:

- You can write or modify your own themes (and want to keep it that way).
- You've cursed at `theme.json` at least once.
- You don't want to spend 40 minutes disabling core styles just to make a div act like a div.

If that sounds like you, congrats. You've been *Costered*.

## Features

### All Blocks
- Adds padding and margin controls with units you actually use (yes, that includes `px`, `em`, `%` and even `var` and `calc`).
- Adds display and visiblity controls - because layout should be more than vibes.
- Adds width and height controls like it's a normal container and not a mystical entity.

### `core/button`
- Adds support for InnerBlocks which means we can finally make icon buttons without bloatware!

### `core/cover`
- Removes the Alignment toolbar button — because covers aren't images, and floating them left or right is a crime against layout.

## How This Thing Works
Abuses WordPress's own beloved block API against itself by storing everything as block attributes and `style` properties.  
Yes...inline styles, I know. Don't shoot me — it actually works. That's the point. I'll come up with a cleaner solution later...or maybe I won't.

## Future Plans
- Continue removing or reworking confusing block options that make life harder for devs *and* content editors.
- Maybe: write a rant about `theme.json` and include it as a feature.

## License
Except for items mentioned below, this plugin is licensed as MIT. Because you should be free to do whatever you like, just like Gutenberg (the guy) was before WordPress was even a thing.

## Acknowledgements
Interface icons are SVG files found at [Iconify](https://iconify.design/). Sets used include:
- Radix Icons (license: MIT)
- Lucide (license: ISC)
- Material Design Icons (license: Apache 2.0)
- Material Symbols (license: Apache 2.0)
- Iconoir (license: MIT)
# Changelog

## What's Changed in 1.3.1

- feat: add InlineSVG block

## What's Changed in 1.3.0

This release focuses on stability, responsive design, and a more usable Grid experience. It also completes a big internal refactor that makes the plugin safer and faster.

### For editors & designers

#### What's new
- **Responsive controls**: Set different styles for Desktop, Tablet, and Mobile. Switch device in the editor and you'll see the correct styles reflected.
- **Grid made simpler**: Two ways to place items:
  - *Simple*: pick where an item starts, and how many columns/rows it spans.
  - *Tracks*: fine control with start/end (supports named lines for advanced layouts).
- **Per-block style preview**: The editor now mirrors the selected breakpoint's styles more accurately—what you see is much closer to what visitors see.
- **Unsaved change indicator**: Grid panels show a small indicator when you've changed something and not saved yet (this will be rolled out everywhere in a future update).

#### Why it's better
- **Cleaner output**: Frontend CSS is printed once instead of inline styles scattered around, which helps performance and avoids “why does this look different here?” moments.

#### How to use the new bits
1) In the editor sidebar, choose Desktop / Tablet / Mobile.
2) Adjust your block’s styles (spacing, grid placement, alignment).
Those changes apply only to the active device unless you’ve set nothing yet (in which case it falls back from Desktop → Tablet → Mobile).
3) For Grid:
   - Use *Simple* for quick start/span.
   - Use *Tracks* when you need precision (named lines, explicit start/end).

#### Known limitation
- **Shrinking Grid Template Areas**: When reducing columns/rows from a parsed template, the grid can mis-shrink (e.g. 9×3 -> 9×1). This is being fixed in a follow-up.

### For developers

See [CHANGELOG-DEV.md](CHANGELOG-DEV.md) for API changes and technical notes.

## What's Changed in 1.1.1

#### Changes in 1.1.1

No new features, no bug fixes — just a licensing and contributor policy update to make this project more usable for more people. Costered Blocks is now dual-licensed under MIT and GPL-2.0-or-later. You can use either license as needed.

Why? Because some developers want permissive reuse, some want GPL continuity, and most of us just want tools that work without license anxiety.

- docs: re-licensed under dual MIT and GPL-2.0-or-later. add RELICENSE.md

#### Changes in 1.1.0

- feat: add Grid Controls panel to allow fine control over grid columns, rows, and gaps
- feat: add gap control to FlexBox Controls panel
- refactor!: migrate all 'mode' type attributes to use a new user preference store
- refactor: import attribute list from config into editor-style-mirror, avoids redundant attribute definitions
- refactor: rewrite entire icon handling system to reduce work needed when adding more icons
- refactor: separate hooks into individual files
- refactor: clean up file paths for hooks and filter for simpler file structure

*BREAKING CHANGE*: a lot of UI controls have alternate modes allowing more control over what
values are saved. previously these were stored as attributes such as "marginMode". These
are removed in favour of per-user preference store which is saved in the database and local
storage. This reduces attribute pollution.


## What's Changed in 1.1.0
- feat: add Grid Controls panel to allow fine control over grid columns, rows, and gap
- feat: add gap control to Flexbox Controls panel
- refactor!: migrate all 'mode' type attributes to use a new user preference store
- refactor: import attribute list from config into editor-style-mirror, avoids redundant
attribute definitions
- refactor: rewrite entire icon handling system to reduce work needed when adding more icons
- refactor: separate hooks into individual files
- refactor: clean up file paths for hooks and filter for simpler file structure

BREAKING CHANGE: a lot of UI controls have alternate modes allowing more control over what
values are saved. previously these were stored as attributes such as "marginMode". These
are removed in favour of per-user preference store which is saved in the database and local
storage. This reduces attribute pollution.

## What's Changed in 1.0.0a
- feat!: Add a plugin sidebar and registry system for managing sidebar panels.
- feat: add new tab panels for separating controls into categories "display-controls",
"dimensions", and "spacing"
tab and enable for all blocks
- feat: add new min/max variants of width/height to "dimensions" tab
- feat: add new controls for display and visibility to "display-controls"
- feat: add info panel with name of currently selected block
- refactor: update margin/padding controls with new UI and move from core/block to 
- refactor: update and move width/height controls from core/group block to "dimensions" 
"spacing" tab
- refactor: width/height, margin, and padding controls will now use the new global
attribute schema
- chore: remove previous block specific UI

BREAKING CHANGE: previous methods of storing style attributes for certain blocks
are removed in favour of a registry/schema of allowed attrbiutes that can apply
to ANY block. Some existing styles may be lost due to this change.

## What's Changed in 0.1.4-hotfix
- fix: colour classes not apply to core/button
- chore: cleaned up changelog

## What's Changed in 0.1.4
- feat: Add innerblocks support to core/button block
- feat: added button-text block for custom button text
- feat: added URL input support for core/button block
- update changelog

## What's Changed in 0.1.3
- fix: add 'none' containerType to core/group block
- chore: update changelog
  
## What's Changed in 0.1.2
- refactor: renamed `hide-inner-blocks-use-content-width.js` to
`hide-core-ui-elements.js` to add more general functionality
- refactor: changed TextControls to UnitControls so we can have things
like `px`, `%`, `em`, etc. in the controls.
- chore: cleaned up some leftover log outputs
- feat: margins can now be strings eg. auto calc()
- chore: update changelog
  
## What's Changed in 0.1.1
- fix: added server-side rendering for the core/group block because I forgot
most people don't run headless WordPress and need to see their changes
on the frontend.
- chore: generated a set of minified JS files for the block editor. This means
you can now use the plugin without needing to run a build step.
- refactor: refactored the build script to handle input/outputs a little better.
- feat: added CSS input/output for the one stylesheet this plugin uses.
- chore: updated CHANGELOG.md


## What's Changed in 0.1.0
- initial commit
  
<!-- generated by custom git log script -->
# Changelog

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
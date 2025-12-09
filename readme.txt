=== Costered Blocks ===
Contributors: ariom
Tags: blocks, css, grid, flexbox
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 8.0
Stable tag: 1.3.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Lets developers manage block styles as raw CSS-like data, including flexbox, grid and responsive controls inside the block editor.

== Description ==

Costered Blocks adds developer-friendly layout and styling controls to the block editor. It exposes raw styling data (flexbox, grid and more) instead of hiding it behind presets, so we can keep using Gutenberg without giving up control over our CSS.

== Installation ==

1. Upload the `costered-blocks` folder to the `/wp-content/plugins/` directory, or install via the Plugins → Add New screen.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Open the block editor and look for the Costered Blocks controls in the sidebar.

== Frequently Asked Questions ==

= Does this work with any theme? =
Costered Blocks is theme-agnostic and should work with both classic and block themes. It generates its own CSS based on the controls we set.

= Will this break my existing styles? =
The plugin writes its styles to a separate stylesheet and scopes them using data attributes, so it should not interfere with existing theme CSS.

== Screenshots ==

1. Block sidebar showing Costered layout controls.
2. Example grid layout built with Costered Blocks.

== Changelog ==

= 1.3.4 =
* Adjusted database and uninstall routines to satisfy WordPress.org Plugin Check.
* Improved inline SVG sanitisation and style regeneration tools.

= 1.3.3 =
* Inline SVG block changes: SVG code can now be edited directly in the block, safely.

== Upgrade Notice ==

= 1.3.4 =
Internal changes for Plugin Directory review. Update recommended if you plan to install from WordPress.org in future.

# Copilot Instructions for this repo

Purpose: Help AI coding agents work effectively in this WordPress plugin. Keep responses concrete and follow the project’s patterns.

## High-level architecture
- WordPress plugin that augments Gutenberg editor via a custom Plugin Sidebar. Frontend styles are applied by injecting inline styles on render.
- Sources live in `src/**` (React/JSX, small utilities, CSS). Built assets are written to `js/**` and `css/**` via an esbuild script in `node/dev.config.mjs`.
- PHP integrates with WordPress:
  - `costered-blocks.php` registers editor scripts and loads `php/render-blocks.php`.
  - `php/render-blocks.php` adds two filters:
    - `render_block`: maps allowed block attributes to CSS properties and appends them as inline styles on the first HTML tag in block output.
    - `block_type_metadata_settings`: disables core layout supports for selected core blocks.
- Editor UI:
  - `src/editor/plugin-sidebar.js` registers the sidebar and composes tabs from `src/editor/tabs/**`.
  - Controls rely on hooks/utilities in `src/hooks/**` and `src/utils/**` and icons from `src/assets/icons/**`.
  - Path aliases are used: `@components`, `@assets`, `@hooks`, `@filters`, `@config`, and tab alias `@tabs` in import paths.

## Build & dev workflow
- Node 18+ expected. Commands:
  - `npm run dev` — single build (development mode, no watch).
  - `npm run watch` — builds and watches `src/**` JS/CSS into `js/**` and `css/**`.
  - `npm run build` — production build, minified.
  - `npm run svgr:convert` — convert SVGs in `src/assets/icons/raw` into React components in `src/assets/icons/`, regenerate `src/assets/icons/index.js`.
- The WordPress admin enqueues bundles from `js/**` and `css/**` defined in `costered-blocks.php`. Keep bundle names stable when adding new entry points.

## Conventions & patterns
- Attribute-first styling: Editor controls set attributes on blocks; server-side `render_block` maps a curated allowlist to CSS style properties. If you add a new attribute that should affect output, update the `$allowed` map in `php/render-blocks.php`.
- Prefer storing values as raw CSS tokens (supports `px`, `em`, `%`, `var()`, `calc()`, etc.). Many controls accept freeform strings when a "custom" toggle is on.
- UI composition:
  - New sidebar sections live under `src/editor/tabs/` and export an object `{ name, title, icon, Component }` or default export compatible with `SidebarTabs`.
  - Shared controls live under `src/components/**`; composite controls include `GapControls`, `GridColumnsEditModeControl`, `GridRowsEditModeControl`, `TokenGridControl`.
  - Hooks like `useSelectedBlockInfo`, `useAttrSetter`, `useGridTemplateValue`, `useUIPreferences` encapsulate block/editor glue — reuse them instead of re-querying `wp.data` directly.
- Icons: import from `@assets/icons`. When adding new icons, drop SVGs into `src/assets/icons/raw` and run `npm run svgr:convert`.
- Imports use aliases configured in `node/dev.config.mjs` via `esbuild-plugin-path-alias`. Keep paths consistent with `@alias/...`.

## Adding/Changing features
- New attribute affecting output:
  1) Implement editor control (tab/component) that updates the block’s attributes via `useAttrSetter`.
  2) Ensure attribute key is reflected in server output by adding it to `$allowed` in `php/render-blocks.php` with the correct CSS property name.
  3) Build assets and verify styles apply in editor and on front-end render.
- Extending grid/flex controls: follow existing patterns in `src/editor/tabs/FlexBoxControls.jsx`, `FlexItemControls.jsx`, and `GridControls.jsx`. Use `GapControls` for gap fields to support unit modes and custom values.
- Adjusting core block behavior: see `php/render-blocks.php` (layout supports) and customized JS under `src/blocks/**` and `src/filters/**`.

## Integration points
- WordPress packages are treated as globals in the bundles (e.g., `@wordpress/data` → `wp.data`). See the externals/global map in `node/dev.config.mjs`. Do not bundle React or WP packages.
- Editor registration happens via `wp.plugins.registerPlugin` in `src/editor/plugin-sidebar.js`. Sidebar name is `costered-blocks-sidebar`.
- PHP constants `COSTERED_BLOCKS_URL` and `COSTERED_BLOCKS_PATH` are used for paths/URLs if needed.

## Testing & debugging tips
- Verify attribute writes with the block inspector’s "Code editor" view; attributes should serialize into the block’s JSON.
- Frontend check: confirm inline styles appear in the first tag of rendered block HTML.
- If an attribute seems ignored on frontend, ensure it’s present in `$allowed` and that the value is non-empty.
- Watch build logs from `node/dev.config.mjs` for missing alias or global mapping errors; missing WP globals will cause runtime errors in the editor.

## Examples
- Grid columns simple mode: `GridControls.jsx` uses `useGridTemplateValue` to derive `repeat(n, 1fr)` from integers; advanced mode accepts raw CSS like `100px 1fr 2fr`.
- Gap values: `GapControls` supports unit toggles and raw tokens; attributes map to `grid-column-gap`/`grid-row-gap`.
- Core overrides: `php/render-blocks.php` disables layout supports for `core/group`, `core/buttons`, `core/columns`.

## Where to look next
- Entry points listed in `costered-blocks.php` under the `enqueue_block_editor_assets` hook.
- Build config in `node/dev.config.mjs` for aliases, externals, and entry discovery.
- Wiki for broader docs: Getting Started, Roadmap, Contributing.

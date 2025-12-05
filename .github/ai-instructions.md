We  creating an open source WordPress Plugin called Costered Blocks. This plugin aims to allow most users to style blocks using UI keys to CSS properties. The motivation is to give users access to raw styling data that gets abstracted away from them by WordPress and Gutenberg. The following is some standard rules and instructions we will use for this project:

**General/Code**

- indentation is 4 spaces
- all comments in code will never reference 'you' or 'your', but rather 'we' and 'our'
- markup output should avoid concatenating strings and variables together if possible - use template literals and HEREDOCs instead
- anytime the plugin name is to be used within code, it will always be `costered-blocks-` and never just `costered-`.
- the only time the initals `cb` are allowed to be used is in CSS variables e.g `--cb-grid-columns`.
- variable names should be short single words or camelCaseNames, not complex_underscore_names or prfxVal (prefixed values).
  - the only exception to this is `val`, `num`, and single letter variables like `x`, `y,` `i`, etc.

**CSS Styling**
- with CSS classnames, always use the preferred format of `costered-blocks--{component}--{part}` e.g `costered-blocks--token-editor--list`
- with all HTML output, inline styles are disallowed except where dynamic values are used. e.g `style="padding:0 0 2rem 0"` is banned, but `style="grid-template-columns:{$columns}"` is fine.
- all CSS styling is to go in the global project CSS file located in `./src/css/plugin.css`

**Strings/Lang/i18n**
- all text that is to be shown to the user needs to be stored in the global strings file located in `./config/strings.json`
- strings in this file are already i18n ready, so never import or reference `__()` from WordPress
- in JS, use `import LABELS from @labels` and reference the object path (e.g `LABELS.positioningControls.position.values`) to output the string
- in PHP, use the dedicated custom functions (`costered_i18n`, `costered_i18n_html`, `costered_i18n_attr`, etc.) in `./php/includes/i18n.php` with the same object path as above.
- if dynamic values need to be included in a string, use `sprintf` (in both PHP and JS (via `import { sprintf } from '@wordpress/i18n'`))
  
**PHP**
- function names are to use underscore_style_names and have the opening `{` on the same line
- in WordPress, if a function is only called by only one hook or filter, I prefer closures (e.g `add_action('init', function() {...}`) as opposed to named functions.
- avoid using `ob_start` as much as possible.


**React/Typescript**
- all WordPress dependencies are external (not bundled) and are to be imported like `import { useEffect } from '@wordpress/element'`.
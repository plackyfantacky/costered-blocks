# Developer/API Changelog

## What's Changed in 1.3.0

### Highlights
- **TypeScript across the codebase** for safer attribute handling and fewer runtime edge cases.
- **Responsive attribute schema** under: `attrs.costered.{breakpoint}.styles` with cascade/fallback semantics.
  - Currently limited to what WordPress gives us: `desktop`, `tablet`, and `mobile`.
- **Editor parity** via per-breakpoint mirroring — no `!important` hacks.
- **Consolidated CSS output**: frontend prints once (scoped via `[data-costered]`).
- **No ID or classname pollution**: uses a single data-attribute (`data-costered="uuid"`) to keep markup lean.

### Attribute schema (responsive)
Attributes are stored in blockdata under a single, normalised shape: `attrs.costered.{desktop,tablet,mobile}.styles`

- **Cascade**: If a value isn't set for a breakpoint, it falls back down the chain (Desktop -> Tablet -> Mobile) unless raw: true is requested.
- **Shape guarantee**: Internals ensure the object exists before reads/writes; external consumers should still guard for undefined.

Example:
```JSON
{
    "attrs": {
        "costered": {
            "desktop": { "styles": { "gap": "16px", "paddingTop": "1rem" } },
            "tablet":  { "styles": { "gap": "12px", "paddingTop": "0.5rem" } },
            "mobile":  { "styles": { } }
        }
    }
}
```
---
### Reading APIs

#### `$get(property, options?)`

Lightweight util for non-React contexts.
```ts
type Breakpoint = 'desktop' | 'tablet' | 'mobile';

type GetOptions = {
    breakpoint?: Breakpoint;   // default: current editor/device breakpoint (if available), else 'desktop'
    raw?: boolean;             // default: false (use cascade); true returns only explicit value at the breakpoint
};

const value = $get('marginTop', { breakpoint: 'tablet', raw: false });
```

#### `useAttrGetter(clientId)`

Hook for React components (editor UI). Breakpoint-aware by default.

```ts
const get = useAttrGetter(clientId);

// Cascaded read
const margin = get('margin', { breakpoint: 'mobile', raw: false });

// Raw read (no cascade)
const rawMargin = get('margin', { breakpoint: 'mobile', raw: true });
```

#### Error handling
- Unknown property names return undefined.
- Invalid CSS strings are not coerced; validate at UI boundaries as needed.
---
### Writing APIs

#### `useAttrSetter(clientId)`
Breakpoint-aware writes and unsets. Auto-seeds a stable costeredId on first write.
```ts
const set = useAttrSetter(clientId);

// Write a value at a specific breakpoint
set('gap', '1rem', { breakpoint: 'desktop' });

// Unset a single property at a breakpoint (allows cascade to take over)
set.unset('gap', { breakpoint: 'tablet' });

// Unset multiple properties
set.unsetMany(['gap', 'rowGap'], { breakpoint: 'mobile' });
```

#### Notes
- Writes only touch the targeted breakpoint's styles node.
- Unsetting does not delete siblings; it removes the key so cascade/UA defaults apply.
- Prefer explicit unsets over writing empty strings.
---
### Breakpoint state

#### `useBreakpointState()`

Single source of truth for the active breakpoint. Kept in lockstep with the editor's device selector.
```ts
const { current, setCurrent, is, onChange } = useBreakpointState();
// current: 'desktop' | 'tablet' | 'mobile'
// is(bp): boolean helper
// setCurrent('tablet'): switches the active breakpoint
// onChange(cb): subscription helper (optional)
```

Typical pattern:
```ts
const { current } = useBreakpointState();
const get = useAttrGetter(clientId);
const gap = get('gap', { breakpoint: current, raw: false });
```
---
### Editor & frontend CSS
- **Editor mirroring**: The editor reflects the active breakpoint's computed styles without `!important` leakage.
- **Frontend output**: CSS is generated per block and printed once (no inline `style=""` on blocks).

Theme requirement:
```php
<?php wp_footer(); ?>
```
If `wp_footer()` is skipped, the consolidated CSS will not print.
---
### Markup scoping (no ID/classname pollution)

Blocks are scoped with a single attribute:
```html
<div data-costered="a1b2c3d4-e5f6-..." />
```
- No additional IDs or classnames are injected.
- All emitted CSS targets `[data-costered="<uuid>"]` selectors.
---
### Migration guide (1.2.x pre-releases -> 1.3.0)
1) **Stop reading/writing legacy top-level style props.**.  
   Use the responsive schema via `$get/useAttrGetter/useAttrSetter`.  

2) **Replace any inline-style assumptions.**  
   Frontend styles are printed once; ensure `wp_footer()` exists.  

3) **Respect breakpoint state.**  
   Prefer `useBreakpointState()` to align UI with actual style reads/writes. 
   
4) **Unset intentionally.**  
   Use `set.unset(...)` or `set.unsetMany(...)` to allow cascade rather than writing empty strings.  

#### Before -> After
```ts
// BEFORE (legacy direct read)
const margin = attributes.margin;

// AFTER (cascaded)
const get = useAttrGetter(clientId);
const margin = get('margin', { breakpoint: 'tablet', raw: false });
```
```ts
// BEFORE (legacy write)
attributes.margin = '1rem';

// AFTER (breakpoint-aware write)
const set = useAttrSetter(clientId);
set('margin', '1rem', { breakpoint: 'tablet' });
```
```ts
// BEFORE (legacy write)
attributes.margin = '1rem';

// AFTER (breakpoint-aware write)
const set = useAttrSetter(clientId);
set('margin', '1rem', { breakpoint: 'tablet' });
```
---
### TypeScript shapes (simplified)
```ts
type Breakpoint = 'desktop' | 'tablet' | 'mobile';

type StyleMap = Record<string, string | number | undefined>;

type CosteredNode = {
    styles: StyleMap;
};

type CosteredAttrs = {
    desktop?: CosteredNode;
    tablet?: CosteredNode;
    mobile?: CosteredNode;
};

type Attributes = {
    costered?: CosteredAttrs;
};
```
---
### Practical examples

#### 1) Read with cascade, write raw
```ts
const { current } = useBreakpointState();
const get = useAttrGetter(clientId);
const set = useAttrSetter(clientId);

const gap = get('gap', { breakpoint: current, raw: false }); // cascaded
set('gap', '8px', { breakpoint: current });                  // explicit at current
```
#### 2) Reset a mobile override to inherit tablet/desktop
```ts
set.unset('gap', { breakpoint: 'mobile' });
```
#### 3) Bulk remove item-related properties on tablet
```ts
set.unsetMany(['gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd'], {
    breakpoint: 'tablet'
});
```
### Known issues (tracking)
- **Grid Template Areas**: shrinking a parsed template can produce incorrect dimensions (e.g. 9x3 -> 9x1). Fix scheduled post v1.3.
---
### Versioning & releases (recap)
- Tags on `main` matching `^v\d+\.\d+\.\d+$` -> Release.
- Tags on `dev` matching `^v\d+\.\d+\.\d+-(alpha|beta)\d+$` -> Prerelease.
- Release ZIP excludes dev files via `.gitattributes` `export-ignore` and includes built assets.
---
### FAQs

**Q: How do I read the “real” value a user sees at a breakpoint?**  
A: Use raw: false (default) to enable cascade:
```ts
const value = get('padding', { breakpoint: 'mobile', raw: false });
```

**Q: How do I remove a value so it inherits again?**  
A: Use `unset`:
```ts
set.unset('padding', { breakpoint: 'mobile' });
```

**Q: Do I need to add IDs/classes to my block wrapper?**   
A: No. The plugin manages a stable data-costered attribute and scopes CSS accordingly. This is intentional as WordPress has UI controls for those already.
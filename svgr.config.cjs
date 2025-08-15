const path = require('path');

/** @type {import('@svgr/core').Config} */
module.exports = {
    // Force the plugin chain for @svgr/core (CLI adds these implicitly)
    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],

    // SVGR
    jsxRuntime: 'automatic',
    expandProps: 'end',
    dimensions: false,
    svgProps: { width: '{size}', height: '{size}' },
    template: (...args) => {
        // v6/v7: (variables, { tpl })
        if (args.length === 2) {
            const [variables, { tpl }] = args;
            const { componentName, jsx } = variables;
            return tpl`
                const ${componentName} = ({ size = 24, ...props }) => (
                    ${jsx}
                );

                export default ${componentName};
            `;
        }

        // v8: (api, opts, state)
        const [api, _opts, state] = args;
        const { template } = api;
        const { componentName, jsx } = state;
        return template.ast`
            const ${componentName} = ({ size = 24, ...props }) => (
                ${jsx}
            );

            export default ${componentName};
        `;
    },

    // SVGO v3
    svgo: true,
    svgoConfig: {
        multipass: true,
        plugins: [
            'removeXMLProcInst',
            'removeDoctype',
            'removeStyleElement',
            { name: 'removeAttrs', params: { attrs: ['style', 'svg:xml:space'] } },
            { name: 'removeViewBox', active: false },

            // Root <svg> whitelist: keep only xmlns + viewBox
            {
                name: 'whitelistRootSvgAttrs',
                type: 'visitor',
                fn: () => ({
                    element: {
                        enter(node) {
                            if (node.name !== 'svg' || !node.attributes) return;
                            const allowed = new Set(['xmlns', 'viewBox']);
                            for (const k of Object.keys(node.attributes)) {
                                if (!allowed.has(k)) delete node.attributes[k];
                            }
                        },
                    },
                }),
            },
            {
                name: 'dropArtboardRect',
                type: 'visitor',
                fn: () => ({
                    element: {
                        enter(node) {
                            if (node.name !== 'svg' || !node.children) return;

                            const vb = String(node.attributes?.viewBox || '').trim().split(/\s+/).map(Number);
                            const vbW = Number.isFinite(vb[2]) ? vb[2] : null;
                            const vbH = Number.isFinite(vb[3]) ? vb[3] : null;

                            const num = (v) => {
                                if (v == null) return NaN;
                                return parseFloat(String(v).replace(/px$/i, ''));
                            };

                            node.children = node.children.filter((child) => {
                                if (child.name !== 'rect' || !child.attributes) return true;

                                const x = num(child.attributes.x);
                                const y = num(child.attributes.y);
                                const w = num(child.attributes.width);
                                const h = num(child.attributes.height);

                                const atOrigin = (x === 0 || x === 0.0) && (y === 0 || y === 0.0);
                                const matches24 = w === 24 && h === 24;
                                const matchesVB = vbW != null && vbH != null && w === vbW && h === vbH;

                                // remove if it’s an artboard-covering rect
                                return !(atOrigin && (matches24 || matchesVB));
                            });
                        },
                    },
                }),
            }
        ],
    },

    // Prettier v3
    prettier: true,
    prettierConfig: {
        semi: true,
        singleQuote: true,
        jsxSingleQuote: false,
        trailingComma: 'all',
        singleAttributePerLine: false,
        printWidth: 999,
        tabWidth: 4, // 4‑space indent (your new requirement)
        useTabs: false,
    },
};

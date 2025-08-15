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
    template: (api, _opts, state) => {
        const { template } = api;
        const { jsx, filePath } = state;

        const baseName = path.basename(filePath, path.extname(filePath));
        const cleanName = baseName
            .replace(/^Svg/i, '')              // drop Svg prefix if present
            .replace(/[-_](.)/g, (_, c) => c.toUpperCase()) // kebab/snake to camel
            .replace(/^(.)/, (_, c) => c.toUpperCase());    // uppercase first char

        return template.ast`
            const ${cleanName} = ({ size = 24, ...props }) => (
                ${jsx}
            );

            export default ${cleanName};
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

            // Fill normalization: set any fill to currentColor; ensure <path> has fill
            {
                name: 'normalizeCurrentColorFill',
                type: 'visitor',
                fn: () => ({
                    element: {
                        enter(node) {
                            if (!node.attributes) return;
                            if (Object.prototype.hasOwnProperty.call(node.attributes, 'fill')) {
                                node.attributes.fill = 'currentColor';
                            }
                            if (node.name === 'path' && !Object.prototype.hasOwnProperty.call(node.attributes, 'fill')) {
                                node.attributes.fill = 'currentColor';
                            }
                        },
                    },
                }),
            },
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

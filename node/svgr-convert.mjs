#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform, loadConfig } from '@svgr/core';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.resolve(__dirname, '../src/assets/icons/raw');
const OUT_DIR = path.resolve(__dirname, '../src/assets/icons');

function toComponentName(fileBase) {
    // strip extension already done by caller; remove a leading "Svg"
    const noSvg = fileBase.replace(/^Svg/i, '');

    // split on any non-alphanumeric (handles --, __, spaces, dots, etc.)
    const parts = noSvg.split(/[^a-zA-Z0-9]+/g).filter(Boolean);

    // PascalCase
    let name = parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');

    // Fallbacks/guards
    if (!name) name = 'Icon';
    if (/^[0-9]/.test(name)) name = `Icon${name}`;

    return name;
}

// Strip namespaced attributes (e.g. xmlns:attr) from SVG XML. We need to run this one before SVGO
// because SVGO will throw an error if it encounters namespaced attributes AND that is before it even runs
// any of the plugins that would remove them!
function stripNamespacedAttributes(xml) {
    xml = xml.replace(/\s+xlink:href=(["'])/gi, ' href=$1');
    xml = xml.replace(/\s+xmlns:[A-Za-z_][\w.\-]*=(?:"[^"]*"|'[^']*')/g, '');
    xml = xml.replace(/\s+(?!xml:)[A-Za-z_][\w.\-]*:[\w.\-]+=(?:"[^"]*"|'[^']*')/gi, '');
    return xml;
}

async function convertOneSvg(inPath, outPath) {
    const svgCode = await fs.readFile(inPath, 'utf8');

    // Load the same config the CLI uses (searches up from filePath)
    const baseConfig = await loadConfig({ filePath: inPath });

    // Ensure the plugin chain is present (core API needs it)
    const plugins = ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'];

    const config = { ...baseConfig, plugins };

    const base = path.basename(inPath, path.extname(inPath));
    const cleanName = toComponentName(base);

    const sanitizedSvg = stripNamespacedAttributes(svgCode);

    let jsCode = await transform(sanitizedSvg, config, { filePath: inPath, componentName: cleanName });

    jsCode = await prettier.format(jsCode, {
        parser: 'babel',
        printWidth: 999,
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 4,
        useTabs: false,
    });

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, jsCode, 'utf8');
}

async function buildIndexFile(entries) {
    // sort by component name for stable diffs
    const sorted = [...entries].sort((a, b) => a.componentName.localeCompare(b.componentName));
    const lines = sorted.map(
        ({ fileBase, componentName }) => `export { default as ${componentName} } from './${fileBase}.jsx';`,
    );

    const indexPath = path.join(OUT_DIR, 'index.js');
    const content = lines.join('\n') + '\n';

    const formatted = await prettier.format(content, {
        parser: 'babel',
        tabWidth: 4,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 999,
    });

    await fs.writeFile(indexPath, formatted, 'utf8');
}

async function run() {
    const entries = await fs.readdir(RAW_DIR, { withFileTypes: true });
    const svgs = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.svg'));

    if (svgs.length === 0) {
        console.log('No SVG files found in', RAW_DIR);
        return;
    }

    const componentEntries = []; // [{ fileBase, componentName }]

    for (const e of svgs) {
        const fileBase = path.basename(e.name, '.svg');           // original filename w/o ext
        const componentName = toComponentName(fileBase);          // robust PascalCase
        const inPath = path.join(RAW_DIR, e.name);
        const outPath = path.join(OUT_DIR, `${fileBase}.jsx`);    // keep original filename

        try {
            await convertOneSvg(inPath, outPath, componentName);
            componentEntries.push({ fileBase, componentName });
            console.log('✓ Converted:', path.relative(__dirname, outPath));
        } catch (err) {
            console.error('✗ Failed:', inPath, '\n', err);
        }
    }

    await buildIndexFile(componentEntries);
    console.log('✓ Built index:', path.relative(__dirname, path.join(OUT_DIR, 'index.js')));
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

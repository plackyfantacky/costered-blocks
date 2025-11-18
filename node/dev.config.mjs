// @ts-nocheck
import esbuild from 'esbuild';
import { context, build } from 'esbuild';
import { glob } from 'glob';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { resolve } from 'path';
import pathAlias from 'esbuild-plugin-path-alias';

const isDev = process.env.NODE_ENV !== 'production';
const isWatch = process.argv.includes('--watch');
const justBuild = process.argv.includes('--build');
const jsOutDir = './js';
const cssOutDir = './css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, '..');

const fsp = fs.promises;
const block_src = path.resolve(pluginRoot, 'src/blocks');
const block_build = path.resolve(pluginRoot, 'js/blocks');

const pathAliases = {
    'assets': 'src/assets',
    'blockUIs': 'src/blocks/ui-controls',
    'components': 'src/components',
    'config': 'src/config.ts',
    'filters': 'src/filters',
    'hooks': 'src/hooks',
    'labels': 'src/labels.ts',
    'panels': 'src/panels',
    'providers': 'src/providers',
    'stores': 'src/stores',
    'tabs': 'src/tabs',
    'utils': 'src/utils',
    'debug': 'src/utils/debug.ts',
    'types': 'types'
};

const globalsMap = {
    "@wordpress/api-fetch": "wp.apiFetch",
    "@wordpress/blob": "wp.blob",
    "@wordpress/block-editor": "wp.blockEditor",
    "@wordpress/blocks": "wp.blocks",
    "@wordpress/components": "wp.components",
    "@wordpress/compose": "wp.compose",
    "@wordpress/customize-posts": "wp.customizePosts",
    "@wordpress/data": "wp.data",
    "@wordpress/date": "wp.date",
    "@wordpress/dom-ready": "wp.domReady",
    "@wordpress/edit-post": "wp.editPost",
    "@wordpress/editor": "wp.editor",
    "@wordpress/element": "wp.element",
    "@wordpress/hooks": "wp.hooks",
    "@wordpress/html-entities": "wp.htmlEntities",
    "@wordpress/i18n": "wp.i18n",
    "@wordpress/icons": "wp.icons",
    "@wordpress/interface": "wp.interface",
    "@wordpress/keycodes": "wp.keycodes",
    "@wordpress/media-upload": "wp.mediaUpload",
    "@wordpress/media-utils": "wp.mediaUtils",
    "@wordpress/plugins": "wp.plugins",
    "@wordpress/preferences": "wp.preferences",
    "@wordpress/url": "wp.url",
    "@wordpress/utils": "wp.utils",
    "@wordpress/viewport": "wp.viewport",
    "react": "React",
    "react-dom": "ReactDOM"
};

async function findBlockDirs(root) {
    const entries = await fsp.readdir(root, { withFileTypes: true }).catch(() => []);
    return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(root, entry.name));
}

async function ensureDir(dir) {
    await fsp.mkdir(dir, { recursive: true });
}

function rewriteBlockJsonPaths(json) {
    const fields = ['script', 'style', 'editorScript', 'editorStyle', 'viewScript', 'viewStyle'];
        for (const key of fields) {
        const val = json?.[key];
        if (typeof val === 'string' && val.startsWith('file:./')) {
            json[key] = val.replace(/\.tsx?$/i, '.js');
        }
    }
    return json;
}

async function copyBlockStatics() {
    const blockDirs = await findBlockDirs(block_src);
    for (const srcDir of blockDirs) {
        const name = path.basename(srcDir);
        const outDir = path.join(block_build, name);
        await ensureDir(outDir);

        // Copy + rewrite block.json
        const jsonPath = path.join(srcDir, 'block.json');
        try {
            const raw = await fsp.readFile(jsonPath, 'utf8');
            const parsed = JSON.parse(raw);
            const rewritten = JSON.stringify(rewriteBlockJsonPaths(parsed), null, 4);
            const outJson = path.join(outDir, 'block.json');

            // avoid redundant writes
            let shouldWrite = true;
            try {
                const existing = await fsp.readFile(outJson, 'utf8');
                if (existing === rewritten) shouldWrite = false;
            } catch {}
            if (shouldWrite) await fsp.writeFile(outJson, rewritten, 'utf8');
        } catch (err) {
            if (err?.code !== 'ENOENT') throw err;
        }

        // Copy render.php (if present)
        const phpPath = path.join(srcDir, 'index.asset.php');
        try {
            const outPhp = path.join(outDir, 'index.asset.php');
            await fsp.copyFile(phpPath, outPhp);
        } catch (err) {
            if (err?.code !== 'ENOENT') throw err;
        }
    }
}

function copyBlockStaticsPlugin() {
    return {
        name: 'costered-copy-json-php',
        setup(build) {
            build.onEnd(async (result) => {
                if (result?.errors?.length) return;
                await copyBlockStatics();
            });
        }
    };
}

async function watchBlockStatics() {
    // Works fine on macOS/Linux; for Windows or deep trees, consider chokidar.
    const watcher = fs.watch(block_src, { recursive: true }, async (_event, filename) => {
        if (!filename) return;
        if (!/\/(block\.json|render\.php)$/.test(filename)) return;
        try {
            await copyBlockStatics();
            console.log(`Copied statics for ${filename}`);
        } catch (e) {
            console.warn('Static copy failed:', e?.message || e);
        }
    });
    return watcher;
}

function importAsGlobals(mapping) {
    const escRe = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // https://stackoverflow.com/a/3561711/153718
    const filter = new RegExp(
        Object.keys(mapping)
            .map((mod) => `^${escRe(mod)}$`)
            .join("|"),
    );

    return {
        name: "global-imports",
        setup(build) {
            build.onResolve({ filter }, (args) => {
                if (!mapping[args.path]) {
                    throw new Error("Unknown global: " + args.path);
                }
                return {
                    path: args.path,
                    namespace: "external-global",
                };
            });

            build.onLoad(
                {
                    filter,
                    namespace: "external-global",
                },
                async (args) => {
                    const global = mapping[args.path];
                    //return {
                        //contents: `module.exports = ${global};`,
                        //loader: "js",
                    //};
                    const mod = mapping[args.path];
                    return {
                        contents: `
                            (function(){
                                var g = ${mod};
                                // CommonJS export and ESM-ish shapes
                                module.exports = g;
                                try { 
                                    module.exports.default = g;
                                    Object.defineProperty(module.exports, '__esModule', { value: true });
                                } catch(e) {}
                            })();
                        `,
                        loader: "js",
                    };
                },
            );
        },
    };
}

function cleanOutputDir(outdir) {
    if (fs.existsSync(outdir)) {
        fs.rmSync(outdir, { recursive: true, force: true });
    }
}

const resolvedAliases = Object.fromEntries(
    Object.entries(pathAliases).map(([key, relPath]) => [
        `@${key}`,
        path.resolve(pluginRoot, relPath),
    ])
);

const jsConfig = {
    entryPoints: await glob('src/**/*.{js,jsx,ts,tsx}').then((files) =>
        files
            .filter((file) => !file.includes('/components/')) // Exclude components
            .map((file) => {
                let out = path.relative('src', file);
                out = out.replace(/\.jsx?$/, '').replace(/\.tsx?$/, '');
                return { in: file, out };
            })
    ),
    entryNames: '[dir]/[name]',
    outdir: jsOutDir,
    loader: {
        '.js': 'jsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.tsx': 'tsx'
    },
    jsx: 'transform',
    jsxFactory: 'wp.element.createElement',
    jsxFragment: 'wp.element.Fragment',
    tsconfigRaw: {
        compilerOptions: {
            // Force classic JSX at bundle-time even if tsconfig says react-jsx
            jsx: 'react',
            jsxFactory: 'wp.element.createElement',
            jsxFragmentFactory: 'wp.element.Fragment'
        }
    },
    target: ['es2020'],
    format: 'iife',
    platform: 'browser',
    plugins: [
        importAsGlobals(globalsMap),
        pathAlias(resolvedAliases),
        copyBlockStaticsPlugin()
    ],
    logLevel: 'info',
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    define: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    }
};

const cssConfig = {
    entryPoints: await glob('src/**/*.css'),
    outdir: cssOutDir,
    loader: {
        '.css': 'css',
    },
    outExtension: { '.css': '.css' },
    bundle: true,
    logLevel: 'info',
};


if (isWatch) {
    console.log('👀 Watching for changes...');

    const jsContext = await esbuild.context({ ...jsConfig, sourcemap: true, minify: false, bundle: true });
    const cssContext = await esbuild.context({ ...cssConfig, sourcemap: true, minify: false, bundle: true });

    await Promise.all([
        jsContext.watch(),
        cssContext.watch(),
    ]);

    // Initial copy + watch JSON/PHP
    await copyBlockStatics();
    await watchBlockStatics();

} else {
    if (justBuild) {
        console.log('Cleaning output directories...');

        cleanOutputDir(jsOutDir);
        cleanOutputDir(cssOutDir);

        console.log('Building for production...');

        await build({ ...jsConfig, sourcemap: false, minify: true, bundle: true });
        await build({ ...cssConfig, sourcemap: false, minify: true, bundle: true });
    } else {
        console.log('Building...');

        await build({ ...jsConfig, sourcemap: true, minify: false, bundle: true });
        await build({ ...cssConfig, sourcemap: true, minify: false, bundle: true });

         await copyBlockStatics();
    }
    console.log('Build completed successfully.');
}
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
                    return {
                        contents: `module.exports = ${global};`,
                        loader: "js",
                    };
                },
            );
        },
    };
}

const globalsMap = {
    "@wordpress/components": "wp.components",
    "@wordpress/compose": "wp.compose",
    "@wordpress/api-fetch": "wp.apiFetch",
    "@wordpress/edit-post": "wp.editPost",
    "@wordpress/element": "wp.element",
    "@wordpress/plugins": "wp.plugins",
    "@wordpress/editor": "wp.editor",
    "@wordpress/block-editor": "wp.blockEditor",
    "@wordpress/blocks": "wp.blocks",
    "@wordpress/hooks": "wp.hooks",
    "@wordpress/utils": "wp.utils",
    "@wordpress/date": "wp.date",
    "@wordpress/data": "wp.data",
    "@wordpress/dom-ready": "wp.domReady",
    "@wordpress/i18n": "wp.i18n",
    "react": "React",
    "react-dom": "ReactDOM",
};

function cleanOutputDir(outdir) {
    if (fs.existsSync(outdir)) {
        fs.rmSync(outdir, { recursive: true, force: true });
    }
}

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
        '.ts': 'tsx',
        '.jsx': 'jsx',
        '.tsx': 'tsx'
    },
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: ['es2020'],
    format: 'iife',
    platform: 'browser',
    plugins: [
        importAsGlobals(globalsMap),
        pathAlias({
            '@editor': path.resolve(pluginRoot, 'src/editor'),
            '@tabs': path.resolve(pluginRoot, 'src/editor/tabs'),
            '@components': path.resolve(pluginRoot, 'src/components'),
            '@lib': path.resolve(pluginRoot, 'src/lib'),
            '@assets': path.resolve(pluginRoot, 'src/assets'),
        })
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
    }
    console.log('Build completed successfully.');
}
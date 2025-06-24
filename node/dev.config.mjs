import { log } from "console";
import { context, build } from 'esbuild';
import { glob } from 'glob';
import path from 'path';

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
    "react": "React",
    "react-dom": "ReactDOM",
};

const isWatch = process.argv.includes('--watch');
const justBuild = process.argv.includes('--build');
const outDir = './';

const config = {
    entryPoints: await glob('src/**/*.{js,jsx,ts,tsx}').then((files) => 
        files
            .filter((file) => !file.includes('/components/')) // Exclude components
            .map((file) => {
                const relativePath = path.relative('src', file);
                const out = path.join('js', relativePath)
                    .replace(/\.jsx?$/, '') 
                    .replace(/\.tsx?$/, '')
                return { in: file, out }
            })
    ),
    entryNames: '[dir]/[name]',
    outdir: outDir,
    loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.jsx': 'jsx',
        '.tsx': 'tsx',
    },
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: ['es2018'],
    format: 'iife',
    plugins: [
        importAsGlobals(globalsMap),
    ],
    logLevel: 'info'
};

let ctx;

if (isWatch) {
    ctx = await context(config);
    await ctx.watch();
    console.log('👀 Watching for changes...');
} else {
    if( justBuild ) {
        console.log('🔨 Building for production...');
        await build({
            ...config,
            sourcemap: false,
            minify: true,
            bundle: true,
            
        });
    } else {
        console.log('🔨 Building...');
        await build({
            ...config,
            sourcemap: true,
            minify: false,
            bundle: true,
        });
    }
    console.log('Build completed successfully.');
}
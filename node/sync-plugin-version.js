/* bin/sync-plugin-version.js */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginFilePath = path.join(__dirname, '..', 'costered-blocks.php');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

let pluginContents = fs.readFileSync(pluginFilePath, 'utf8');

// Update "Version: x.y.z" in the plugin header
pluginContents = pluginContents.replace(
    /(Version:\s*)([0-9]+\.[0-9]+\.[0-9]+(?:[-A-Za-z0-9.+]*)?)/,
    `$1${version}`
);

// Optional: also keep a version constant in sync, if we are using one
pluginContents = pluginContents.replace(
    /(define\(\s*'COSTERED_BLOCKS_VERSION'\s*,\s*')([^']*)('\s*\)\s*;)/,
    `$1${version}$3`
);

fs.writeFileSync(pluginFilePath, pluginContents, 'utf8');


// Stage the PHP file so npm's version commit includes it
execSync(`git add "${pluginFilePath}"`, { stdio: 'inherit' });

console.log(`Synced plugin header and version constant to ${version}`);

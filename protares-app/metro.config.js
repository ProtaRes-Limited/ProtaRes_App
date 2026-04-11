const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve SVG as React components via react-native-svg-transformer (optional).
// Kept out by default to match package.json — enable if importing .svg files.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

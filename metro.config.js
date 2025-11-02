const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .csv uzantısını asset (varlık) listesine ekle
config.resolver.assetExts.push('csv');

module.exports = config;

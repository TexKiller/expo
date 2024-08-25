"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fontFamilyNeedsScoping = fontFamilyNeedsScoping;
exports.getAssetForSource = getAssetForSource;
exports.loadSingleFontAsync = loadSingleFontAsync;
exports.getNativeFontName = getNativeFontName;
const expo_asset_1 = require("expo-asset");
const expo_modules_core_1 = require("expo-modules-core");
const ExpoFontLoader_1 = __importDefault(require("./ExpoFontLoader"));
const Font_types_1 = require("./Font.types");
function uriFromFontSource(asset) {
    if (typeof asset === 'string') {
        return asset || null;
    }
    else if (typeof asset === 'object') {
        return asset.uri || asset.localUri || asset.default || null;
    }
    else if (typeof asset === 'number') {
        return uriFromFontSource(expo_asset_1.Asset.fromModule(asset));
    }
    return null;
}
function displayFromFontSource(asset) {
    return asset.display || Font_types_1.FontDisplay.AUTO;
}
function fontFamilyNeedsScoping(name) {
    return false;
}
function getAssetForSource(source) {
    const uri = uriFromFontSource(source);
    const display = displayFromFontSource(source);
    if (!uri || typeof uri !== 'string') {
        throwInvalidSourceError(uri);
    }
    return {
        uri: uri,
        display,
    };
}
function throwInvalidSourceError(source) {
    let type = typeof source;
    if (type === 'object')
        type = JSON.stringify(source, null, 2);
    throw new expo_modules_core_1.CodedError(`ERR_FONT_SOURCE`, `Expected font asset of type \`string | FontResource | Asset\` instead got: ${type}`);
}
// NOTE(EvanBacon): No async keyword!
function loadSingleFontAsync(name, input) {
    if (typeof input !== 'object' || typeof input.uri !== 'string' || input.downloadAsync) {
        throwInvalidSourceError(input);
    }
    try {
        return ExpoFontLoader_1.default.loadAsync(name, input);
    }
    catch {
        // No-op.
    }
    return Promise.resolve();
}
function getNativeFontName(name) {
    return name;
}
//# sourceMappingURL=FontLoader.web.js.map
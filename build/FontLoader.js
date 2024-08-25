"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetForSource = getAssetForSource;
exports.loadSingleFontAsync = loadSingleFontAsync;
const expo_asset_1 = require("expo-asset");
const expo_modules_core_1 = require("expo-modules-core");
const ExpoFontLoader_1 = __importDefault(require("./ExpoFontLoader"));
function getAssetForSource(source) {
    if (source instanceof expo_asset_1.Asset) {
        return source;
    }
    if (typeof source === 'string') {
        return expo_asset_1.Asset.fromURI(source);
    }
    else if (typeof source === 'number') {
        return expo_asset_1.Asset.fromModule(source);
    }
    else if (typeof source === 'object' && typeof source.uri !== 'undefined') {
        return getAssetForSource(source.uri);
    }
    // @ts-ignore Error: Type 'string' is not assignable to type 'Asset'
    // We can't have a string here, we would have thrown an error if !isWeb
    // or returned Asset.fromModule if isWeb.
    return source;
}
async function loadSingleFontAsync(name, input) {
    const asset = input;
    if (!asset.downloadAsync) {
        throw new expo_modules_core_1.CodedError(`ERR_FONT_SOURCE`, '`loadSingleFontAsync` expected resource of type `Asset` from expo-asset on native');
    }
    await asset.downloadAsync();
    if (!asset.downloaded) {
        throw new expo_modules_core_1.CodedError(`ERR_DOWNLOAD`, `Failed to download asset for font "${name}"`);
    }
    await ExpoFontLoader_1.default.loadAsync(name, asset.localUri);
}
//# sourceMappingURL=FontLoader.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPromises = void 0;
exports.markLoaded = markLoaded;
exports.isLoadedInCache = isLoadedInCache;
exports.isLoadedNative = isLoadedNative;
exports.purgeFontFamilyFromCache = purgeFontFamilyFromCache;
exports.purgeCache = purgeCache;
const ExpoFontLoader_1 = __importDefault(require("./ExpoFontLoader"));
exports.loadPromises = {};
// cache the value on the js side for fast access to the fonts that are loaded
let cache = {};
function markLoaded(fontFamily) {
    cache[fontFamily] = true;
}
function isLoadedInCache(fontFamily) {
    return fontFamily in cache;
}
function isLoadedNative(fontFamily) {
    if (isLoadedInCache(fontFamily)) {
        return true;
    }
    else {
        const loadedNativeFonts = ExpoFontLoader_1.default.getLoadedFonts();
        loadedNativeFonts.forEach((font) => {
            cache[font] = true;
        });
        return fontFamily in cache;
    }
}
function purgeFontFamilyFromCache(fontFamily) {
    delete cache[fontFamily];
}
function purgeCache() {
    cache = {};
}
//# sourceMappingURL=memory.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontDisplay = void 0;
exports.processFontFamily = processFontFamily;
exports.isLoaded = isLoaded;
exports.isLoading = isLoading;
exports.loadAsync = loadAsync;
exports.unloadAllAsync = unloadAllAsync;
exports.unloadAsync = unloadAsync;
const expo_modules_core_1 = require("expo-modules-core");
const ExpoFontLoader_1 = __importDefault(require("./ExpoFontLoader"));
const Font_types_1 = require("./Font.types");
Object.defineProperty(exports, "FontDisplay", { enumerable: true, get: function () { return Font_types_1.FontDisplay; } });
const FontLoader_1 = require("./FontLoader");
const memory_1 = require("./memory");
const server_1 = require("./server");
// @needsAudit
// note(brentvatne): at some point we may want to warn if this is called outside of a managed app.
/**
 * Used to transform font family names to the scoped name. This does not need to
 * be called in standalone or bare apps but it will return unscoped font family
 * names if it is called in those contexts.
 *
 * @param fontFamily Name of font to process.
 * @returns Returns a name processed for use with the [current workflow](https://docs.expo.dev/archive/managed-vs-bare/).
 */
function processFontFamily(fontFamily) {
    if (!fontFamily || !(0, FontLoader_1.fontFamilyNeedsScoping)(fontFamily)) {
        return fontFamily;
    }
    if (!isLoaded(fontFamily)) {
        if (__DEV__) {
            if (isLoading(fontFamily)) {
                console.warn(`You started loading the font "${fontFamily}", but used it before it finished loading. You need to wait for Font.loadAsync to complete before using the font.`);
            }
            else {
                console.warn(`fontFamily "${fontFamily}" is not a system font and has not been loaded through expo-font.`);
            }
        }
    }
    return `ExpoFont-${(0, FontLoader_1.getNativeFontName)(fontFamily)}`;
}
// @needsAudit
/**
 * Synchronously detect if the font for `fontFamily` has finished loading.
 *
 * @param fontFamily The name used to load the `FontResource`.
 * @return Returns `true` if the font has fully loaded.
 */
function isLoaded(fontFamily) {
    if (expo_modules_core_1.Platform.OS === 'web') {
        return fontFamily in memory_1.loaded || !!ExpoFontLoader_1.default.isLoaded(fontFamily);
    }
    return fontFamily in memory_1.loaded || ExpoFontLoader_1.default.customNativeFonts?.includes(fontFamily);
}
// @needsAudit
/**
 * Synchronously detect if the font for `fontFamily` is still being loaded.
 *
 * @param fontFamily The name used to load the `FontResource`.
 * @returns Returns `true` if the font is still loading.
 */
function isLoading(fontFamily) {
    return fontFamily in memory_1.loadPromises;
}
// @needsAudit
/**
 * Highly efficient method for loading fonts from static or remote resources which can then be used
 * with the platform's native text elements. In the browser this generates a `@font-face` block in
 * a shared style sheet for fonts. No CSS is needed to use this method.
 *
 * @param fontFamilyOrFontMap string or map of values that can be used as the [`fontFamily`](https://reactnative.dev/docs/text#style)
 * style prop with React Native Text elements.
 * @param source the font asset that should be loaded into the `fontFamily` namespace.
 *
 * @return Returns a promise that fulfils when the font has loaded. Often you may want to wrap the
 * method in a `try/catch/finally` to ensure the app continues if the font fails to load.
 */
function loadAsync(fontFamilyOrFontMap, source) {
    // NOTE(EvanBacon): Static render pass on web must be synchronous to collect all fonts.
    // Because of this, `loadAsync` doesn't use the `async` keyword and deviates from the
    // standard Expo SDK style guide.
    const isServer = expo_modules_core_1.Platform.OS === 'web' && typeof window === 'undefined';
    if (typeof fontFamilyOrFontMap === 'object') {
        if (source) {
            return Promise.reject(new expo_modules_core_1.CodedError(`ERR_FONT_API`, `No fontFamily can be used for the provided source: ${source}. The second argument of \`loadAsync()\` can only be used with a \`string\` value as the first argument.`));
        }
        const fontMap = fontFamilyOrFontMap;
        const names = Object.keys(fontMap);
        if (isServer) {
            names.map((name) => (0, server_1.registerStaticFont)(name, fontMap[name]));
            return Promise.resolve();
        }
        return Promise.all(names.map((name) => loadFontInNamespaceAsync(name, fontMap[name]))).then(() => { });
    }
    if (isServer) {
        (0, server_1.registerStaticFont)(fontFamilyOrFontMap, source);
        return Promise.resolve();
    }
    return loadFontInNamespaceAsync(fontFamilyOrFontMap, source);
}
async function loadFontInNamespaceAsync(fontFamily, source) {
    if (!source) {
        throw new expo_modules_core_1.CodedError(`ERR_FONT_SOURCE`, `Cannot load null or undefined font source: { "${fontFamily}": ${source} }. Expected asset of type \`FontSource\` for fontFamily of name: "${fontFamily}"`);
    }
    if (memory_1.loaded[fontFamily]) {
        return;
    }
    if (memory_1.loadPromises.hasOwnProperty(fontFamily)) {
        return memory_1.loadPromises[fontFamily];
    }
    // Important: we want all callers that concurrently try to load the same font to await the same
    // promise. If we're here, we haven't created the promise yet. To ensure we create only one
    // promise in the program, we need to create the promise synchronously without yielding the event
    // loop from this point.
    const asset = (0, FontLoader_1.getAssetForSource)(source);
    memory_1.loadPromises[fontFamily] = (async () => {
        try {
            await (0, FontLoader_1.loadSingleFontAsync)(fontFamily, asset);
            memory_1.loaded[fontFamily] = true;
        }
        finally {
            delete memory_1.loadPromises[fontFamily];
        }
    })();
    await memory_1.loadPromises[fontFamily];
}
// @needsAudit
/**
 * Unloads all the custom fonts. This is used for testing.
 */
async function unloadAllAsync() {
    if (!ExpoFontLoader_1.default.unloadAllAsync) {
        throw new expo_modules_core_1.UnavailabilityError('expo-font', 'unloadAllAsync');
    }
    if (Object.keys(memory_1.loadPromises).length) {
        throw new expo_modules_core_1.CodedError(`ERR_UNLOAD`, `Cannot unload fonts while they're still loading: ${Object.keys(memory_1.loadPromises).join(', ')}`);
    }
    for (const fontFamily of Object.keys(memory_1.loaded)) {
        delete memory_1.loaded[fontFamily];
    }
    await ExpoFontLoader_1.default.unloadAllAsync();
}
// @needsAudit
/**
 * Unload custom fonts matching the `fontFamily`s and display values provided.
 * Because fonts are automatically unloaded on every platform this is mostly used for testing.
 *
 * @param fontFamilyOrFontMap The name or names of the custom fonts that will be unloaded.
 * @param options When `fontFamilyOrFontMap` is a string, this should be the font source used to load
 * the custom font originally.
 */
async function unloadAsync(fontFamilyOrFontMap, options) {
    if (!ExpoFontLoader_1.default.unloadAsync) {
        throw new expo_modules_core_1.UnavailabilityError('expo-font', 'unloadAsync');
    }
    if (typeof fontFamilyOrFontMap === 'object') {
        if (options) {
            throw new expo_modules_core_1.CodedError(`ERR_FONT_API`, `No fontFamily can be used for the provided options: ${options}. The second argument of \`unloadAsync()\` can only be used with a \`string\` value as the first argument.`);
        }
        const fontMap = fontFamilyOrFontMap;
        const names = Object.keys(fontMap);
        await Promise.all(names.map((name) => unloadFontInNamespaceAsync(name, fontMap[name])));
        return;
    }
    return await unloadFontInNamespaceAsync(fontFamilyOrFontMap, options);
}
async function unloadFontInNamespaceAsync(fontFamily, options) {
    if (!memory_1.loaded[fontFamily]) {
        return;
    }
    else {
        delete memory_1.loaded[fontFamily];
    }
    // Important: we want all callers that concurrently try to load the same font to await the same
    // promise. If we're here, we haven't created the promise yet. To ensure we create only one
    // promise in the program, we need to create the promise synchronously without yielding the event
    // loop from this point.
    const nativeFontName = (0, FontLoader_1.getNativeFontName)(fontFamily);
    if (!nativeFontName) {
        throw new expo_modules_core_1.CodedError(`ERR_FONT_FAMILY`, `Cannot unload an empty name`);
    }
    await ExpoFontLoader_1.default.unloadAsync(nativeFontName, options);
}
//# sourceMappingURL=Font.js.map
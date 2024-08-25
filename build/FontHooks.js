"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFonts = void 0;
const react_1 = require("react");
const Font_1 = require("./Font");
function isMapLoaded(map) {
    if (typeof map === 'string') {
        return (0, Font_1.isLoaded)(map);
    }
    else {
        return Object.keys(map).every((fontFamily) => (0, Font_1.isLoaded)(fontFamily));
    }
}
function useRuntimeFonts(map) {
    const [loaded, setLoaded] = (0, react_1.useState)(
    // For web rehydration, we need to check if the fonts are already loaded during the static render.
    // Native will also benefit from this optimization.
    isMapLoaded(map));
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (0, Font_1.loadAsync)(map)
            .then(() => setLoaded(true))
            .catch(setError);
    }, []);
    return [loaded, error];
}
function useStaticFonts(map) {
    (0, Font_1.loadAsync)(map);
    return [true, null];
}
// @needsAudit
/**
 * ```ts
 * const [loaded, error] = useFonts({ ... });
 * ```
 * Load a map of fonts with [`loadAsync`](#loadasync). This returns a `boolean` if the fonts are
 * loaded and ready to use. It also returns an error if something went wrong, to use in development.
 *
 * > Note, the fonts are not "reloaded" when you dynamically change the font map.
 *
 * @param map A map of `fontFamily`s to [`FontSource`](#fontsource)s. After loading the font you can
 * use the key in the `fontFamily` style prop of a `Text` element.
 *
 * @return
 * - __loaded__ (`boolean`) - A boolean to detect if the font for `fontFamily` has finished
 * loading.
 * - __error__ (`Error | null`) - An error encountered when loading the fonts.
 */
exports.useFonts = typeof window === 'undefined' ? useStaticFonts : useRuntimeFonts;
//# sourceMappingURL=FontHooks.js.map
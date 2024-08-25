"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFonts = useFonts;
const react_1 = require("react");
const Font_1 = require("./Font");
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
function useFonts(map) {
    const [loaded, setLoaded] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        (0, Font_1.loadAsync)(map)
            .then(() => setLoaded(true))
            .catch(setError);
    }, []);
    return [loaded, error];
}
//# sourceMappingURL=FontHooks.js.map
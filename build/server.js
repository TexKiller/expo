"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerResources = getServerResources;
exports.resetServerContext = resetServerContext;
exports.registerStaticFont = registerStaticFont;
const expo_modules_core_1 = require("expo-modules-core");
const ExpoFontLoader_1 = __importDefault(require("./ExpoFontLoader"));
const FontLoader_1 = require("./FontLoader");
/**
 * @returns the server resources that should be statically extracted.
 * @private
 */
function getServerResources() {
    return ExpoFontLoader_1.default.getServerResources();
}
/**
 * @returns clear the server resources from the global scope.
 * @private
 */
function resetServerContext() {
    return ExpoFontLoader_1.default.resetServerContext();
}
function registerStaticFont(fontFamily, source) {
    // MUST BE A SYNC FUNCTION!
    if (!source) {
        throw new expo_modules_core_1.CodedError(`ERR_FONT_SOURCE`, `Cannot load null or undefined font source: { "${fontFamily}": ${source} }. Expected asset of type \`FontSource\` for fontFamily of name: "${fontFamily}"`);
    }
    const asset = (0, FontLoader_1.getAssetForSource)(source);
    (0, FontLoader_1.loadSingleFontAsync)(fontFamily, asset);
}
//# sourceMappingURL=server.js.map
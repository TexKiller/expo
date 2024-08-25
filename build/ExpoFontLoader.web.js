"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expo_modules_core_1 = require("expo-modules-core");
const fontfaceobserver_1 = __importDefault(require("fontfaceobserver"));
const Font_types_1 = require("./Font.types");
function getFontFaceStyleSheet() {
    if (!expo_modules_core_1.Platform.isDOMAvailable) {
        return null;
    }
    const styleSheet = getStyleElement();
    return styleSheet.sheet ? styleSheet.sheet : null;
}
function getFontFaceRules() {
    const sheet = getFontFaceStyleSheet();
    if (sheet) {
        // @ts-ignore: rule iterator
        const rules = [...sheet.cssRules];
        const items = [];
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            if (rule instanceof CSSFontFaceRule) {
                items.push({ rule, index: i });
            }
        }
        return items;
    }
    return [];
}
function getFontFaceRulesMatchingResource(fontFamilyName, options) {
    const rules = getFontFaceRules();
    return rules.filter(({ rule }) => {
        return (rule.style.fontFamily === fontFamilyName &&
            (options && options.display ? options.display === rule.style.fontDisplay : true));
    });
}
exports.default = {
    get name() {
        return 'ExpoFontLoader';
    },
    async unloadAllAsync() {
        if (!expo_modules_core_1.Platform.isDOMAvailable)
            return;
        const element = document.getElementById(ID);
        if (element && element instanceof HTMLStyleElement) {
            document.removeChild(element);
        }
    },
    async unloadAsync(fontFamilyName, options) {
        const sheet = getFontFaceStyleSheet();
        if (!sheet)
            return;
        const items = getFontFaceRulesMatchingResource(fontFamilyName, options);
        for (const item of items) {
            sheet.deleteRule(item.index);
        }
    },
    async loadAsync(fontFamilyName, resource) {
        if (!expo_modules_core_1.Platform.isDOMAvailable) {
            return;
        }
        const canInjectStyle = document.head && typeof document.head.appendChild === 'function';
        if (!canInjectStyle) {
            throw new expo_modules_core_1.CodedError('ERR_WEB_ENVIRONMENT', `The browser's \`document.head\` element doesn't support injecting fonts.`);
        }
        const style = _createWebStyle(fontFamilyName, resource);
        document.head.appendChild(style);
        if (!isFontLoadingListenerSupported()) {
            return;
        }
        return new fontfaceobserver_1.default(fontFamilyName, { display: resource.display }).load();
    },
};
const ID = 'expo-generated-fonts';
function getStyleElement() {
    const element = document.getElementById(ID);
    if (element && element instanceof HTMLStyleElement) {
        return element;
    }
    const styleElement = document.createElement('style');
    styleElement.id = ID;
    styleElement.type = 'text/css';
    return styleElement;
}
function _createWebStyle(fontFamily, resource) {
    const fontStyle = `@font-face {
    font-family: ${fontFamily};
    src: url(${resource.uri});
    font-display: ${resource.display || Font_types_1.FontDisplay.AUTO};
  }`;
    const styleElement = getStyleElement();
    // @ts-ignore: TypeScript does not define HTMLStyleElement::styleSheet. This is just for IE and
    // possibly can be removed if it's unnecessary on IE 11.
    if (styleElement.styleSheet) {
        const styleElementIE = styleElement;
        styleElementIE.styleSheet.cssText = styleElementIE.styleSheet.cssText
            ? styleElementIE.styleSheet.cssText + fontStyle
            : fontStyle;
    }
    else {
        const textNode = document.createTextNode(fontStyle);
        styleElement.appendChild(textNode);
    }
    return styleElement;
}
function isFontLoadingListenerSupported() {
    const { userAgent } = window.navigator;
    // WebKit is broken https://github.com/bramstein/fontfaceobserver/issues/95
    const isIOS = !!userAgent.match(/iPad|iPhone/i);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // Edge is broken https://github.com/bramstein/fontfaceobserver/issues/109#issuecomment-333356795
    const isEdge = userAgent.includes('Edge');
    // Internet Explorer
    const isIE = userAgent.includes('Trident');
    // Firefox
    const isFirefox = userAgent.includes('Firefox');
    return !isSafari && !isIOS && !isEdge && !isIE && !isFirefox;
}
//# sourceMappingURL=ExpoFontLoader.web.js.map
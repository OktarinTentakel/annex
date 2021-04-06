/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Capabilities
 */
const MODULE_NAME="Capabilities";import{hasValue,isA}from"./basic.js";export function browserSupportsHistoryManipulation(){return hasValue(window.history)&&isA(window.history.pushState,"function")&&isA(window.history.replaceState,"function")}
//# sourceMappingURL=capabilities.js.map

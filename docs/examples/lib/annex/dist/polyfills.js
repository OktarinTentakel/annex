/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Polyfills
 */
const MODULE_NAME="Polyfills";import{assert,hasValue,isA}from"./basic.js";export function polyfillElementMatches(){const t=polyfillElementMatches.name;Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector??Element.prototype.webkitMatchesSelector??null),assert(hasValue(Element.prototype.matches),`Polyfills:${t} | browser does not support Element.matches`)}export function polyfillCustomEvent(){if(isA(window.CustomEvent,"function"))return!1;const t=function(t,e){e=e??{bubbles:!1,cancelable:!1,detail:void 0};const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),o};t.prototype=window.Event.prototype,window.CustomEvent=t}
//# sourceMappingURL=polyfills.js.map

/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Polyfills
 */
const MODULE_NAME="Polyfills";import{assert,hasValue,isA,orDefault}from"./basic.js";import{createFetchRequest}from"./requests.js";export function polyfillFetch(e=!1){!(e=orDefault(e,!1,"bool"))&&isA(window.fetch,"function")||(window.fetch=function(e,t=null){return createFetchRequest(e,t).execute()})}export function polyfillElementMatches(){Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector??Element.prototype.webkitMatchesSelector??null),assert(hasValue(Element.prototype.matches),"Polyfills:polyfillElementMatches | browser does not support Element.matches")}export function polyfillCustomEvent(){if(isA(window.CustomEvent,"function"))return!1;const e=function(e,t){t=t??{bubbles:!1,cancelable:!1,detail:void 0};const o=document.createEvent("CustomEvent");return o.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),o};e.prototype=window.Event.prototype,window.CustomEvent=e}
//# sourceMappingURL=polyfills.js.map

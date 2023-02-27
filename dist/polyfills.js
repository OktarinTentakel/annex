/*!
 * annex v0.1.1-beta
 */
/*!
 * Module Polyfills
 */
const MODULE_NAME="Polyfills";import{assert,hasValue,isA,orDefault}from"./basic.js";import{createFetchRequest}from"./requests.js";export function polyfillFetch(t=!1){!(t=orDefault(t,!1,"bool"))&&isA(window.fetch,"function")||(window.fetch=function(t,e=null){return createFetchRequest(t,e).execute()})}export function polyfillElementMatches(){Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector??Element.prototype.webkitMatchesSelector??null),assert(hasValue(Element.prototype.matches),"Polyfills:polyfillElementMatches | browser does not support Element.matches")}export function polyfillCustomEvent(){if(isA(window.CustomEvent,"function"))return!1;const t=function(t,e){e=e??{bubbles:!1,cancelable:!1,detail:void 0};const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),o};t.prototype=window.Event.prototype,window.CustomEvent=t}export function polyfillArrayAt(){if(isA(Array.prototype.at,"function"))return!1;Object.defineProperty(Array.prototype,"at",{value:function(t){if((t=Math.trunc(t)||0)<0&&(t+=this.length),!(t<0||t>=this.length))return this[t]},writable:!0,enumerable:!1,configurable:!0})}
//# sourceMappingURL=polyfills.js.map

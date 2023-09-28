/*!
 * @oktarintentakel/annex v0.1.12-beta
 */
/*!
 * Module Timers
 */
const MODULE_NAME="Timers";import{orDefault,isFunction,assert,hasValue,hasMembers}from"./basic.js";export function schedule(e,t,n=null){return e=orDefault(e,1,"int"),assert(e>=0,"Timers:schedule | ms must be positive"),assert(isFunction(t),"Timers:schedule | callback must be a function"),hasValue(n)&&countermand(n),{id:window.setTimeout(t,e),type:"timeout"}}export function pschedule(e,t,n=null){e=orDefault(e,1,"int"),assert(e>=0,"Timers:pschedule | ms must be positive"),assert(isFunction(t),"Timers:pschedule | callback must be a function"),hasValue(n)&&hasMembers(n,["id","type"])?(countermand(n),n.precise=!0):n={id:-1,type:"timeout",precise:!0};const i=Date.now();let o=e;const s=function(){o>0?(o-=Date.now()-i,n.id=window.setTimeout(s,o>10?o:10)):t()};return n.id=window.setTimeout(s,o),n}export function reschedule(e,t,n){return t=orDefault(t,1,"int"),assert(t>=0,"Timers:reschedule | ms must be positive"),assert(isFunction(n),"Timers:reschedule | callback must be a function"),hasValue(e)&&hasValue(e.precise)&&e.precise?pschedule(t,n,e):schedule(t,n,e)}export function loop(e,t,n=null){return e=orDefault(e,1,"int"),assert(e>=0,"Timers:loop | ms must be positive"),assert(isFunction(t),"Timers:loop | callback must be a function"),hasValue(n)&&countermand(n,!0),{id:window.setInterval(t,e),type:"interval"}}export function ploop(e,t,n=null){e=orDefault(e,1,"int"),assert(e>=0,"Timers:ploop | ms must be positive"),assert(isFunction(t),"Timers:ploop | callback must be a function"),hasValue(n)&&hasMembers(n,["id","type"])?(countermand(n,!0),n.precise=!0):n={id:-1,type:"interval",precise:!0};let i=Date.now(),o=e;const s=function(){o>0?(o-=Date.now()-i,n.id=window.setTimeout(s,o>10?o:10)):(t(),i=Date.now(),o=e,n.id=window.setTimeout(s,o))};return n.id=window.setTimeout(s,o),n}export function countermand(e,t=!1){t=orDefault(t,!1,"bool"),hasValue(e)&&(hasMembers(e,["id","type"])?"interval"===e.type?window.clearInterval(e.id):window.clearTimeout(e.id):t?window.clearInterval(e):window.clearTimeout(e))}export function requestAnimationFrame(e){assert(isFunction(e),"Timers:requestAnimationFrame | callback is no function");const t=window.requestAnimationFrame??window.webkitRequestAnimationFrame??window.mozRequestAnimationFrame??window.msRequestAnimationFrame??function(e){return schedule(16,e)};return t(e)}export function cancelAnimationFrame(e){const t=window.requestAnimationFrame??window.webkitRequestAnimationFrame??window.mozRequestAnimationFrame??window.msRequestAnimationFrame;let n=window.cancelAnimationFrame??window.mozCancelAnimationFrame;return hasValue(t)||(n=countermand),n(e)}export function waitForRepaint(e){assert(isFunction(e),"Timers:waitForRepaint | callback is no function");const t={};return t.outer=requestAnimationFrame((function(){t.inner=requestAnimationFrame(e)})),t}
//# sourceMappingURL=timers.js.map

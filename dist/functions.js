/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Functions
 */
const MODULE_NAME="Functions";import{orDefault,isA,isPlainObject,assert,hasValue}from"./basic.js";import{schedule,reschedule}from"./timers.js";export function throttle(t,n,e=!1,s=!1){t=orDefault(t,0,"int"),e=orDefault(e,!1,"bool"),s=orDefault(s,!1,"bool"),assert(t>0,"Functions:throttle | ms must be > 0"),assert(isA(n,"function"),"Functions:throttle | no function given");let r=!1,o=0;return function(){const i=Array.from(arguments);r?0===o?(o++,n.apply(this,i)):o++:(r=!0,e||o++,n.apply(this,i),schedule(t,(()=>{s&&o>1&&n.apply(this,i),r=!1,o=0})))}}export function debounce(t,n){let e;return t=orDefault(t,0,"int"),assert(t>0,"Functions:debounce | ms must be > 0"),assert(isA(n,"function"),"Functions:debounce | no function given"),function(){e=reschedule(e,t,(()=>{n.apply(this,Array.from(arguments))}))}}export function defer(t,n=1){return n=orDefault(n,1,"int"),assert(isA(t,"function"),"Functions:defer | no function given"),assert(n>0,"Functions:defer | delay must be > 0"),function(){return schedule(n,(()=>{t.apply(this,Array.from(arguments))})).id}}export function kwargs(t,n=null){n=isPlainObject(n)?n:{},assert(isA(t,"function"),"Functions:kwargs | no function given");const e=t.toString().match(/\(([^)]+)/)[1],s=e?e.split(",").map((t=>`${t}`.trim())):[];return assert(s.length>0,`Functions:kwargs | could not identify parameter names in "${t.toString()}" using parameter string "${e}"`),function(){const e=[];return Array.from(arguments).forEach(((t,n)=>{!isPlainObject(t)||hasValue(t.kwargs)&&!t.kwargs?e[n]=t:s.forEach(((n,s)=>{hasValue(t[n])&&(e[s]=t[n])}))})),s.forEach(((t,s)=>{!hasValue(e[s])&&hasValue(n[t])&&(e[s]=n[t])})),t.apply(this,e)}}
//# sourceMappingURL=functions.js.map
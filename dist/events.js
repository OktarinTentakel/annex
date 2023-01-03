/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Events
 */
const MODULE_NAME="Events";import{assert,isA,isEventTarget,isPlainObject,orDefault,hasValue,isEmpty,isSelector}from"./basic.js";import{slugify}from"./strings.js";import{removeFrom}from"./arrays.js";import{isInDom}from"./elements.js";export const EVENT_MAP=new Map;const DEFAULT_NAMESPACE="__default",EVENT_OPTION_SUPPORT={capture:!1,once:!1,passive:!1,signal:!1};try{const e={get capture(){return EVENT_OPTION_SUPPORT.capture=!0,!1},get once(){return EVENT_OPTION_SUPPORT.once=!0,!1},get passive(){return EVENT_OPTION_SUPPORT.passive=!0,!1},get signal(){return EVENT_OPTION_SUPPORT.signal=!0,!1}};window.addEventListener("test",null,e),window.removeEventListener("test",null,e)}catch(t){}function prepareEventMethodBaseParams(e,t,n,a,r=!1){t=orDefault(t,[],"arr"),assert(t.length>0,`Events:${e} | no targets provided`),n=orDefault(n,[],"arr"),assert(n.length>0,`Events:${e} | no events provided`),r&&!hasValue(a)||assert(isA(a,"function"),`Events:${e} | handler is not a function`);let s=!0,l=!0;return t.forEach(((e,n)=>{if(isA(e,"string")){const a=n>0?t[n-1]:null;l&&=isSelector(e)&&isEventTarget(a)}else s&&=isEventTarget(e)})),assert(s,`Events:${e} | not all targets are event targets`),assert(l,`Events:${e} | not all delegated targets are a selector or have an ancestor`),n=n.map((e=>e.replace(".__default",".-default-ns"))).map((e=>slugify(e,{".":"___dot___","*":"___star___"}))).map((e=>e.replaceAll("___dot___","."))).map((e=>e.replaceAll("___star___","*"))).map((e=>e.replace(".-default-ns",".__default"))),{targets:t,events:n,handler:a}}function prepareEventMethodAdditionalTargetInfo(e,t,n){const a=n-1>=0?t[n-1]:null,r=n<t.length-1?t[n+1]:null,s=isSelector(r),l=isSelector(t[n]);return assert(!l||l&&isEventTarget(a),`Events:${e} | delegation has no ancestor`),{prevTarget:a,nextTarget:r,hasDelegation:s,isDelegation:l}}function prepareEventMethodEventInfo(e,t=null,n=null){const a=e.replace(".","/////").split("/////");return{event:isEmpty(a[0])||"*"===a[0]?n:a[0],namespace:isEmpty(a[1])||"*"===a[1]?t:a[1]}}function gatherTargetEvents(e,t=null,n=null,a=null){const r=EVENT_MAP.get(e);assert(isPlainObject(r),`Events:gatherTargetEvents | invalid target "${e}"`);const s={};if(hasValue(t)||hasValue(n))if(hasValue(n))if(hasValue(t)){const e=r[t];hasValue(e)&&hasValue(e[n])&&(!hasValue(a)||hasValue(e[n].delegations[a]))&&(hasValue(s[t])||(s[t]=new Set([])),s[t].add(n))}else Object.keys(r).forEach((e=>{const t=r[e];!hasValue(t[n])||hasValue(a)&&!hasValue(t[n].delegations[a])||(hasValue(s[e])||(s[e]=new Set([])),s[e].add(n))}));else{const e=r[t];hasValue(e)&&(s[t]=new Set([]),Object.keys(r[t]).forEach((n=>{hasValue(a)&&!hasValue(e[n].delegations[a])||s[t].add(n)})))}else Object.keys(r).forEach((e=>{s[e]=new Set([]),Object.keys(r[e]).forEach((t=>{hasValue(a)&&!hasValue(r[e][t].delegations[a])||s[e].add(t)}))}));return s}function cleanUpEventMap(e){e=hasValue(e)?new Set([].concat(e)):null;const t=[];EVENT_MAP.forEach(((n,a)=>{hasValue(e)&&!e.has(a)||(Object.keys(n).forEach((e=>{Object.keys(n[e]).forEach((t=>{const a=n[e][t];let r=a.handlers.length;Object.keys(a.delegations).forEach((e=>{const t=a.delegations[e].handlers.length;r+=t,0===t&&delete a.delegations[e]})),0===r&&delete n[e][t]})),0===Object.keys(n[e]).length&&delete n[e]})),0===Object.keys(n).length&&t.push(a))})),t.forEach((e=>{EVENT_MAP.delete(e)}))}function createDelegatedHandler(e,t){return function(n){const a=`${e}`;(hasValue(n.target?.matches)?n.target.matches(a):isEventTarget(n.syntheticTarget)||isA(n.syntheticTarget,"array")&&isSelector(n.syntheticTarget[1])?isEventTarget(n.syntheticTarget)?n.syntheticTarget.matches(a):n.syntheticTarget[1]===a:null)&&t(n)}}function createHandlerRemover(e,t,n,a,r=null){const s="createHandlerRemover";let l=EVENT_MAP.get(e)?.[t]?.[n];return hasValue(r)&&(assert(isSelector(r),`Events:${s} | invalid delegation "${r}"`),l=l.delegations[`${r}`]),assert(isPlainObject(l),`Events:${s} | invalid handlerScope`),function(){const t=l.handlers.filter((e=>e.handler===a));l.handlers=removeFrom(l.handlers,t),t.forEach((t=>{e.removeEventListener(n,t.action)})),cleanUpEventMap(e)}}function createSelfRemovingHandler(e,t,n,a,r=null){return function(s){a(s),createHandlerRemover(e,t,n,a,r)()}}function removeLocatedHandler(e,t,n,a,r=null){const s="removeLocatedHandler",l=EVENT_MAP.get(e)?.[t]?.[n];let o;if(assert(isPlainObject(l),`Events:${s} | invalid targetScope`),hasValue(r)){const e=l.delegations[`${r}`];assert(isPlainObject(e),`Events:${s} | invalid delegation "${r}"`),o=e}else o=l;const c=o.handlers.filter((e=>!hasValue(a)||a===e.handler));return o.handlers=removeFrom(o.handlers,c),c.forEach((t=>{e.removeEventListener(n,t.action)})),c.length}function removeHandlers(e,t=null,n=null,a=null,r=null){const s=gatherTargetEvents(e,t,n,r);let l=0;return Object.keys(s).forEach((t=>{Array.from(s[t]).forEach((n=>{l+=removeLocatedHandler(e,t,n,a,r)}))})),l}function removeDelegatedHandlers(e,t,n=null,a=null,r=null){return removeHandlers(e,n,a,r,t)}function pauseLocatedHandlers(e,t,n,a,r=null,s=!0){const l="pauseLocatedHandlers",o=EVENT_MAP.get(e)?.[t]?.[n];let c;if(assert(isPlainObject(o),`Events:${l} | invalid targetScope`),hasValue(r)){const e=o.delegations[`${r}`];assert(isPlainObject(e),`Events:${l} | invalid delegation "${r}"`),c=e}else c=o;const i=c.handlers.filter((e=>!hasValue(a)||a===e.handler));return i.forEach((e=>{e.paused=!!s})),i.length}function pauseHandlers(e,t=null,n=null,a=null,r=null,s=!0){const l=gatherTargetEvents(e,t,n,r);let o=0;return Object.keys(l).forEach((t=>{Array.from(l[t]).forEach((n=>{o+=pauseLocatedHandlers(e,t,n,a,r,s)}))})),o}function pauseDelegatedHandlers(e,t,n=null,a=null,r=null,s=!0){return pauseHandlers(e,n,a,r,t,s)}function createPauseAwareAction(e,t){return function(n){e.paused||t(n)}}function compileEventListenerOptions(e){if(isA(e,"boolean"))return e;if(!isA(e,"object"))return null;const t={};return Object.keys(EVENT_OPTION_SUPPORT).forEach((n=>{EVENT_OPTION_SUPPORT[n]&&hasValue(e[n])&&(t[n]=e[n])})),!(0!==Object.keys(t).length||!e.capture)||t}function createSyntheticEvent(e,t=null,n=null,a=null,r=null,s=null,l=null,o=null){let c;return e=`${e}`,a=orDefault(a,!1,"bool"),r=orDefault(r,a,"bool"),o=isPlainObject(o)?o:{},isA(l,"function")?(isPlainObject(n)&&console.warn(`Events:createSyntheticEvent | can't add payload to event "${l.name}", skipping`),c=new l(e,{bubbles:a,cancelable:r,...o})):c=isPlainObject(n)?new CustomEvent(e,{detail:n,bubbles:a,cancelable:r,...o}):new CustomEvent(e,{bubbles:a,cancelable:r,...o}),hasValue(t)&&(c.namespace=`${t}`),isEventTarget(s)?(c.syntheticTarget=s,c.syntheticTargetElements=[s]):isA(s,"array")&&isEventTarget(s[0])&&isSelector(s[1])&&(c.syntheticTarget=s,Object.defineProperty(c,"syntheticTargetElements",{get:()=>Array.from(s[0].querySelectorAll(`${s[1]}`))})),c}export function on(e,t,n,a=null,r=!1){({targets:e,events:t,handler:n}=prepareEventMethodBaseParams("on",e,t,n)),r=!!r||!!a?.once,delete a?.once;const s=[];return e.forEach(((l,o)=>{const{prevTarget:c,hasDelegation:i,isDelegation:u}=prepareEventMethodAdditionalTargetInfo("on",e,o);let E=EVENT_MAP.get(l);u?E=EVENT_MAP.get(c):hasValue(E)||(EVENT_MAP.set(l,{__default:{}}),E=EVENT_MAP.get(l)),i||t.forEach((e=>{const{event:t,namespace:o}=prepareEventMethodEventInfo(e,"__default");hasValue(E[o])||(E[o]={}),hasValue(E[o][t])||(E[o][t]={target:u?c:l,handlers:[],delegations:{}});const i=E[o][t];let h,d,g;u?(hasValue(i.delegations[l])||(i.delegations[l]={handlers:[]}),h=i.delegations[l],d=createDelegatedHandler(l,r?createSelfRemovingHandler(i.target,o,t,n,l):n),g=createHandlerRemover(i.target,o,t,n,l)):(h=i,d=r?createSelfRemovingHandler(i.target,o,t,n):n,g=createHandlerRemover(i.target,o,t,n));const f={handler:n,remover:g,paused:!1};f.action=createPauseAwareAction(f,d),h.handlers=h.handlers.concat(f);const v=compileEventListenerOptions(a);hasValue(v)?i.target.addEventListener(t,f.action,v):i.target.addEventListener(t,f.action),s.push(g)}))})),s.length>1?function(){s.forEach((e=>e()))}:s.length>0?s[0]:null}export function once(e,t,n,a=null){return on(e,t,n,a,!0)}export function off(e,t,n=null){({targets:e,events:t,handler:n}=prepareEventMethodBaseParams("off",e,t,n,!0));let a=0;return e.forEach(((r,s)=>{const{prevTarget:l,hasDelegation:o,isDelegation:c}=prepareEventMethodAdditionalTargetInfo("off",e,s);if(!o){const e=c?EVENT_MAP.get(l):EVENT_MAP.get(r);hasValue(e)&&(t.forEach((e=>{const{event:t,namespace:s}=prepareEventMethodEventInfo(e);a+=c?removeDelegatedHandlers(l,r,s,t,n):removeHandlers(r,s,t,n)})),cleanUpEventMap(c?l:r))}})),a}export function pause(e,t,n=null,a=!0){const r="pause";({targets:e,events:t,handler:n}=prepareEventMethodBaseParams(r,e,t,n,!0));let s=0;return e.forEach(((l,o)=>{const{prevTarget:c,hasDelegation:i,isDelegation:u}=prepareEventMethodAdditionalTargetInfo(r,e,o);if(!i){const e=u?EVENT_MAP.get(c):EVENT_MAP.get(l);hasValue(e)&&t.forEach((e=>{const{event:t,namespace:r}=prepareEventMethodEventInfo(e);s+=u?pauseDelegatedHandlers(c,l,r,t,n,a):pauseHandlers(l,r,t,n,null,a)}))}})),s}export function resume(e,t,n=null){return pause(e,t,n,!1)}export function fire(e,t,n=null){const a="fire";({targets:e,events:t}=prepareEventMethodBaseParams(a,e,t,null,!0));let r=0;return e.forEach(((s,l)=>{const{prevTarget:o,hasDelegation:c,isDelegation:i}=prepareEventMethodAdditionalTargetInfo(a,e,l);if(!c){const e=i?EVENT_MAP.get(o):EVENT_MAP.get(s);hasValue(e)&&t.forEach((t=>{const{event:a,namespace:l}=prepareEventMethodEventInfo(t);let c;c=i?gatherTargetEvents(o,l,a,s):gatherTargetEvents(s,l,a),Object.keys(c).forEach((t=>{Array.from(c[t]).forEach((a=>{const l=i?e[t][a].delegations[s]:e[t][a],c=createSyntheticEvent(a,t,n,!1,!1,i?[o,s]:s);l.handlers.forEach((e=>{e.action(c),r++}))}))}))}))}})),r}export function emit(e,t,n=null,a=null,r=null){const s="emit";({targets:e,events:t}=prepareEventMethodBaseParams(s,e,t,null,!0));let l=0;return e.forEach(((o,c)=>{const{prevTarget:i,hasDelegation:u,isDelegation:E}=prepareEventMethodAdditionalTargetInfo(s,e,c);u||t.forEach((e=>{const{event:t,namespace:c}=prepareEventMethodEventInfo(e);assert(hasValue(t),`Events:${s} | missing event name`),E?Array.from(i.querySelectorAll(o)).forEach((e=>{e.dispatchEvent(createSyntheticEvent(t,c,n,!0,!0,null,a,r)),l++})):(o.dispatchEvent(createSyntheticEvent(t,c,n,!0,!0,null,a,r)),l++)}))})),l}export function offDetachedElements(e){0===(e=orDefault(e,[],"arr")).length&&(e=Array.from(EVENT_MAP.keys()));let t=0;return e.forEach((e=>{isA(e,"htmlelement")&&!isInDom(e)&&EVENT_MAP.has(e)&&(t++,off(e,"*"))})),t}
//# sourceMappingURL=events.js.map

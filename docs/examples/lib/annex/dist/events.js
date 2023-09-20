/*!
 * @oktarintentakel/annex v0.1.9-beta
 */
/*!
 * Module Events
 */
const MODULE_NAME="Events";import{assert,isFunction,isString,isArray,isBoolean,isObject,isWindow,isEventTarget,isPlainObject,isElement,orDefault,hasValue,isEmpty,isSelector}from"./basic.js";import{slugify}from"./strings.js";import{removeFrom}from"./arrays.js";import{detectInteractionType}from"./context.js";import{warn}from"./logging.js";export const EVENT_MAP=new Map,POST_MESSAGE_MAP=new Map;const DEFAULT_NAMESPACE="__default",SWIPE_DIRECTIONS=["up","right","down","left"],SWIPE_HANDLERS=new WeakMap,SWIPE_TOUCH={startX:0,startY:0,endX:0,endY:0},EVENT_OPTION_SUPPORT={capture:!1,once:!1,passive:!1,signal:!1};try{const e={get capture(){return EVENT_OPTION_SUPPORT.capture=!0,!1},get once(){return EVENT_OPTION_SUPPORT.once=!0,!1},get passive(){return EVENT_OPTION_SUPPORT.passive=!0,!1},get signal(){return EVENT_OPTION_SUPPORT.signal=!0,!1}};window.addEventListener("test",null,e),window.removeEventListener("test",null,e)}catch(t){}function prepareEventMethodBaseParams(e,t,n,a,s=!1){t=orDefault(t,[],"arr"),assert(t.length>0,`Events:${e} | no targets provided`),n=orDefault(n,[],"arr"),assert(n.length>0,`Events:${e} | no events provided`),s&&!hasValue(a)||assert(isFunction(a),`Events:${e} | handler is not a function`);let r=!0,o=!0;return t.forEach(((e,n)=>{if(isString(e)){const a=n>0?t[n-1]:null;o&&=isSelector(e)&&isEventTarget(a)}else r&&=isEventTarget(e)})),assert(r,`Events:${e} | not all targets are event targets`),assert(o,`Events:${e} | not all delegated targets are a selector or have an ancestor`),n=n.map((e=>e.replace(".__default",".-default-ns"))).map((e=>slugify(e,{".":"___dot___","*":"___star___"}))).map((e=>e.replaceAll("___dot___","."))).map((e=>e.replaceAll("___star___","*"))).map((e=>e.replace(".-default-ns",".__default"))),{targets:t,events:n,handler:a}}function prepareEventMethodAdditionalTargetInfo(e,t,n){const a=n-1>=0?t[n-1]:null,s=n<t.length-1?t[n+1]:null,r=isSelector(s),o=isSelector(t[n]);return assert(!o||o&&isEventTarget(a),`Events:${e} | delegation has no ancestor`),{prevTarget:a,nextTarget:s,hasDelegation:r,isDelegation:o}}function prepareEventMethodEventInfo(e,t=null,n=null){const a=e.replace(".","/////").split("/////");return{event:isEmpty(a[0])||"*"===a[0]?n:a[0],namespace:isEmpty(a[1])||"*"===a[1]?t:a[1]}}function gatherTargetEvents(e,t=null,n=null,a=null){const s=EVENT_MAP.get(e);assert(isPlainObject(s),`Events:gatherTargetEvents | invalid target "${e}"`);const r={};if(hasValue(t)||hasValue(n))if(hasValue(n))if(hasValue(t)){const e=s[t];hasValue(e)&&hasValue(e[n])&&(!hasValue(a)||hasValue(e[n].delegations[a]))&&(hasValue(r[t])||(r[t]=new Set([])),r[t].add(n))}else Object.keys(s).forEach((e=>{const t=s[e];!hasValue(t[n])||hasValue(a)&&!hasValue(t[n].delegations[a])||(hasValue(r[e])||(r[e]=new Set([])),r[e].add(n))}));else{const e=s[t];hasValue(e)&&(r[t]=new Set([]),Object.keys(s[t]).forEach((n=>{hasValue(a)&&!hasValue(e[n].delegations[a])||r[t].add(n)})))}else Object.keys(s).forEach((e=>{r[e]=new Set([]),Object.keys(s[e]).forEach((t=>{hasValue(a)&&!hasValue(s[e][t].delegations[a])||r[e].add(t)}))}));return r}function cleanUpEventMap(e){e=hasValue(e)?new Set([].concat(e)):null;const t=[];EVENT_MAP.forEach(((n,a)=>{hasValue(e)&&!e.has(a)||(Object.keys(n).forEach((e=>{Object.keys(n[e]).forEach((t=>{const a=n[e][t];let s=a.handlers.length;Object.keys(a.delegations).forEach((e=>{const t=a.delegations[e].handlers.length;s+=t,0===t&&delete a.delegations[e]})),0===s&&delete n[e][t]})),0===Object.keys(n[e]).length&&delete n[e]})),0===Object.keys(n).length&&t.push(a))})),t.forEach((e=>{EVENT_MAP.delete(e)}))}function createDelegatedHandler(e,t){return function(n){const a=`${e}`;(hasValue(n.target?.matches)?n.target.matches(a):isEventTarget(n.syntheticTarget)||isArray(n.syntheticTarget)&&isSelector(n.syntheticTarget[1])?isEventTarget(n.syntheticTarget)?n.syntheticTarget.matches(a):n.syntheticTarget[1]===a:null)&&t(n)}}function createHandlerRemover(e,t,n,a,s=null){const r="createHandlerRemover";let o=EVENT_MAP.get(e)?.[t]?.[n];return hasValue(s)&&(assert(isSelector(s),`Events:${r} | invalid delegation "${s}"`),o=o.delegations[`${s}`]),assert(isPlainObject(o),`Events:${r} | invalid handlerScope`),function(){const t=o.handlers.filter((e=>e.handler===a));o.handlers=removeFrom(o.handlers,t),t.forEach((t=>{e.removeEventListener(n,t.action)})),cleanUpEventMap(e)}}function createSelfRemovingHandler(e,t,n,a,s=null){return function(r){a(r),createHandlerRemover(e,t,n,a,s)()}}function removeLocatedHandler(e,t,n,a,s=null){const r="removeLocatedHandler",o=EVENT_MAP.get(e)?.[t]?.[n];let l;if(assert(isPlainObject(o),`Events:${r} | invalid targetScope`),hasValue(s)){const e=o.delegations[`${s}`];assert(isPlainObject(e),`Events:${r} | invalid delegation "${s}"`),l=e}else l=o;const c=l.handlers.filter((e=>!hasValue(a)||a===e.handler));return l.handlers=removeFrom(l.handlers,c),c.forEach((t=>{e.removeEventListener(n,t.action),e.removeEventListener(n,t.action,{capture:!0})})),c.length}function removeHandlers(e,t=null,n=null,a=null,s=null){const r=gatherTargetEvents(e,t,n,s);let o=0;return Object.keys(r).forEach((t=>{Array.from(r[t]).forEach((n=>{o+=removeLocatedHandler(e,t,n,a,s)}))})),o}function removeDelegatedHandlers(e,t,n=null,a=null,s=null){return removeHandlers(e,n,a,s,t)}function pauseLocatedHandlers(e,t,n,a,s=null,r=!0){const o="pauseLocatedHandlers",l=EVENT_MAP.get(e)?.[t]?.[n];let c;if(assert(isPlainObject(l),`Events:${o} | invalid targetScope`),hasValue(s)){const e=l.delegations[`${s}`];assert(isPlainObject(e),`Events:${o} | invalid delegation "${s}"`),c=e}else c=l;const i=c.handlers.filter((e=>!hasValue(a)||a===e.handler));return i.forEach((e=>{e.paused=!!r})),i.length}function pauseHandlers(e,t=null,n=null,a=null,s=null,r=!0){const o=gatherTargetEvents(e,t,n,s);let l=0;return Object.keys(o).forEach((t=>{Array.from(o[t]).forEach((n=>{l+=pauseLocatedHandlers(e,t,n,a,s,r)}))})),l}function pauseDelegatedHandlers(e,t,n=null,a=null,s=null,r=!0){return pauseHandlers(e,n,a,s,t,r)}function createPauseAwareAction(e,t){return function(n){e.paused||t(n)}}function compileEventListenerOptions(e){if(isBoolean(e))return e;if(!isObject(e))return null;const t={};return Object.keys(EVENT_OPTION_SUPPORT).forEach((n=>{EVENT_OPTION_SUPPORT[n]&&hasValue(e[n])&&(t[n]=e[n])})),!(0!==Object.keys(t).length||!e.capture)||t}function createSyntheticEvent(e,t=null,n=null,a=null,s=null,r=null,o=null,l=null){let c;return e=`${e}`,a=orDefault(a,!1,"bool"),s=orDefault(s,a,"bool"),l=isPlainObject(l)?l:{},isFunction(o)?(isPlainObject(n)&&console.warn(`Events:createSyntheticEvent | can't add payload to event "${o.name}", skipping`),c=new o(e,{bubbles:a,cancelable:s,...l})):c=isPlainObject(n)?new CustomEvent(e,{detail:n,bubbles:a,cancelable:s,...l}):new CustomEvent(e,{bubbles:a,cancelable:s,...l}),hasValue(t)&&(c.namespace=`${t}`),isEventTarget(r)?(c.syntheticTarget=r,c.syntheticTargetElements=[r]):isArray(r)&&isEventTarget(r[0])&&isSelector(r[1])&&(c.syntheticTarget=r,Object.defineProperty(c,"syntheticTargetElements",{get:()=>Array.from(r[0].querySelectorAll(`${r[1]}`))})),c}function updateSwipeTouch(e){const t=["touchstart","mousedown"].includes(e.type)?"start":"end";["touchstart","touchend"].includes(e.type)?(SWIPE_TOUCH[`${t}X`]=e.changedTouches[0].screenX,SWIPE_TOUCH[`${t}Y`]=e.changedTouches[0].screenY):(SWIPE_TOUCH[`${t}X`]=e.screenX,SWIPE_TOUCH[`${t}Y`]=e.screenY)}function resolvePostMessageTarget(e,t){return e=isWindow(e)?e:isWindow(e?.contentWindow)?e.contentWindow:null,assert(hasValue(e),`Events:${t} | no usable target`),e}function windowPostMessageHandler(e){const t=e.currentTarget,n=POST_MESSAGE_MAP.get(t),a=isEmpty(e.origin)?window.__AVA_ENV__?window.location.href:null:e.origin,s=e.data?.type;if(hasValue(n)){(hasValue(s)?[s]:Object.keys(n)).forEach((t=>{(n[t]??[]).forEach((t=>{"*"!==t.origin&&t.origin!==a||t.handler(e)}))}))}}function removePostMessageHandlers(e,t,n=null,a=null){if(hasValue(e[t])){const s=e[t].length;hasValue(n)||hasValue(a)?hasValue(n)&&!hasValue(a)?e[t]=e[t].filter((e=>e.origin!==n)):!hasValue(n)&&hasValue(a)?e[t]=e[t].filter((e=>e.handler!==a)):hasValue(n,a)&&(e[t]=e[t].filter((e=>e.origin!==n&&e.handler!==a))):e[t]=[];const r=e[t].length;return 0===e[t].length&&delete e[t],s-r}return 0}export function on(e,t,n,a=null,s=!1){({targets:e,events:t,handler:n}=prepareEventMethodBaseParams("on",e,t,n)),s=!!s||!!a?.once,delete a?.once;const r=[];return e.forEach(((o,l)=>{const{prevTarget:c,hasDelegation:i,isDelegation:u}=prepareEventMethodAdditionalTargetInfo("on",e,l);let d=EVENT_MAP.get(o);u?d=EVENT_MAP.get(c):hasValue(d)||(EVENT_MAP.set(o,{__default:{}}),d=EVENT_MAP.get(o)),i||t.forEach((e=>{const{event:t,namespace:l}=prepareEventMethodEventInfo(e,"__default");hasValue(d[l])||(d[l]={}),hasValue(d[l][t])||(d[l][t]={target:u?c:o,handlers:[],delegations:{}});const i=d[l][t];let E,h,g;u?(hasValue(i.delegations[o])||(i.delegations[o]={handlers:[]}),E=i.delegations[o],h=createDelegatedHandler(o,s?createSelfRemovingHandler(i.target,l,t,n,o):n),g=createHandlerRemover(i.target,l,t,n,o)):(E=i,h=s?createSelfRemovingHandler(i.target,l,t,n):n,g=createHandlerRemover(i.target,l,t,n));const f={handler:n,remover:g,paused:!1};f.action=createPauseAwareAction(f,h),E.handlers=E.handlers.concat(f);const p=compileEventListenerOptions(a);hasValue(p)?i.target.addEventListener(t,f.action,p):i.target.addEventListener(t,f.action),r.push(g)}))})),r.length>1?function(){r.forEach((e=>e()))}:r.length>0?r[0]:null}export function once(e,t,n,a=null){return on(e,t,n,a,!0)}export function off(e,t,n=null,a=!0){const s="off";({targets:e,events:t,handler:n}=prepareEventMethodBaseParams(s,e,t,n,!0)),a=orDefault(a,!0,"bool");let r=0;return e.forEach(((o,l)=>{const{prevTarget:c,hasDelegation:i,isDelegation:u}=prepareEventMethodAdditionalTargetInfo(s,e,l);if(!i){const e=u?EVENT_MAP.get(c):EVENT_MAP.get(o);t.forEach((t=>{const{event:l,namespace:i}=prepareEventMethodEventInfo(t);hasValue(e)?(r+=u?removeDelegatedHandlers(c,o,i,l,n):removeHandlers(o,i,l,n),cleanUpEventMap(u?c:o)):a&&(hasValue(n)?((u?c:o).removeEventListener(t,n),(u?c:o).removeEventListener(t,n,{capture:!0})):warn(`Events:${s} | native fallback event removal for "${t}" not possible, handler is missing`))}))}})),r}export function pause(e,t,n=null,a=!0){const s="pause";({targets:e,events:t,handler:n}=prepareEventMethodBaseParams(s,e,t,n,!0));let r=0;return e.forEach(((o,l)=>{const{prevTarget:c,hasDelegation:i,isDelegation:u}=prepareEventMethodAdditionalTargetInfo(s,e,l);if(!i){const e=u?EVENT_MAP.get(c):EVENT_MAP.get(o);hasValue(e)&&t.forEach((e=>{const{event:t,namespace:s}=prepareEventMethodEventInfo(e);r+=u?pauseDelegatedHandlers(c,o,s,t,n,a):pauseHandlers(o,s,t,n,null,a)}))}})),r}export function resume(e,t,n=null){return pause(e,t,n,!1)}export function fire(e,t,n=null){const a="fire";({targets:e,events:t}=prepareEventMethodBaseParams(a,e,t,null,!0));let s=0;return e.forEach(((r,o)=>{const{prevTarget:l,hasDelegation:c,isDelegation:i}=prepareEventMethodAdditionalTargetInfo(a,e,o);if(!c){const e=i?EVENT_MAP.get(l):EVENT_MAP.get(r);hasValue(e)&&t.forEach((t=>{const{event:a,namespace:o}=prepareEventMethodEventInfo(t);let c;c=i?gatherTargetEvents(l,o,a,r):gatherTargetEvents(r,o,a),Object.keys(c).forEach((t=>{Array.from(c[t]).forEach((a=>{const o=i?e[t][a].delegations[r]:e[t][a],c=createSyntheticEvent(a,t,n,!1,!1,i?[l,r]:r);o.handlers.forEach((e=>{e.action(c),s++}))}))}))}))}})),s}export function emit(e,t,n=null,a=null,s=null){const r="emit";({targets:e,events:t}=prepareEventMethodBaseParams(r,e,t,null,!0));let o=0;return e.forEach(((l,c)=>{const{prevTarget:i,hasDelegation:u,isDelegation:d}=prepareEventMethodAdditionalTargetInfo(r,e,c);u||t.forEach((e=>{const{event:t,namespace:c}=prepareEventMethodEventInfo(e);assert(hasValue(t),`Events:${r} | missing event name`),d?Array.from(i.querySelectorAll(l)).forEach((e=>{e.dispatchEvent(createSyntheticEvent(t,c,n,!0,!0,null,a,s)),o++})):(l.dispatchEvent(createSyntheticEvent(t,c,n,!0,!0,null,a,s)),o++)}))})),o}export function offDetachedElements(e){0===(e=orDefault(e,[],"arr")).length&&(e=Array.from(EVENT_MAP.keys()));let t=0;return e.forEach((e=>{isElement(e)&&!document.body.contains(e)&&EVENT_MAP.has(e)&&(t++,off(e,"*"))})),t}export function onSwipe(e,t,n,a=.2,s=!0,r="annex-swipe"){const o="onSwipe";t=orDefault(t,"","str"),a=orDefault(a,.2,"float"),s=orDefault(s,!0,"bool"),r=orDefault(r,"annex-swipe","str"),assert(SWIPE_DIRECTIONS.includes(t),`Events:${o} | unknown direction "${t}"`);let l=[`touchstart.${r}-${t}`,`touchend.${r}-${t}`];s||(l.push(`mousedown.${r}-${t}`),l.push(`mouseup.${r}-${t}`)),({targets:e,events:l,handler:n}=prepareEventMethodBaseParams(o,e,l,n));const c=n;n=s&&"touch"!==detectInteractionType()?()=>{}:c;const i=SWIPE_HANDLERS.get(c)??(e=>{if(updateSwipeTouch(e),["touchend","mouseup"].includes(e.type)){const r=e.currentTarget.offsetWidth,o=e.currentTarget.offsetHeight;s&&"touch"!==detectInteractionType()||!("up"===t&&SWIPE_TOUCH.startY>SWIPE_TOUCH.endY+o*a||"right"===t&&SWIPE_TOUCH.startX<SWIPE_TOUCH.endX-r*a||"down"===t&&SWIPE_TOUCH.startY<SWIPE_TOUCH.endY-o*a||"left"===t&&SWIPE_TOUCH.startX>SWIPE_TOUCH.endX+r*a)||n(e)}});return SWIPE_HANDLERS.set(c,i),on(e,l,i)}export function offSwipe(e,t=null,n=null,a="annex-swipe"){const s="offSwipe";t=orDefault(t,"","str"),a=orDefault(a,"annex-swipe","str"),assert(SWIPE_DIRECTIONS.concat("").includes(t),`Events:${s} | unknown direction "${t}"`);let r=0;return(""===t?SWIPE_DIRECTIONS:[t]).forEach((t=>{let o=[`touchstart.${a}-${t}`,`touchend.${a}-${t}`,`mousedown.${a}-${t}`,`mouseup.${a}-${t}`];if(({targets:e,events:o,handler:n}=prepareEventMethodBaseParams(s,e,o,n,!0)),hasValue(n)){const t=SWIPE_HANDLERS.get(n);hasValue(t)&&(r+=off(e,o,t))}else r+=off(e,o)})),r}export function onDomReady(e){if("loading"!==document.readyState)e();else{const t=()=>{document.removeEventListener("DOMContentLoaded",t),e()};document.addEventListener("DOMContentLoaded",t)}}export function onPostMessage(e,t,n,a){const s="onPostMessage";e=resolvePostMessageTarget(e,s),t=orDefault(t,"*","str"),n=`${n}`,assert(isFunction(a),`Events:${s} | handler is not a function`),hasValue(POST_MESSAGE_MAP.get(e))||(POST_MESSAGE_MAP.set(e,{}),e.addEventListener("message",windowPostMessageHandler));const r=POST_MESSAGE_MAP.get(e);return hasValue(r[n])||(r[n]=[]),r[n].push({handler:a,origin:t}),()=>{offPostMessage(e,t,n,a)}}export function offPostMessage(e,t=null,n=null,a=null,s=!0){const r="offPostMessage";e=resolvePostMessageTarget(e,r),t=orDefault(t,null,"str"),n=orDefault(n,null,"str"),s=orDefault(s,!0,"bool"),hasValue(a)&&assert(isFunction(a),`Events:${r} | handler is not a function`);let o=0;const l=POST_MESSAGE_MAP.get(e);if(hasValue(l)){(hasValue(n)?[n]:Object.keys(l)).forEach((e=>{o+=removePostMessageHandlers(l,e,t,a)})),0===Object.keys(l).length&&POST_MESSAGE_MAP.delete(e)}else s&&(hasValue(a)?e.removeEventListener("message",a):warn(`Events:${r} | native fallback event removal for "${n}" not possible, handler is missing`));return hasValue(POST_MESSAGE_MAP.get(e))||e.removeEventListener("message",windowPostMessageHandler),o}export function emitPostMessage(e,t,n,a=null){e=resolvePostMessageTarget(e,"emitPostMessage"),t=orDefault(t,"*","str");const s={type:n=`${n}`};return hasValue(a)&&(s.payload=a),e.postMessage(s,t),e}
//# sourceMappingURL=events.js.map

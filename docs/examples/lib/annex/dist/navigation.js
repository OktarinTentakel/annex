/*!
 * @oktarintentakel/annex v0.1.11-beta
 */
/*!
 * Module Navigation
 */
const MODULE_NAME="Navigation";import{warn}from"./logging.js";import{hasValue,orDefault,isPlainObject,isEmpty,isArray,isWindow,isFunction,assert}from"./basic.js";import{createNode}from"./elements.js";import{browserSupportsHistoryManipulation}from"./context.js";export const HISTORY={current:{state:null,title:"",...getHostAndPathname()},popState:{listening:!1,callbacks:[],handler(t){const e={state:t.state,title:t.title,...getHostAndPathname()};HISTORY.popState.callbacks.forEach((o=>{o.stateful(t,e)})),HISTORY.current=e}}};function getHostAndPathname(){const t={host:void 0,pathname:void 0};try{t.host=window.location.host,t.pathname=window.location.pathname}catch(e){t.host=void 0,t.pathname=void 0}return t}export function redirect(t,e=null,o=null,n=null,a=null){if(t=orDefault(t,null,"str"),e=isPlainObject(e)?e:null,o=orDefault(o,null,"str"),a=isPlainObject(a)?a:null,n=orDefault(n,null,"str"),hasValue(t)){const e=t.split("#",2);e.length>1&&(o=orDefault(o,e[1],"str"),t=t.replace(/#.+$/,""))}else t=window.location.href,isEmpty(window.location.hash)||(o=orDefault(o,window.location.hash.replace("#",""),"str"),t=t.replace(/#.+$/,""));const l=t.split("?",2);t=l[0];const i=orDefault(l[1],""),r={},s=[];i.length>0&&i.split("&").forEach((t=>{2===(t=t.split("=",2)).length?r[t[0]]=t[1]:r[t[0]]=null})),e=hasValue(e)?{...r,...e}:r;for(let t in e)hasValue(e[t])?s.push(`${t}=${encodeURIComponent(decodeURIComponent(e[t]))}`):s.push(t);const p=`${t}${s.length>0?`${-1===t.indexOf("?")?"?":"&"}${s.join("&")}`:""}${hasValue(o)?`#${o}`:""}`;if(hasValue(a)){const t={method:"post",action:p,"data-ajax":"false"};hasValue(n)&&(t.target=n);const e=createNode("form",t);for(let t in a)isArray(a[t])?a[t].forEach((o=>{e.appendChild(createNode("input",{type:"hidden",name:`${t}[]`,value:`${o}`}))})):e.appendChild(createNode("input",{type:"hidden",name:t,value:`${a[t]}`}));document.body.appendChild(e),e.submit(),document.body.removeChild(e)}else if(hasValue(n)){let e;try{e=new URL(t)}catch(o){e=new URL(t,window.location)}if(e.origin!==window.location.origin){const t=document.createElement("a");t.href=p,t.target=n,t.rel="noopener noreferrer",document.body.appendChild(t),t.click(),t.parentNode.removeChild(t)}else window.open(p,n)}else window.location.assign(p)}export function openTab(t,e=null,o=null,n=null){redirect(t,e,o,"_blank",n)}export function openWindow(t,e=null,o=null,n=!1){t=`${t}`,e=isPlainObject(e)?e:null,o=isWindow(o)?o:window,n=orDefault(n,!1,"bool");let a="";const l=[];if(hasValue(e))for(let t in e)"name"===t&&(a=e[t]),("name"!==t||n)&&([!0,1,"yes"].includes(e[t])?l.push(`${t}`):l.push(`${t}=${e[t]}`));return o.open(t,a,l.join(","))}export function reload(t=!0,e=!0){if(t=orDefault(t,!0,"bool"),e=orDefault(e,!0,"bool"),!t&&e){const t=document.createElement("form");t.method="post",t.action=window.location.href,document.body.appendChild(t),t.submit(),document.body.removeChild(t)}else t||e?window.location.reload():window.location.replace(window.location.href)}export function changeCurrentUrl(t,e=!1,o=null,n=null){t=orDefault(t,"","str"),e=orDefault(e,!1,"bool"),n=orDefault(n,"","str"),browserSupportsHistoryManipulation()?(e?window.history.pushState(o,n,t):window.history.replaceState(o,n,t),HISTORY.current={state:o,title:n,host:window.location.host,path:window.location.pathname}):warn(`${MODULE_NAME}:changeCurrentUrl | this browser does not support history api, skipping`)}export function onHistoryChange(t,e=!1,o=!1){const n="onHistoryChange";if(e=orDefault(e,!1,"bool"),o=orDefault(o,!1,"bool"),assert(isFunction(t),`${MODULE_NAME}:${n} | callback is no function`),browserSupportsHistoryManipulation()){e&&(HISTORY.popState.callbacks=[]);const n=function(e,n){o?t(HISTORY.current,n):t(n)};HISTORY.popState.callbacks.push({original:t,stateful:n}),HISTORY.popState.listening||(HISTORY.popState.listening=!0,window.addEventListener("popstate",HISTORY.popState.handler))}else warn(`${MODULE_NAME}:${n} | this browser does not support history api, skipping`)}export function offHistoryChange(t=null){if(hasValue(t)){assert(isFunction(t),`${MODULE_NAME}:offHistoryChange | callback is not a function`);const e=HISTORY.popState.callbacks.length;HISTORY.popState.callbacks=HISTORY.popState.callbacks.reduce(((e,o)=>(o.original!==t&&e.push(o),e)),[]);const o=HISTORY.popState.callbacks.length;return 0===o&&(window.removeEventListener("popstate",HISTORY.popState.handler),HISTORY.popState.listening=!1),e>o}return HISTORY.popState.callbacks=[],window.removeEventListener("popstate",HISTORY.popState.handler),HISTORY.popState.listening=!1,!0}
//# sourceMappingURL=navigation.js.map

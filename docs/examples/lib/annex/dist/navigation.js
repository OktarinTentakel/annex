/*!
 * @oktarintentakel/annex v0.1.2-beta
 */
/*!
 * Module Navigation
 */
const MODULE_NAME="Navigation";import{warn}from"./logging.js";import{hasValue,orDefault,isPlainObject,isEmpty,isA,assert}from"./basic.js";import{createNode}from"./elements.js";import{browserSupportsHistoryManipulation}from"./context.js";export const HISTORY={current:{state:null,title:"",host:window.location.host,path:window.location.pathname},popState:{listening:!1,callbacks:[],handler(t){const o={state:t.state,title:t.title,host:window.location.host,path:window.location.pathname};HISTORY.popState.callbacks.forEach((e=>{e.stateful(t,o)})),HISTORY.current=o}}};export function redirect(t,o=null,e=null,n=null,a=null){if(t=orDefault(t,null,"str"),o=isPlainObject(o)?o:null,e=orDefault(e,null,"str"),a=isPlainObject(a)?a:null,n=orDefault(n,null,"str"),hasValue(t)){const o=t.split("#",2);o.length>1&&(e=orDefault(e,o[1],"str"),t=t.replace(/#.+$/,""))}else t=window.location.href,isEmpty(window.location.hash)||(e=orDefault(e,window.location.hash.replace("#",""),"str"),t=t.replace(/#.+$/,""));const l=t.split("?",2);t=l[0];const i=orDefault(l[1],""),r={},s=[];i.length>0&&i.split("&").forEach((t=>{2===(t=t.split("=",2)).length?r[t[0]]=t[1]:r[t[0]]=null})),o=hasValue(o)?{...r,...o}:r;for(let t in o)hasValue(o[t])?s.push(`${t}=${encodeURIComponent(decodeURIComponent(o[t]))}`):s.push(t);const p=`${t}${s.length>0?`${-1===t.indexOf("?")?"?":"&"}${s.join("&")}`:""}${hasValue(e)?`#${e}`:""}`;if(hasValue(a)){const t={method:"post",action:p,"data-ajax":"false"};hasValue(n)&&(t.target=n);const o=createNode("form",t);for(let t in a)isA(a[t],"array")?a[t].forEach((e=>{o.appendChild(createNode("input",{type:"hidden",name:`${t}[]`,value:`${e}`}))})):o.appendChild(createNode("input",{type:"hidden",name:t,value:`${a[t]}`}));document.body.appendChild(o),o.submit(),document.body.removeChild(o)}else if(hasValue(n)){let o;try{o=new URL(t)}catch(e){o=new URL(t,window.location)}if(o.origin!==window.location.origin){const t=document.createElement("a");t.href=p,t.target=n,t.rel="noopener noreferrer",document.body.appendChild(t),t.click(),t.parentNode.removeChild(t)}else window.open(p,n)}else window.location.assign(p)}export function openTab(t,o=null,e=null,n=null){redirect(t,o,e,"_blank",n)}export function openWindow(t,o=null,e=null,n=!1){t=`${t}`,o=isPlainObject(o)?o:null,e=isA(e,"window")?e:window,n=orDefault(n,!1,"bool");let a="";const l=[];if(hasValue(o))for(let t in o)"name"===t&&(a=o[t]),("name"!==t||n)&&([!0,1,"yes"].includes(o[t])?l.push(`${t}`):l.push(`${t}=${o[t]}`));return e.open(t,a,l.join(","))}export function reload(t=!0,o=!0){if(t=orDefault(t,!0,"bool"),o=orDefault(o,!0,"bool"),!t&&o){const t=document.createElement("form");t.method="post",t.action=window.location.href,document.body.appendChild(t),t.submit(),document.body.removeChild(t)}else t||o?window.location.reload():window.location.replace(window.location.href)}export function changeCurrentUrl(t,o=!1,e=null,n=null){t=orDefault(t,"","str"),o=orDefault(o,!1,"bool"),n=orDefault(n,"","str"),browserSupportsHistoryManipulation()?(o?window.history.pushState(e,n,t):window.history.replaceState(e,n,t),HISTORY.current={state:e,title:n,host:window.location.host,path:window.location.pathname}):warn(`${MODULE_NAME}:changeCurrentUrl | this browser does not support history api, skipping`)}export function onHistoryChange(t,o=!1,e=!1){const n="onHistoryChange";if(o=orDefault(o,!1,"bool"),e=orDefault(e,!1,"bool"),assert(isA(t,"function"),`${MODULE_NAME}:${n} | callback is no function`),browserSupportsHistoryManipulation()){o&&(HISTORY.popState.callbacks=[]);const n=function(o,n){e?t(HISTORY.current,n):t(n)};HISTORY.popState.callbacks.push({original:t,stateful:n}),HISTORY.popState.listening||(HISTORY.popState.listening=!0,window.addEventListener("popstate",HISTORY.popState.handler))}else warn(`${MODULE_NAME}:${n} | this browser does not support history api, skipping`)}export function offHistoryChange(t=null){if(hasValue(t)){assert(isA(t,"function"),`${MODULE_NAME}:offHistoryChange | callback is not a function`);const o=HISTORY.popState.callbacks.length;HISTORY.popState.callbacks=HISTORY.popState.callbacks.reduce(((o,e)=>(e.original!==t&&o.push(e),o)),[]);const e=HISTORY.popState.callbacks.length;return 0===e&&(window.removeEventListener("popstate",HISTORY.popState.handler),HISTORY.popState.listening=!1),o>e}return HISTORY.popState.callbacks=[],window.removeEventListener("popstate",HISTORY.popState.handler),HISTORY.popState.listening=!1,!0}
//# sourceMappingURL=navigation.js.map

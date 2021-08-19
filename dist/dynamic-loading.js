/*!
 * annex v0.1.0-dev
 */
/*!
 * Module DynamicLoading
 */
const MODULE_NAME="DynamicLoading";import{hasValue,orDefault,isPlainObject,isA,assert}from"./basic.js";export function createFetchRequest(e,t){const s="createFetchRequest";return assert(hasValue(e),`DynamicLoading:${s} | no url given`),t=orDefault(t,{}),assert(isPlainObject(t),`DynamicLoading:${s} | options must be plain object`),t.method=orDefault(t.method,"GET"),t.method=["GET","POST","PUT","PATCH","HEAD","OPTIONS","DELETE"].includes(t.method.toUpperCase())?t.method.toUpperCase():"GET",{url:e,options:t,execute:()=>new Promise(((s,o)=>{const r=new XMLHttpRequest,n=[],a=[],i={},u=()=>({ok:parseInt(r.status,10)>=200&&parseInt(r.status,10)<=299,statusText:r.statusText,status:r.status,url:r.responseURL,text:()=>Promise.resolve(r.responseText),json:()=>Promise.resolve(r.responseText).then(JSON.parse),blob:()=>Promise.resolve(new Blob([r.response])),clone:u,headers:{keys:()=>n,entries:()=>a,get:e=>i[e.toLowerCase()],has:e=>e.toLowerCase()in i}});r.open(t.method,e,!0),r.onload=()=>{r.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,((e,t,s)=>{t=t.toLowerCase(),n.push(t),a.push([t,s]),i[t]=i[t]?`${i[t]},${s}`:s})),s(u())},r.onerror=o,r.withCredentials="include"===t.credentials;for(let e in t.headers)t.headers.hasOwnProperty(e)&&r.setRequestHeader(e,t.headers[e]);r.send(t.body||null)}))}}function _fetch(e,t){return createFetchRequest(e,t).execute()}export function polyfillFetch(e=!1){!(e=orDefault(e,!1,"bool"))&&isA(window.fetch,"function")||(window.fetch=_fetch)}
//# sourceMappingURL=dynamic-loading.js.map

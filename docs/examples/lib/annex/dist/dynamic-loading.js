/*!
 * annex v0.1.0-dev
 */
/*!
 * Module DynamicLoading
 */
const MODULE_NAME="DynamicLoading";import{warn}from"./logging.js";import{hasValue,orDefault,isPlainObject,isA,assert,Deferred}from"./basic.js";import{createNode,insertNode}from"./elements.js";export function createFetchRequest(e,t=null){const n="createFetchRequest";return assert(hasValue(e),`DynamicLoading:${n} | no url given`),t=orDefault(t,{}),assert(isPlainObject(t),`DynamicLoading:${n} | options must be plain object`),t.method=orDefault(t.method,"GET"),t.method=["GET","POST","PUT","PATCH","HEAD","OPTIONS","DELETE"].includes(t.method.toUpperCase())?t.method.toUpperCase():"GET",{url:e,options:t,execute(){const n=new Deferred,r=new XMLHttpRequest,s=[],o=[],l={},a=()=>({ok:parseInt(r.status,10)>=200&&parseInt(r.status,10)<=299,statusText:r.statusText,status:r.status,url:r.responseURL,text:()=>Promise.resolve(r.responseText),json:()=>Promise.resolve(r.responseText).then(JSON.parse),blob:()=>Promise.resolve(new Blob([r.response])),clone:a,headers:{keys:()=>s,entries:()=>o,get:e=>l[e.toLowerCase()],has:e=>e.toLowerCase()in l}});r.open(t.method,e,!0),r.onload=()=>{r.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,((e,t,n)=>{t=t.toLowerCase(),s.push(t),o.push([t,n]),l[t]=l[t]?`${l[t]},${n}`:n})),n.resolve(a())},r.onerror=n.reject,r.withCredentials="include"===t.credentials;for(let e in t.headers)t.headers.hasOwnProperty(e)&&r.setRequestHeader(e,t.headers[e]);return r.send(t.body||null),n.promise}}}function _fetch(e,t){return createFetchRequest(e,t).execute()}export function polyfillFetch(e=!1){!(e=orDefault(e,!1,"bool"))&&isA(window.fetch,"function")||(window.fetch=_fetch)}export function createJsonRequest(e,t=null){return{url:e,options:t,execute(n="object",r=null,s=null){const o=new Deferred;return createFetchRequest(e,t).execute().then((e=>{const t=(e.headers.get("content-type")??"").split(";")[0].trim();return"application/json"!==t&&warn(`DynamicLoading:createJsonRequest | content-type "${t}" is not valid for JSON, use "application/json"`),e.json()})).then((e=>{const t=createNode(`<script type="application/json">${JSON.stringify(e)}<\/script>`);if(null!==s&&t.setAttribute("data-id",`${s}`),hasValue(r)){const e=r.element??r,n=r.position??null;null===n?insertNode(e,t):insertNode(e,t,n)}o.resolve("element"===n?t:"raw"===n?JSON.stringify(e):e)})).catch((e=>{o.reject(e)})),o.promise}}}export function createJsRequest(e,t=null){return{url:e,options:t,execute(n="element",r=null,s=null,o=!1){const l="sourced-element",a=new Deferred,c=(e,t="")=>{if(null!==s&&e.setAttribute("data-id",`${s}`),hasValue(r)){const s=r.element??r,l=r.position??null;o||(e.onload=()=>{a.resolve("raw"===n?t:e)},e.onerror=e=>{a.reject(e)}),null===l?insertNode(s,e):insertNode(s,e,l)}(n!==l||n===l&&o)&&a.resolve("raw"===n?t:e)};return n===l?c(createNode("script",{src:e})):createFetchRequest(e,t).execute().then((e=>{const t=(e.headers.get("content-type")??"").split(";")[0].trim();return"application/javascript"!==t&&warn(`DynamicLoading:createJsRequest | content-type "${t}" is not valid for JavaScript, use "application/javascript"`),e.text()})).then((e=>{c(createNode("script",null,e),e)})).catch((e=>{a.reject(e)})),a.promise}}}export function createCssRequest(e,t=null){return{url:e,options:t,execute(n="element",r=null,s=null,o="all",l=!1){const a="sourced-element",c=new Deferred,i=(e,t="")=>{if(null!==s&&e.setAttribute("data-id",`${s}`),hasValue(r)){const s=r.element??r,o=r.position??null;l||(e.onload=()=>{c.resolve("raw"===n?t:e)},e.onerror=e=>{c.reject(e)}),null===o?insertNode(s,e):insertNode(s,e,o)}(n!==a||n===a&&l)&&c.resolve("raw"===n?t:e)};if(n===a){const t={href:e,rel:"stylesheet"};"all"!==o&&(t.media=o),i(createNode("link",t))}else createFetchRequest(e,t).execute().then((e=>{const t=(e.headers.get("content-type")??"").split(";")[0].trim();return"text/css"!==t&&warn(`DynamicLoading:createCssRequest | content-type "${t}" is not valid for CSS, use "text/css"`),e.text()})).then((e=>{i(createNode("style","all"!==o?{media:o}:null,e),e)})).catch((e=>{c.reject(e)}));return c.promise}}}export function createHtmlRequest(e,t=null){return{url:e,options:t,execute(n="element",r=null,s=null,o=null,l=!1){const a=new Deferred;return createFetchRequest(e,t).execute().then((e=>{const t=(e.headers.get("content-type")??"").split(";")[0].trim();return"text/html"!==t&&warn(`DynamicLoading:createHtmlRequest | content-type "${t}" is not valid for HTML, use "text/html"`),e.text()})).then((e=>{const t=e.toLowerCase(),c=t.includes("<html"),i=c||t.includes("<head")||t.includes("<body"),u=(new DOMParser).parseFromString(e,"text/html").documentElement;let d;d=hasValue(o)?l?u.querySelectorAll(`${o}`):u.querySelector(`${o}`):c?u:i?u.children:u.querySelector("body").children,hasValue(d?.length)&&(d=0===d.length?null:1===d.length?d.item(0):Array.from(d)),hasValue(o)&&(e="",hasValue(d)&&[].concat(d).forEach((t=>{e+=t.outerHTML}))),((e,t="")=>{if(hasValue(e)){const t=[].concat(e);if(null!==s&&t.forEach((e=>{e.setAttribute("data-id",`${s}`)})),hasValue(r)){const e=r.element??r,n=r.position??null;["before","beforebegin","prepend","afterbegin"].includes(n)&&t.reverse(),t.forEach((t=>{null===n?insertNode(e,t):insertNode(e,t,n)}))}}a.resolve("raw"===n?t:e)})(d,e)})).catch((e=>{a.reject(e)})),a.promise}}}
//# sourceMappingURL=dynamic-loading.js.map

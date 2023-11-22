/*!
 * @oktarintentakel/annex v0.1.17-beta
 */
/*!
 * Module Requests
 */
const MODULE_NAME="Requests";import{warn}from"./logging.js";import{hasValue,orDefault,isPlainObject,assert,Deferred,getType}from"./basic.js";import{merge}from"./objects.js";import{createNode,insertNode}from"./elements.js";import{schedule,countermand}from"./timers.js";export function createFetchRequest(e,t=null,s=!1){const n="createFetchRequest";return assert(hasValue(e),`Requests:${n} | no url given`),t=orDefault(t,{}),assert(isPlainObject(t),`Requests:${n} | options must be plain object`),t.method=orDefault(t.method,"GET","str"),t.method=["GET","POST","PUT","PATCH","HEAD","OPTIONS","DELETE"].includes(t.method.toUpperCase())?t.method.toUpperCase():"GET",t.timeout=orDefault(t.timeout,1e4,"int"),t.timeout=t.timeout<0?0:t.timeout,s=window.__ANNEX_USE_NATIVE_FETCH__??s,{url:e,options:t,execute:!s||"auto"===s&&!("fetch"in window)?function(){const s=new Deferred,n=new XMLHttpRequest,r=new Set,o=new Map,a=()=>({ok:parseInt(n.status,10)>=200&&parseInt(n.status,10)<=299,statusText:n.statusText,status:n.status,url:n.responseURL,text:()=>Promise.resolve(n.responseText),json:()=>Promise.resolve(n.responseText).then(JSON.parse),blob:()=>Promise.resolve(new Blob([n.response])),clone:a,headers:{keys:()=>r,entries:()=>o,get:e=>o.get(e),has:e=>r.has(e)}});if(n.open(t.method,e,!0),t.timeout>0&&(n.timeout=t.timeout,n.ontimeout=()=>{s.reject(new Error("timeout"))}),n.onload=()=>{n.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,((e,t,s)=>{t=`${t}`,r.add(t),o.has(t)?o.set(t,`${o.get(t)},${s}`):o.set(t,`${s}`)})),s.resolve(a())},n.onerror=s.reject,n.withCredentials="include"===t.credentials,hasValue(t.headers))for(let e in t.headers)t.headers.hasOwnProperty(e)&&n.setRequestHeader(e,t.headers[e]);return n.send(t.body??null),s}:function(){const s=new Deferred,n=t.timeout;let r,o;return n>0&&"AbortController"in window&&(o=new AbortController,t.signal=o.signal),window.fetch(e,t).then((e=>{countermand(r),s.resolve(e)})).catch((e=>{countermand(r),s.reject(e)})),n>0&&"AbortController"in window&&(r=schedule(n,(()=>{o.abort()}))),s}}}export function createJsonRequest(e,t=null,s=!1,n=!0){const r="application/json";return n&&(hasValue(t)||(t={}),hasValue(t.headers)||(t.headers={}),t.headers.Accept=r),{url:e,options:t,execute(o="object",a=null,i=null){const l=new Deferred;return createFetchRequest(e,t,s).execute().then((e=>{const t=(e.headers.get("content-type")??e.headers.get("Content-Type")??"").split(";")[0].trim();if(t!==r){const e=`Requests:createJsonRequest | content-type "${t}" is not valid for JSON, expecting "application/json"`;if(n)throw new Error(e);warn(e)}return e.json()})).then((e=>{const t=createNode(`<script type="application/json">${JSON.stringify(e)}<\/script>`);if(null!==i&&t.setAttribute("data-id",`${i}`),hasValue(a)){const e=a.element??a,s=a.position??null;null===s?insertNode(e,t):insertNode(e,t,s)}l.resolve("element"===o?t:"raw"===o?JSON.stringify(e):e)})).catch((e=>{l.reject(e)})),l}}}class RestfulJsonClient{#e="RestfulJsonClient";#t="invalid request method";#s="data must be plain object";#n=null;#r=null;#o=!1;#a=!0;#i=null;constructor(e=null,t=null,s=!1,n=!0){this.#n=orDefault(e,window.location.origin,"str"),this.#r=isPlainObject(t)?t:{},this.#o=orDefault(s,!1,"bool"),this.#a=orDefault(n,!0,"bool"),!this.#n.startsWith("//")&&this.#n.startsWith("/")&&(this.#n=`${window.location.origin}${this.#n}`),this.#i={url:new URL("",this.#n),options:{},params:new URLSearchParams,data:{}}}path(e){return e=`${e}`.replaceAll(/^\/+/g,""),this.#i.url=new URL(e,this.#n),this}options(e){return hasValue(e)?(assert(isPlainObject(e),`Requests:${this.#e}.options | options must be plain object`),this.#i.options=e):this.#i.options={},this}header(e,t){return e=`${e}`,isPlainObject(this.#i.options.headers)||(this.#i.options.headers={}),hasValue(t)?this.#i.options.headers[e]=`${t}`:delete this.#i.options.headers[e],this}params(e){return hasValue(e)?this.#i.params=new URLSearchParams(isPlainObject(e)?this.#l(e):e):this.#i.params=new URLSearchParams,this.#i.url.search=this.#i.params.toString(),this}param(e,t,s=!1){return e=`${e}`,s=orDefault(s,!1,"bool"),hasValue(t)?s?this.#i.params.append(e,`${t}`):this.#i.params.set(e,`${t}`):this.#i.params.delete(e),this.#i.url.search=this.#i.params.toString(),this}data(e){return hasValue(e)?(assert(isPlainObject(e),`Requests:${this.#e}.data | ${this.#s}`),this.#i.data=e):this.#i.data={},this}get(){return this.#u("GET")}post(e=null){return this.#c("POST",e)}put(e=null){return this.#c("PUT",e)}patch(e=null){return this.#c("PATCH",e)}delete(){return this.#u("DELETE")}getConfig(){return merge(this.#i,{options:merge(this.#r,this.#i.options)})}#u(e){e=e.toUpperCase(),assert(["GET","DELETE"].includes(e),`Requests:${this.#e}.#executeRequest | ${this.#t} "${e}"`);const t=merge(this.#r,this.#i.options,{method:e});return createJsonRequest(this.#i.url,t,this.#o,this.#a).execute()}#c(e,t=null){const s="#executeRequestWithPayload";e=e.toUpperCase(),assert(["POST","PUT","PATCH"].includes(e),`Requests:${this.#e}.${s} | ${this.#t} "${e}"`),hasValue(t)&&assert(isPlainObject(t),`Requests:${this.#e}.${s} | ${this.#s}`);const n="Content-Type";this.header(n,"application/json; charset=UTF-8");const r=JSON.stringify(t??this.#i.data),o=merge(this.#r,this.#i.options,{method:e,body:r});return createJsonRequest(this.#i.url,o,this.#o,this.#a).execute().finally((()=>{this.header(n,null)}))}#l(e){const t=Object.entries(e),s=[];for(const e in t){const n=t[e][0],r=t[e][1],o=getType(r);["array","set"].includes(o)?Array.from(r).forEach((e=>{s.push([n,`${e}`])})):s.push([n,`${r}`])}return s}}export{RestfulJsonClient};export function createJsRequest(e,t=null,s=!1,n=!0){const r="application/javascript";return n&&(hasValue(t)||(t={}),hasValue(t.headers)||(t.headers={}),t.headers.Accept=r),{url:e,options:t,execute(o="element",a=null,i=null,l=!1){const u="sourced-element",c=new Deferred,h=(e,t="")=>{if(null!==i&&e.setAttribute("data-id",`${i}`),hasValue(a)){const s=a.element??a,n=a.position??null;l||(e.onload=()=>{c.resolve("raw"===o?t:e)},e.onerror=e=>{c.reject(e)}),null===n?insertNode(s,e):insertNode(s,e,n)}(o!==u||o===u&&l)&&c.resolve("raw"===o?t:e)};return o===u?h(createNode("script",{src:e})):createFetchRequest(e,t,s).execute().then((e=>{const t=(e.headers.get("content-type")??e.headers.get("Content-Type")??"").split(";")[0].trim();if(t!==r){const e=`Requests:createJsRequest | content-type "${t}" is not valid for JavaScript, expecting "application/javascript"`;if(n)throw new Error(e);warn(e)}return e.text()})).then((e=>{h(createNode("script",null,e),e)})).catch((e=>{c.reject(e)})),c}}}export function createCssRequest(e,t=null,s=!1,n=!0){const r="text/css";return n&&(hasValue(t)||(t={}),hasValue(t.headers)||(t.headers={}),t.headers.Accept=r),{url:e,options:t,execute(o="element",a=null,i=null,l="all",u=!1){const c="sourced-element",h=new Deferred,d=(e,t="")=>{if(null!==i&&e.setAttribute("data-id",`${i}`),hasValue(a)){const s=a.element??a,n=a.position??null;u||(e.onload=()=>{h.resolve("raw"===o?t:e)},e.onerror=e=>{h.reject(e)}),null===n?insertNode(s,e):insertNode(s,e,n)}(o!==c||o===c&&u)&&h.resolve("raw"===o?t:e)};if(o===c){const t={href:e,rel:"stylesheet"};"all"!==l&&(t.media=l),d(createNode("link",t))}else createFetchRequest(e,t,s).execute().then((e=>{const t=(e.headers.get("content-type")??e.headers.get("Content-Type")??"").split(";")[0].trim();if(t!==r){const e=`Requests:createCssRequest | content-type "${t}" is not valid for CSS, expecting "text/css"`;if(n)throw new Error(e);warn(e)}return e.text()})).then((e=>{d(createNode("style","all"!==l?{media:l}:null,e),e)})).catch((e=>{h.reject(e)}));return h}}}export function createHtmlRequest(e,t=null,s=!1,n=!0){const r="text/html";return n&&(hasValue(t)||(t={}),hasValue(t.headers)||(t.headers={}),t.headers.Accept=r),{url:e,options:t,execute(o="element",a=null,i=null,l=null,u=!1){const c=new Deferred;return createFetchRequest(e,t,s).execute().then((e=>{const t=(e.headers.get("content-type")??e.headers.get("Content-Type")??"").split(";")[0].trim();if(t!==r){const e=`Requests:createHtmlRequest | content-type "${t}" is not valid for HTML, expecting "text/html"`;if(n)throw new Error(e);warn(e)}return e.text()})).then((e=>{const t=e.includes("<html")||e.includes("<HTML"),s=t||e.includes("<head")||e.includes("<HEAD")||e.includes("<body")||e.includes("<BODY"),n=(new DOMParser).parseFromString(e,"text/html").documentElement;let r;r=hasValue(l)?u?n.querySelectorAll(`${l}`):n.querySelector(`${l}`):t?n:s?n.children:n.querySelector("body").children,hasValue(r?.length)&&(r=0===r.length?null:1===r.length?r.item(0):Array.from(r)),hasValue(l)&&(e="",hasValue(r)&&[].concat(r).forEach((t=>{e+=t.outerHTML}))),((e,t="")=>{if(hasValue(e)){const t=[].concat(e);if(null!==i&&t.forEach((e=>{e.setAttribute("data-id",`${i}`)})),hasValue(a)){const e=a.element??a,s=a.position??null;["before","beforebegin","prepend","afterbegin"].includes(s)&&t.reverse(),t.forEach((t=>{null===s?insertNode(e,t):insertNode(e,t,s)}))}}c.resolve("raw"===o?t:e)})(r,e)})).catch((e=>{c.reject(e)})),c}}}export function visitUrl(e,t=5e3,s=null,n="token"){e=orDefault(e,"","str"),t=Math.abs(orDefault(t,5e3,"int")),s=orDefault(s,null,"str"),n=orDefault(n,"token","str"),e=hasValue(s)?e.replaceAll(`{${n}}`,s):e;const r=new Deferred,o=document.createElement("div");o.innerHTML=`\n\t\t<iframe\n\t\t\tclass="webhook"\n\t\t\tframeborder="0"\n\t\t\tframeborder="0"\n\t\t\tmarginwidth="0"\n\t\t\tmarginheight="0"\n\t\t\tstyle="width:0;height:0;opacity:0;"\n\t\t\tsrc="${e}"\n\t\t></iframe>\n\t`.trim();const a=o.firstChild,i=()=>{a.removeEventListener("load",i),window.clearTimeout(l),window.setTimeout((()=>{document.body.removeChild(a),r.resolve(e)}),250)},l=window.setTimeout((()=>{a.removeEventListener("load",i),document.body.removeChild(a),r.reject(new Error("timeout"))}),t);return a.addEventListener("load",i),document.body.appendChild(a),r}
//# sourceMappingURL=requests.js.map

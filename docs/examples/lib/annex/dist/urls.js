/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Urls
 */
const MODULE_NAME="Urls";import{hasValue,orDefault,size}from"./basic.js";export function urlParameter(t,r=null){let e;if(t=orDefault(t,"","str"),r=orDefault(r,null,"str"),t.startsWith("?"))e=new URLSearchParams(t);else{if(!t.startsWith("http://")&&!t.startsWith("https://")){const r=window.location.protocol;t=`${t.startsWith("//")?r:r+"//"}${t}`}try{e=new URL(t).searchParams}catch{throw new Error(`Urls:urlParameter | invalid url "${t}"`)}}const l=t=>""===t||t;if(hasValue(r)){const t=e.getAll(r);return 0===t.length?null:1===t.length?l(t[0]):Array.from(new Set(t.map(l)))}{const t={};return Array.from(e.keys()).forEach((r=>{const a=e.getAll(r);a.length>0&&(t[r]=1===a.length?l(a[0]):Array.from(new Set(a.map(l))))})),size(t)>0?t:null}}export function urlParameters(t){return urlParameter(t)}export function urlAnchor(t,r=!1){t=orDefault(t,"","str"),r=orDefault(r,!1,"bool");const e=t.split("#");let l=e.length>1?decodeURIComponent(e[1].trim()):null;return""===l&&(l=null),r&&hasValue(l)&&(l=`#${l}`),l}
//# sourceMappingURL=urls.js.map

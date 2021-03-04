/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Arrays
 */
const MODULE_NAME="Arrays";import{assert,isA,orDefault}from"./basic.js";export function remove(r,e,t){if(assert(Array.isArray(r),"Arrays:remove | target is no array"),isA(e,"number")&&!1!==t){e=parseInt(e,10),t=orDefault(t,null,"integer");const s=(r=r.slice(0)).slice((t||e)+1||r.length);return r.length=e<0?r.length+e:e,r.concat(s)}if(isA(e,"string"))return r.reduce(((r,t)=>(`${t}`!==e&&r.push(t),r)),[]);{const s=isA(e,"object")?Object.values(e):Array.from(e);return!0===t&&s.length>0?s.reduce(((r,e)=>r=remove(r,e,!1)),[...r]):r.reduce(((r,t)=>(t!==e&&r.push(t),r)),[])}}
//# sourceMappingURL=arrays.js.map

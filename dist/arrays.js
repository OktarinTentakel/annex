/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Arrays
 */
const MODULE_NAME="Arrays";import{assert,isA,orDefault}from"./basic.js";export function removeFrom(r,e,t=null){if(assert(isA(r,"array"),"Arrays:remove | target is no array"),isA(e,"number")&&!1!==t){e=parseInt(e,10),t=orDefault(t,null,"int");const s=(r=r.slice(0)).slice((t||e)+1||r.length);return r.length=e<0?r.length+e:e,r.concat(s)}if(isA(e,"string"))return r.reduce(((r,t)=>(`${t}`!==e&&r.push(t),r)),[]);{const s=isA(e,"object")?Object.values(e):Array.from(e);return!0===t&&s.length>0?s.reduce(((r,e)=>r=removeFrom(r,e,!1)),[...r]):r.reduce(((r,t)=>(t!==e&&r.push(t),r)),[])}}
//# sourceMappingURL=arrays.js.map

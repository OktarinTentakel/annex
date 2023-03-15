/*!
 * @oktarintentakel/annex v0.1.2-beta
 */
/*!
 * Module Arrays
 */
const MODULE_NAME="Arrays";import{assert,isA,isPlainObject,orDefault}from"./basic.js";export function removeFrom(r,e,s=null){if(assert(isA(r,"array"),"Arrays:remove | target is no array"),isA(e,"number")&&!0!==s){e=parseInt(e,10),s=orDefault(s,null,"int");const t=(r=r.slice(0)).slice((s||e)+1||r.length);return r.length=e<0?r.length+e:e,r.concat(t)}if(isA(e,"string"))return r.reduce(((r,s)=>(`${s}`!==e&&r.push(s),r)),[]);{let t;return t=isPlainObject(e)?Object.values(e):isA(e,"map")||isA(e,"set")?Array.from(e.values()):Array.from(e),t.length>0&&!0!==s?t.reduce(((r,e)=>r=removeFrom(r,e,!0)),[...r]):r.reduce(((r,s)=>(s!==e&&r.push(s),r)),[])}}
//# sourceMappingURL=arrays.js.map

/*!
 * @oktarintentakel/annex v0.1.17-beta
 */
/*!
 * Module Arrays
 */
const MODULE_NAME="Arrays";import{assert,isArray,isNumber,isString,isMap,isSet,isPlainObject,orDefault}from"./basic.js";export function removeFrom(r,e,t=null){if(assert(isArray(r),"Arrays:removeFrom | target is no array"),isNumber(e)&&!0!==t){e=parseInt(e,10),t=orDefault(t,null,"int");const s=(r=r.slice(0)).slice((t||e)+1||r.length);return r.length=e<0?r.length+e:e,r.concat(s)}if(isString(e))return r.reduce(((r,t)=>(`${t}`!==e&&r.push(t),r)),[]);{let s;return s=isPlainObject(e)?Object.values(e):isMap(e)||isSet(e)?Array.from(e.values()):Array.from(e),s.length>0&&!0!==t?s.reduce(((r,e)=>r=removeFrom(r,e,!0)),[...r]):r.reduce(((r,t)=>(t!==e&&r.push(t),r)),[])}}export function generateRange(r,e,t=1){const s="generateRange",a="cannot be empty",n=!isNumber(r)||!isNumber(e);n&&(isNumber(r)||(assert((r=`${r}`).length>0,`Arrays:${s} | "from" ${a}`),r=r.charCodeAt(0)),isNumber(e)||(assert((e=`${e}`).length>0,`Arrays:${s} | "to" ${a}`),e=e.charCodeAt(0))),t=orDefault(t,1,"float");const o=e-r<0?-1:1,i=[];let u=Math.abs(e-r),l=r;for(;u>=0;)i.push(n?String.fromCharCode(l):l),l+=t*o,u-=t;return i}
//# sourceMappingURL=arrays.js.map

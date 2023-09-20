/*!
 * @oktarintentakel/annex v0.1.9-beta
 */
/*!
 * Module Cookies
 */
const MODULE_NAME="Cookies";import{assert,isDate,orDefault,hasValue}from"./basic.js";import{warn}from"./logging.js";function encodeCookieValue(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}function decodeCookieValue(e){return'"'===e[0]&&(e=e.slice(1,-1)),e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)}function encodeCookieName(e){return encodeURIComponent(`${e}`).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape)}function decodeCookieName(e){return decodeURIComponent(e)}function normalizeCookieOptions(e){e=orDefault(e,{});const o={};for(let t in e)o[t.toLowerCase()]=e[t];return hasValue((e=o).expires)?(isDate(e.expires)||(e.expires=new Date(Date.now()+24*Math.round(parseFloat(e.expires))*60*60*1e3)),e.expires=e.expires.toUTCString()):e.expires=null,e["max-age"]=orDefault(e["max-age"],null,"int"),e.path=orDefault(e.path,"/","str"),"auto"===e.path&&(e.path=""),e.domain=orDefault(e.domain,null,"str"),e.httponly=orDefault(e.httponly,!1,"bool"),e.samesite=orDefault(e.samesite,"lax","str").toLowerCase(),["strict","lax","none"].includes(e.samesite)||console.warn(`Cookies:setCookie | unknown samesite mode "${e.samesite}"`),e.secure=orDefault(e.secure,"none"===e.samesite,"bool"),e}export function getCookie(e){const o=hasValue(e)?new Set([].concat(e).map((e=>e.trim()))):new Set,t=new Set;let n=0===o.size?{}:null;if(!hasValue(document.cookie))return n;const i=document.cookie.split(";");for(let e in i)try{const a=i[e].trim().split("="),r=decodeCookieName(a[0]).trim(),s=decodeCookieValue(a.slice(1).join("="));if(""!==r&&(o.has(r)||0===o.size)&&(null===n&&(n={}),n[r]=s,t.add(r),t.size===o.size&&0!==o.size))break}catch(o){warn(`Cookies:getCookie | decoding cookie "${i[e]}" failed with "${o}"`)}return 1===o.size?n?.[e]??null:n}export function getCookies(e){return e=[],Array.from(arguments).forEach((o=>{e=e.concat(o)})),getCookie(e)}export function setCookie(e,o,t){assert(hasValue(e)&&""!==e,"Cookies:setCookie | no usable name"),e=`${e}`.trim(),o=hasValue(o)?encodeCookieValue(orDefault(o,"","str")):null,t=normalizeCookieOptions(t);let n="";for(let e in t){const o=t[e];hasValue(o)&&!1!==o&&(n+=`; ${e}`,!0!==o&&(n+=`=${o.split(";")[0]}`))}return hasValue(o)?document.cookie=`${encodeCookieName(e)}=${o}${n}`:removeCookie(e,t),getCookie(e)}export function removeCookie(e,o){return assert(hasValue(e)&&""!==e,"Cookies:removeCookie | no usable name"),(o=normalizeCookieOptions(o)).expires=-1,null===setCookie(e,"",o)}
//# sourceMappingURL=cookies.js.map

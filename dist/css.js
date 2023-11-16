/*!
 * @oktarintentakel/annex v0.1.15-beta
 */
/*!
 * Module CSS
 */
const MODULE_NAME="CSS";import{assert,isNumber,orDefault,isPlainObject,isElement,hasValue,isNaN}from"./basic.js";import{maskForRegEx}from"./strings.js";export function applyStyles(e,t,r=!1,s=!1){const l="applyStyles";r=orDefault(r,!1,"bool"),s=orDefault(s,!1,"bool"),assert(isElement(e),`CSS:${l} | element is not an html element`),assert(isPlainObject(t),`CSS:${l} | styles must be a plain object`);const o=["-webkit-","-moz-","-ms-","-o-","-khtml-"];return r&&Object.entries({...t}).forEach((([e,r])=>{o.forEach((s=>{t[s+e]="transition"===e?r.replace("transform",`${s}transform`):r}))})),Object.entries({...t}).forEach((([r,s])=>{isNumber(s)&&0!==s?(t[r]=`${s}px`,e.style.setProperty(r,t[r])):hasValue(s)?(t[r]=`${s}`,e.style.setProperty(r,t[r])):(o.forEach((s=>{delete t[s+r],e.style.removeProperty(s+r)})),delete t[r],e.style.removeProperty(r))})),s?e.style:t}export function cssValueToNumber(e){return parseFloat(orDefault(e,"","str"))}export function cssUrlValueToUrl(e,t=null,r=null){e=orDefault(e,"","str"),t=orDefault(t,null,"str"),r=orDefault(r,null,"str");const s=new RegExp("(?:^|\\s|,)url\\((?:'|\")?([^'\"\\n\\r\\t]+)(?:'|\")?\\)","gmi"),l=[];let o;for(;null!==(o=s.exec(e));)o=o[1],hasValue(t,r)&&(o=o.replace(new RegExp(`^${maskForRegEx(t)}`),r)),l.push(o);return 1===l.length?l[0]:l.length>1?l:null}export function remByPx(e,t="html"){if(e=cssValueToNumber(e),t=orDefault(t,"html"),isElement(t))t=cssValueToNumber(t.style.getPropertyValue("font-size"));else{const e=cssValueToNumber(t);if(isNaN(e)){const e=document.querySelector(t);assert(hasValue(e),"CSS:remByPx | selector does not return element"),t=cssValueToNumber(e.style.getPropertyValue("font-size"))}else t=e}const r=e/t;return 0===t||isNaN(r)?null:`${r}rem`}
//# sourceMappingURL=css.js.map

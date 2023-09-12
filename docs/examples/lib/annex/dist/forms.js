/*!
 * @oktarintentakel/annex v0.1.7-beta
 */
/*!
 * Module Forms
 */
const MODULE_NAME="Forms";import{isFunction,isPlainObject,hasValue}from"./basic.js";export function formDataToObject(e){let n;if(isFunction(e.append)&&isFunction(e.getAll)&&isFunction(e.entries))n=e;else try{n=new FormData(e)}catch(e){n=null}if(!hasValue(n))return null;const a={};return Array.from(n.entries()).forEach((([e,n])=>{e.endsWith("[]")&&(e=e.slice(0,-2)),n=[].concat(n),hasValue(a[e])?a[e]=[].concat(a[e],n):a[e]=1===n.length?n[0]:n})),a}export function objectToFormData(e){const n=new FormData;return Object.entries(e).forEach((([e,a])=>{e.endsWith("[]")&&(e=e.slice(0,-2)),[].concat(a).forEach((a=>{if(isPlainObject(a))if(hasValue(a.file)&&a.file instanceof File)n.append(e,a.file,hasValue(a.name)?`${a.name}`:void 0);else if(hasValue(a.blob)){const t=a.blob instanceof Blob?a.blob:new Blob([`${a.blob}`],hasValue(a.mimeType)?{type:`${a.mimeType}`}:void 0);n.append(e,t,hasValue(a.name)?`${a.name}`:void 0)}else n.append(e,`${a}`);else n.append(e,a)}))})),n}
//# sourceMappingURL=forms.js.map

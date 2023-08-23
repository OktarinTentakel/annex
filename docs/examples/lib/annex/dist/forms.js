/*!
 * @oktarintentakel/annex v0.1.4-beta
 */
/*!
 * Module Forms
 */
const MODULE_NAME="Forms";import{isA,isPlainObject,hasValue}from"./basic.js";export function formDataToObject(e){let a;if(isA(e.append,"function")&&isA(e.getAll,"function")&&isA(e.entries,"function"))a=e;else try{a=new FormData(e)}catch(e){a=null}if(!hasValue(a))return null;const n={};return Array.from(a.entries()).forEach((([e,a])=>{e.endsWith("[]")&&(e=e.slice(0,-2)),a=[].concat(a),hasValue(n[e])?n[e]=[].concat(n[e],a):n[e]=1===a.length?a[0]:a})),n}export function objectToFormData(e){const a=new FormData;return Object.entries(e).forEach((([e,n])=>{e.endsWith("[]")&&(e=e.slice(0,-2)),[].concat(n).forEach((n=>{if(isPlainObject(n))if(hasValue(n.file)&&n.file instanceof File)a.append(e,n.file,hasValue(n.name)?`${n.name}`:void 0);else if(hasValue(n.blob)){const t=n.blob instanceof Blob?n.blob:new Blob([`${n.blob}`],hasValue(n.mimeType)?{type:`${n.mimeType}`}:void 0);a.append(e,t,hasValue(n.name)?`${n.name}`:void 0)}else a.append(e,`${n}`);else a.append(e,n)}))})),a}
//# sourceMappingURL=forms.js.map

/*!
 * @oktarintentakel/annex v0.1.5-beta
 */
/*!
 * Module Objects
 */
const MODULE_NAME="Objects";import{getType,isA,orDefault}from"./basic.js";export function clone(e,t=!0){if(t=orDefault(t,!0,"bool"),isA(e?.clone,"function"))return e.clone(t);const r=Array.from(arguments)[2]??[],n=Array.from(arguments)[3]??[];if(r.indexOf(e)>=0)return n[r.indexOf(e)];const o=getType(e);switch(o){case"array":const c=[...e];if(r.push(e),n.push(c),t){let e=c.length;for(;e--;)c[e]=clone(c[e],t,r,n)}return c;case"set":case"weakset":const a="weakset"===o?new WeakSet:new Set;return r.push(e),n.push(a),e.forEach((e=>{t?a.add(clone(e,t,r,n)):a.add(e)})),a;case"map":case"weakmap":const s="weakmap"===o?new WeakMap:new Map;return r.push(e),n.push(s),e.forEach(((e,o)=>{t?s.set(o,clone(e,t,r,n)):s.set(o,e)})),s;case"object":const p=Object.create(Object.getPrototypeOf?Object.getPrototypeOf(e):e.__proto__);r.push(e),n.push(p);for(let o in e)e.hasOwnProperty(o)&&(p[o]=t?clone(e[o],t,r,n):e[o]);return p;case"nodelist":const l=document.createDocumentFragment();if(t)e.forEach((e=>{t&&l.appendChild(clone(e,t,r,n))}));else for(;e.length;)l.appendChild(e.item(0));return l.childNodes;case"date":return new Date(e.getTime());case"regexp":return new RegExp(e);case"htmlelement":return e.cloneNode(t);default:return e}}export function merge(e,...t){return e=clone(e),Array.from(t).forEach((t=>{t=clone(t);for(let r in t)t.hasOwnProperty(r)&&(e.hasOwnProperty(r)&&isA(e[r],"object")&&isA(t[r],"object")&&Object.keys(t[r]).length>0?e[r]=merge(e[r],t[r]):e[r]=t[r])})),e}
//# sourceMappingURL=objects.js.map

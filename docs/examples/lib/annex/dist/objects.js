/*!
 * @oktarintentakel/annex v0.1.2-beta
 */
/*!
 * Module Objects
 */
const MODULE_NAME="Objects";import{getType,isA,orDefault}from"./basic.js";export function clone(e,t=!0){if(t=orDefault(t,!0,"bool"),isA(e?.clone,"function"))return e.clone(t);const n=Array.from(arguments)[2]??[],r=Array.from(arguments)[3]??[];if(n.indexOf(e)>=0)return r[n.indexOf(e)];const o=getType(e);switch(o){case"array":const c=[...e];if(n.push(e),r.push(c),t){let e=c.length;for(;e--;)c[e]=clone(c[e],t,n,r)}return c;case"set":case"weakset":const a="weakset"===o?new WeakSet:new Set;return n.push(e),r.push(a),e.forEach((e=>{t?a.add(clone(e,t,n,r)):a.add(e)})),a;case"map":case"weakmap":const s="weakmap"===o?new WeakMap:new Map;return n.push(e),r.push(s),e.forEach(((e,o)=>{t?s.set(o,clone(e,t,n,r)):s.set(o,e)})),s;case"object":const p=Object.create(Object.getPrototypeOf?Object.getPrototypeOf(e):e.__proto__);n.push(e),r.push(p);for(let o in e)e.hasOwnProperty(o)&&(p[o]=t?clone(e[o],t,n,r):e[o]);return p;case"nodelist":const u=document.createDocumentFragment();if(t)e.forEach((e=>{t&&u.appendChild(clone(e,t,n,r))}));else for(;e.length;)u.appendChild(e.item(0));return u.childNodes;case"date":return new Date(e.getTime());case"regexp":return new RegExp(e);case"htmlelement":return e.cloneNode(t);default:return e}}
//# sourceMappingURL=objects.js.map

/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Elements
 */
const MODULE_NAME="Elements";import{orDefault,isA,isPlainObject,hasValue,assert}from"./basic.js";export function createNode(e,t=null,n=null){e=orDefault(e,"span","str").trim(),t=isPlainObject(t)?t:null,n=orDefault(n,null,"str");const r=document.createElement("div");/^<[^\/][^<>]*>/.test(e)&&/<\/[^<>\/]+>$/.test(e)?r.innerHTML=e:r.appendChild(document.createElement(e));const a=r.firstChild;if(hasValue(t))for(let e in t)a.setAttribute(e,`${t[e]}`);return hasValue(n)&&(a.textContent=n),a}export function insertNode(e,t,n="beforeend"){switch(isA(t,"htmlelement")||(t=createNode(`${element}`)),assert(isA(e,"htmlelement"),"Elements.injectNode | given target is not an HTMLElement"),n){case"beforebegin":case"before":n="beforebegin";break;case"afterend":case"after":n="afterend";break;case"afterbegin":case"prepend":n="afterbegin";break;case"beforeend":case"append":default:n="beforeend"}return e.insertAdjacentElement(n,t),t}export function getTextContent(e,t=!1){if(t=orDefault(t,!1,"bool"),isA(e,"string")&&(e=createNode(e)),assert(isA(e,"htmlelement"),"Elements:getTextContent | target is neither node nor markup"),t){let t="";return e.childNodes.forEach((e=>{3===e.nodeType&&(t+=e.textContent)})),t}return e.textContent}
//# sourceMappingURL=elements.js.map

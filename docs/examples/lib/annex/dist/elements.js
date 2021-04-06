/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Elements
 */
const MODULE_NAME="Elements";import{orDefault,isA,isPlainObject,hasValue,assert}from"./basic.js";export function createNode(t,e=null,n=null){t=orDefault(t,"span","str").trim(),e=isPlainObject(e)?e:null,n=orDefault(n,null,"str");const r=document.createElement("main");/^<[^<>\/]+>/.test(t)&&/<\/[^<>\/]+>$/.test(t)?r.innerHTML=t.trim():r.innerHTML=`<${t}/>`;const o=r.firstChild;if(hasValue(e))for(let t in e)o.setAttribute(t,`${e[t]}`);return hasValue(n)&&(o.textContent=n),o}export function getTextContent(t,e=!1){if(e=orDefault(e,!1,"bool"),isA(t,"string")&&(t=createNode(t)),assert(isA(t,"htmlelement"),"Elements:getTextContent | target is neither node nor markup"),e){let e="";return t.childNodes.forEach((t=>{3===t.nodeType&&(e+=t.textContent)})),e}return t.textContent}
//# sourceMappingURL=elements.js.map

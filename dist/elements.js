/*!
 * @oktarintentakel/annex v0.1.15-beta
 */
/*!
 * Module Elements
 */
const MODULE_NAME="Elements";import{orDefault,isString,isFunction,isPlainObject,isSelector,isElement,hasValue,assert,size,Deferred}from"./basic.js";import{randomUuid}from"./random.js";import{clone}from"./objects.js";import{onDomReady}from"./events.js";import{applyStyles}from"./css.js";const NOT_AN_HTMLELEMENT_ERROR="given node/target is not an HTMLElement";let BROWSER_HAS_CSS_SCOPE_SUPPORT;try{document.querySelector(":scope *")}catch(e){BROWSER_HAS_CSS_SCOPE_SUPPORT=!1}export function createNode(e,t=null,n=null){e=orDefault(e,"span","str").trim(),t=isPlainObject(t)?t:null,n=orDefault(n,null,"str");const s=document.createElement("div");/^<[^\/][^<>]*>/.test(e)&&/<\/[^<>\/]+>$/.test(e)?s.innerHTML=e:s.appendChild(document.createElement(e));const r=s.firstChild;if(s.removeChild(r),hasValue(t))for(let e in t)r.setAttribute(e,`${t[e]}`);return hasValue(n)&&(r.textContent=n),r}export function insertNode(e,t,n="beforeend"){switch(assert(isElement(e),`Elements.insertNode | ${NOT_AN_HTMLELEMENT_ERROR}`),isElement(t)||(t=createNode(`${t}`)),n){case"beforebegin":case"before":n="beforebegin";break;case"afterend":case"after":n="afterend";break;case"afterbegin":case"prepend":n="afterbegin";break;default:n="beforeend"}return e.insertAdjacentElement(n,t),t}export function replaceNode(e,t){const n="replaceNode";return assert(isElement(e),`Elements.${n} | ${NOT_AN_HTMLELEMENT_ERROR}`),isElement(t)||(t=createNode(`${t}`)),assert(isElement(e.parentNode),`Elements.${n} | given target does not have a parent)`),insertNode(e,t,"after"),e.parentNode.removeChild(e),t}export function defineNode(e,t,n=null){const s="defineNode";assert(isElement(e),`Elements:${s} | ${NOT_AN_HTMLELEMENT_ERROR}`),assert(isPlainObject(t),`Elements:${s} | definitions is not a plain object`);const r="<-";return isElement(n)&&Array.from(n.attributes).forEach((e=>{(t[e.name]===r||!hasValue(t[e.name])&&(t["data*"]===r&&e.name.startsWith("data-")||t["on*"]===r&&e.name.startsWith("on")))&&(t[e.name]=e.value),(t[`+${e.name}`]===r||!hasValue(t[`+${e.name}`])&&(t["+data*"]===r&&e.name.startsWith("data-")||t["+on*"]===r&&e.name.startsWith("on")))&&(hasValue(t[`+${e.name}`])&&t[`+${e.name}`]!==r||(t[`+${e.name}`]=""),t[`+${e.name}`]+=e.value)})),delete t["data*"],delete t["+data*"],delete t["on*"],delete t["+on*"],Object.keys(t).forEach((e=>{t[e]===r&&delete t[e]})),Object.keys(t).sort().reverse().forEach((n=>{const s=t[n],r=n.startsWith("+");r&&(n=n.slice(1)),n.endsWith("*")&&(n=n.slice(0,-1)),"class"===n?(r||e.setAttribute("class",""),[].concat(s).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.add(`${t.trim()}`)}))}))):"style"===n?(r||e.setAttribute("style",""),[].concat(s).forEach((t=>{if(!isPlainObject(t)){const e=`${t}`.split(";"),n={};e.forEach((e=>{let[t,s]=e.split(":");t=t.trim(),hasValue(s)&&(s=s.trim(),s=s.endsWith(";")?s.slice(0,-1):s,n[t]=s)})),t=n}hasValue(t)&&applyStyles(e,t)}))):r?e.setAttribute(n,`${e.getAttribute(n)??""}${s}`):e.setAttribute(n,`${s}`)})),e}export function getTextContent(e,t=!1){if(t=orDefault(t,!1,"bool"),isString(e)&&(e=createNode(e)),assert(isElement(e),"Elements:getTextContent | target is neither node nor markup"),t){let t="";return e.childNodes.forEach((e=>{3===e.nodeType&&(t+=e.textContent)})),t}return e.textContent}export function isInDom(e){return assert(isElement(e),`Elements:isInDom | ${NOT_AN_HTMLELEMENT_ERROR}`),isFunction(document.contains)?document.contains(e):document.body.contains(e)}export function getData(e,t=null){t=orDefault(t,null,"arr"),assert(isElement(e),`Elements:getData | ${NOT_AN_HTMLELEMENT_ERROR}`);let n={};return hasValue(t)?t.forEach((t=>{let s=e.getAttribute(`data-${t}`);if(hasValue(s))try{n[t]=JSON.parse(s)}catch(e){n[t]=s}})):Array.from(e.attributes).forEach((e=>{if(e.name.startsWith("data-")){const t=e.name.replace(/^data-/,"");try{n[t]=JSON.parse(e.value)}catch(s){n[t]=e.value}}})),0===size(n)?n=null:1===t?.length&&(n=n[t[0]]??null),n}export function setData(e,t,n=null){const s="setData";assert(isElement(e),`Elements:${s} | ${NOT_AN_HTMLELEMENT_ERROR}`);let r=null;hasValue(n)&&(r=`${t}`,t={[r]:n}),assert(isPlainObject(t),`Elements:${s} | dataSet is not a plain object`);const a={};return Object.entries(t).forEach((([t,n])=>{if(isFunction(n)&&(n=n()),void 0!==n){let s,r;try{s=JSON.stringify(n),r=JSON.parse(s)}catch(e){s=`${n}`,r=s}s=s.replace(/^['"]/,"").replace(/['"]$/,"").trim(),""!==s?(a[t]=r,e.setAttribute(`data-${t}`,s)):e.hasAttribute(`data-${t}`)&&(a[t]=void 0,e.removeAttribute(`data-${t}`))}else e.hasAttribute(`data-${t}`)&&(a[t]=void 0,e.removeAttribute(`data-${t}`))})),hasValue(r)?r in a?a[r]:null:size(a)>0?a:null}export function removeData(e,t=null){t=orDefault(t,null,"arr"),assert(isElement(e),`Elements:removeData | ${NOT_AN_HTMLELEMENT_ERROR}`);let n=getData(e,t);return hasValue(n)?setData(e,1===t?.length?{[t[0]]:void 0}:Object.keys(n).reduce(((e,t)=>(e[t]=void 0,e)),{})):n=null,n}export function find(e,t="*",n=!1){const s=/:scope(?![\w-])/gi;if(assert(isElement(e),`Elements:find | ${NOT_AN_HTMLELEMENT_ERROR}`),t=orDefault(t,"*","str").trim(),s.test(t)||(t=`:scope ${t}`),n=orDefault(n,!1,"bool"),BROWSER_HAS_CSS_SCOPE_SUPPORT)return n?e.querySelector(t):Array.from(e.querySelectorAll(t));{const r=`find-scope-${randomUuid()}`;t=t.replace(s,`[${r}]`),e.setAttribute(r,"");const a=n?e.querySelector(t):Array.from(e.querySelectorAll(t));return e.removeAttribute(r),a}}export function findOne(e,t="*"){return find(e,t,!0)}export function findTextNodes(e,t=null,n=!1){t=isFunction(t)?t:()=>!0,n=orDefault(n,!1,"bool"),assert(isElement(e),`Elements:findTextNodes | ${NOT_AN_HTMLELEMENT_ERROR}`);const s=e=>3===e.nodeType&&""!==e.textContent.trim()&&!!t(e),r=e=>s(e)?[].concat(e):Array.from(e.childNodes).reduce(((e,t)=>s(t)?e.concat(t):n?e:e.concat(r(t))),[]);return r(e)}export function prime(e,t,n=null,s="primed"){const r="prime";n=orDefault(n,{}),s=orDefault(s,"primed","str"),assert(isElement(e),`Elements:${r} | ${NOT_AN_HTMLELEMENT_ERROR}`),assert(isFunction(t),`Elements:${r} | init is not a function`);const a=new Deferred;return!0!==getData(e,s)?(setData(e,s,!0),onDomReady((()=>{const n=t(e);hasValue(n)&&isFunction(n.then)&&isFunction(n.catch)?n.then((e=>{a.resolve(e)})).catch((e=>{a.reject(e)})):a.resolve(n),setData(e,`${s}-ready`,!0)}))):a.resolve(void 0),a.then((()=>{hasValue(n.remove)&&[].concat(n.remove).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.remove(t.trim())}))})),hasValue(n.add)&&[].concat(n.add).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.add(t.trim())}))})),setData(e,`${s}-resolved`,!0)})),a}export function measureHiddenDimensions(e,t="outer",n=null,s=null){const r="measureHidden",a={offset:{width:"offsetWidth",height:"offsetHeight"},outer:{width:"offsetWidth",height:"offsetHeight"},client:{width:"clientWidth",height:"clientHeight"},inner:{width:"clientWidth",height:"clientHeight"},scroll:{width:"scrollWidth",height:"scrollHeight"}};t=a[orDefault(t,"outer","str")]??a.outer,s=orDefault(s,document.body),assert(isElement(e),`Elements:${r} | ${NOT_AN_HTMLELEMENT_ERROR}`),assert(isElement(s),`Elements:${r} | context is no an htmlelement`);const o=createNode("div",{id:`sandbox-${randomUuid()}`,class:"sandbox",style:"display:block; opacity:0; visibility:hidden; pointer-events:none; position:absolute; top:-10000px; left:-10000px;"}),i=clone(e);s.appendChild(o),o.appendChild(i);const l=isSelector(n)?i.querySelector(n):i,c=l?.[t.width]??0,d=l?.[t.height]??0,u={width:c,height:d,toString:()=>`${c}x${d}`};return s.removeChild(o),u}
//# sourceMappingURL=elements.js.map

/*!
 * annex v0.1.1-beta
 */
/*!
 * Module Elements
 */
const MODULE_NAME="Elements";import{orDefault,isA,isPlainObject,hasValue,assert,size,Deferred}from"./basic.js";import{randomUuid}from"./random.js";import{clone}from"./objects.js";import{onDomReady}from"./events.js";import{applyStyles}from"./css.js";const NOT_AN_HTMLELEMENT_ERROR="given node/target is not an HTMLElement";let BROWSER_HAS_CSS_SCOPE_SUPPORT;try{document.querySelector(":scope *")}catch(e){BROWSER_HAS_CSS_SCOPE_SUPPORT=!1}export function createNode(e,t=null,n=null){e=orDefault(e,"span","str").trim(),t=isPlainObject(t)?t:null,n=orDefault(n,null,"str");const s=document.createElement("div");/^<[^\/][^<>]*>/.test(e)&&/<\/[^<>\/]+>$/.test(e)?s.innerHTML=e:s.appendChild(document.createElement(e));const a=s.firstChild;if(s.removeChild(a),hasValue(t))for(let e in t)a.setAttribute(e,`${t[e]}`);return hasValue(n)&&(a.textContent=n),a}export function insertNode(e,t,n="beforeend"){switch(assert(isA(e,"htmlelement"),`Elements.insertNode | ${NOT_AN_HTMLELEMENT_ERROR}`),isA(t,"htmlelement")||(t=createNode(`${t}`)),n){case"beforebegin":case"before":n="beforebegin";break;case"afterend":case"after":n="afterend";break;case"afterbegin":case"prepend":n="afterbegin";break;default:n="beforeend"}return e.insertAdjacentElement(n,t),t}export function replaceNode(e,t){const n="replaceNode";return assert(isA(e,"htmlelement"),`Elements.${n} | ${NOT_AN_HTMLELEMENT_ERROR}`),isA(t,"htmlelement")||(t=createNode(`${t}`)),assert(isA(e.parentNode,"htmlelement"),`Elements.${n} | given target does not have a parent)`),insertNode(e,t,"after"),e.parentNode.removeChild(e),t}export function defineNode(e,t,n=null){const s="defineNode";assert(isA(e,"htmlelement"),`Elements:${s} | ${NOT_AN_HTMLELEMENT_ERROR}`),assert(isPlainObject(t),`Elements:${s} | definitions is not a plain object`);const a="<-";return isA(n,"htmlelement")&&Array.from(n.attributes).forEach((e=>{(t[e.name]===a||!hasValue(t[e.name])&&(t["data*"]===a&&e.name.startsWith("data-")||t["on*"]===a&&e.name.startsWith("on")))&&(t[e.name]=e.value),(t[`+${e.name}`]===a||!hasValue(t[`+${e.name}`])&&(t["+data*"]===a&&e.name.startsWith("data-")||t["+on*"]===a&&e.name.startsWith("on")))&&(hasValue(t[`+${e.name}`])&&t[`+${e.name}`]!==a||(t[`+${e.name}`]=""),t[`+${e.name}`]+=e.value)})),delete t["data*"],delete t["+data*"],delete t["on*"],delete t["+on*"],Object.keys(t).forEach((e=>{t[e]===a&&delete t[e]})),Object.keys(t).sort().reverse().forEach((n=>{const s=t[n],a=n.startsWith("+");a&&(n=n.slice(1)),n.endsWith("*")&&(n=n.slice(0,-1)),"class"===n?(a||e.setAttribute("class",""),[].concat(s).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.add(`${t.trim()}`)}))}))):"style"===n?(a||e.setAttribute("style",""),[].concat(s).forEach((t=>{if(!isPlainObject(t)){const e=`${t}`.split(";"),n={};e.forEach((e=>{let[t,s]=e.split(":");t=t.trim(),hasValue(s)&&(s=s.trim(),s=s.endsWith(";")?s.slice(0,-1):s,n[t]=s)})),t=n}hasValue(t)&&applyStyles(e,t)}))):a?e.setAttribute(n,`${e.getAttribute(n)??""}${s}`):e.setAttribute(n,`${s}`)})),e}export function getTextContent(e,t=!1){if(t=orDefault(t,!1,"bool"),isA(e,"string")&&(e=createNode(e)),assert(isA(e,"htmlelement"),"Elements:getTextContent | target is neither node nor markup"),t){let t="";return e.childNodes.forEach((e=>{3===e.nodeType&&(t+=e.textContent)})),t}return e.textContent}export function isInDom(e){return assert(isA(e,"htmlelement"),`Elements:isInDom | ${NOT_AN_HTMLELEMENT_ERROR}`),isA(document.contains,"function")?document.contains(e):document.body.contains(e)}export function getData(e,t=null){t=orDefault(t,null,"arr"),assert(isA(e,"htmlelement"),`Elements:getData | ${NOT_AN_HTMLELEMENT_ERROR}`);let n={};return hasValue(t)?t.forEach((t=>{let s=e.getAttribute(`data-${t}`);if(hasValue(s))try{n[t]=JSON.parse(s)}catch(e){n[t]=s}})):Array.from(e.attributes).forEach((e=>{if(e.name.startsWith("data-")){const t=e.name.replace(/^data-/,"");try{n[t]=JSON.parse(e.value)}catch(s){n[t]=e.value}}})),0===size(n)?n=null:1===t?.length&&(n=n[t[0]]??null),n}export function setData(e,t,n=null){const s="setData";assert(isA(e,"htmlelement"),`Elements:${s} | ${NOT_AN_HTMLELEMENT_ERROR}`);let a=null;hasValue(n)&&(a=`${t}`,t={[a]:n}),assert(isPlainObject(t),`Elements:${s} | dataSet is not a plain object`);const r={};return Object.entries(t).forEach((([t,n])=>{if(isA(n,"function")&&(n=n()),void 0!==n){let s,a;try{s=JSON.stringify(n),a=JSON.parse(s)}catch(e){s=`${n}`,a=s}s=s.replace(/^['"]/,"").replace(/['"]$/,"").trim(),""!==s?(r[t]=a,e.setAttribute(`data-${t}`,s)):e.hasAttribute(`data-${t}`)&&(r[t]=void 0,e.removeAttribute(`data-${t}`))}else e.hasAttribute(`data-${t}`)&&(r[t]=void 0,e.removeAttribute(`data-${t}`))})),hasValue(a)?a in r?r[a]:null:size(r)>0?r:null}export function removeData(e,t=null){t=orDefault(t,null,"arr"),assert(isA(e,"htmlelement"),`Elements:removeData | ${NOT_AN_HTMLELEMENT_ERROR}`);let n=getData(e,t);return hasValue(n)?setData(e,1===t?.length?{[t[0]]:void 0}:Object.keys(n).reduce(((e,t)=>(e[t]=void 0,e)),{})):n=null,n}export function find(e,t="*",n=!1){const s=/:scope(?![\w-])/gi;if(assert(isA(e,"htmlelement"),`Elements:find | ${NOT_AN_HTMLELEMENT_ERROR}`),t=orDefault(t,"*","str").trim(),s.test(t)||(t=`:scope ${t}`),n=orDefault(n,!1,"bool"),BROWSER_HAS_CSS_SCOPE_SUPPORT)return n?e.querySelector(t):Array.from(e.querySelectorAll(t));{const a=`find-scope-${randomUuid()}`;t=t.replace(s,`[${a}]`),e.setAttribute(a,"");const r=n?e.querySelector(t):Array.from(e.querySelectorAll(t));return e.removeAttribute(a),r}}export function findOne(e,t="*"){return find(e,t,!0)}export function findTextNodes(e,t=null,n=!1){t=isA(t,"function")?t:()=>!0,n=orDefault(n,!1,"bool"),assert(isA(e,"htmlelement"),`Elements:findTextNodes | ${NOT_AN_HTMLELEMENT_ERROR}`);const s=e=>3===e.nodeType&&""!==e.textContent.trim()&&!!t(e),a=e=>s(e)?[].concat(e):Array.from(e.childNodes).reduce(((e,t)=>s(t)?e.concat(t):n?e:e.concat(a(t))),[]);return a(e)}export function prime(e,t,n=null,s="primed"){const a="prime";n=orDefault(n,{}),s=orDefault(s,"primed","str"),assert(isA(e,"htmlelement"),`Elements:${a} | ${NOT_AN_HTMLELEMENT_ERROR}`),assert(isA(t,"function"),`Elements:${a} | init is not a function`);const r=new Deferred;return!0!==getData(e,s)?(setData(e,s,!0),onDomReady((()=>{const n=t(e);hasValue(n)&&isA(n.then,"function")&&isA(n.catch,"function")?n.then((e=>{r.resolve(e)})).catch((e=>{r.reject(e)})):r.resolve(n),setData(e,`${s}-ready`,!0)}))):r.resolve(void 0),r.then((()=>{hasValue(n.remove)&&[].concat(n.remove).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.remove(t.trim())}))})),hasValue(n.add)&&[].concat(n.add).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.add(t.trim())}))})),setData(e,`${s}-resolved`,!0)})),r}export function measureHiddenDimensions(e,t="outer",n=null,s=document.body){const a="measureHidden",r={offset:{width:"offsetWidth",height:"offsetHeight"},outer:{width:"offsetWidth",height:"offsetHeight"},client:{width:"clientWidth",height:"clientHeight"},inner:{width:"clientWidth",height:"clientHeight"},scroll:{width:"scrollWidth",height:"scrollHeight"}};t=r[orDefault(t,"outer","str")]??r.outer,assert(isA(e,"htmlelement"),`Elements:${a} | ${NOT_AN_HTMLELEMENT_ERROR}`),assert(isA(s,"htmlelement"),`Elements:${a} | context is no an htmlelement`);const o=createNode("div",{id:`sandbox-${randomUuid()}`,class:"sandbox",style:"display:block; opacity:0; visibility:hidden; pointer-events:none; position:absolute; top:-10000px; left:-10000px;"}),i=clone(e);s.appendChild(o),o.appendChild(i);const l=hasValue(n)?i.querySelector(n):i,c=l?.[t.width]??0,d=l?.[t.height]??0,u={width:c,height:d,toString:()=>`${c}x${d}`};return s.removeChild(o),u}
//# sourceMappingURL=elements.js.map

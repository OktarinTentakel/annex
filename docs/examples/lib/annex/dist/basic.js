/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Basic
 */
const MODULE_NAME="Basic";import{log,warn}from"./logging.js";const DOCUMENT_FRAGMENT=document.createDocumentFragment();export function assert(t,e){if(!t)throw e=orDefault(e,"assert exception: assertion failed","str"),new Error(e)}export function attempt(t){assert(isA(t,"function"),"Basic:attempt | closure is no function");try{t()}catch(t){return!1}return!0}export function hasValue(){let t=!0;return Array.from(arguments).forEach((e=>{t&&=null!=e})),t}export function size(t,e=!0){if(isA(t?.values,"function"))return Array.from(t.values()).length;let r;switch(getType(t)){case"array":r=t.length;break;case"set":case"map":r=t.size;break;case"iterator":r=Array.from(t).length;break;case"string":r=e?[...t].length:t.length;break;case"object":r=Object.values(t).length;break;default:r=null}return r}export function isEmpty(){let t=!0,e=[void 0,null,"",0];return Array.from(arguments).forEach((t=>{isA(t?.__additionalEmptyValues__,"array")&&(e=e.concat(t.__additionalEmptyValues__))})),e=Array.from(new Set(e)),Array.from(arguments).forEach((r=>{t&&!isA(r?.__additionalEmptyValues__,"array")&&(t=e.includes(r),t||(t=0===size(r)))})),t}export function hasMembers(t,e,r=!1){e=orDefault(e,[],"arr"),r=orDefault(r,!1,"bool");let n=!0;return e.forEach((e=>{hasValue(t[`${e}`])||(r&&log().info(`Basic:hasMembers | missing member ${e}`),n=!1)})),n}export function orDefault(t,e,r=null,n=null){return n=hasValue(n)?[].concat(n):[],hasValue(r)?!isA(r,"function")&&["str","string","int","integer","bool","boolean","float","arr","array"].includes(`${r.toLowerCase()}`)?(r=`${r}`.toLowerCase(),["str","string"].includes(r)?r=function(t){return`${t}`}:["int","integer"].includes(r)?r=function(t){return parseInt(t,10)}:["bool","boolean"].includes(r)?r=function(t){return!!t}:"float"===r?r=function(t){return parseFloat(t)}:["arr","array"].includes(r)&&(r=function(t){return[].concat(t)})):isA(r,"function")||(r=function(t){return t}):r=function(t){return t},!hasValue(t)||n.includes(t)?e:r(t)}export function getType(t){if(!hasValue(t))return`${t}`.toLowerCase();const e=Object.prototype.toString.call(t).slice(8,-1).toLowerCase();return"generatorfunction"===e?"function":"document"===e?"htmldocument":"element"===e||/^html.*element$/.test(e)?"htmlelement":/^.*iterator$/.test(e)?"iterator":e.match(/^(array|bigint|date|error|function|generator|regexp|symbol|set|weakset|map|weakmap|htmldocument|nodelist|window)$/)?e:"object"==typeof t||"function"==typeof t?"object":typeof t}export function isA(t,e){return["undefined","null","boolean","number","bigint","string","symbol","function","object","array","date","error","generator","iterator","regexp","set","weakset","map","weakmap","htmldocument","htmlelement","nodelist","window"].includes(`${e}`.toLowerCase())?getType(t)===`${e}`.toLowerCase():(warn(`Basic:isA | "${e}" is not a recognized type`),!1)}export function isInt(t){return parseInt(t,10)===t}export function isFloat(t){return parseFloat(t)===t}export function isPlainObject(t){return isA(t,"object")&&hasValue(t)&&t.constructor===Object&&"[object Object]"===Object.prototype.toString.call(t)}export function isNaN(t,e=!0){return(e=orDefault(e,!0,"bool"))?t!=t:isNaN(t)}export function isEventTarget(t){return hasValue(t)&&isA(t.addEventListener,"function")&&isA(t.removeEventListener,"function")&&isA(t.dispatchEvent,"function")}export function isSelector(t){t=orDefault(t,0,"str");try{DOCUMENT_FRAGMENT.querySelector(t)}catch(t){return!1}return!0}export function isPotentialId(t,e="",r="[1-9][0-9]*",n="",s=!0){t=`${t}`,e=orDefault(e,"","str"),r=orDefault(r,"[1-9][0-9]*","str"),n=orDefault(n,"","str");const o=t=>`${t}`.replace(/([\-\[\]\/{}()*+?.\\^$|])/g,"\\$&");let i;i=(s=orDefault(s,!0,"bool"))?new RegExp(`^${o(e)}(${r})${o(n)}$`):new RegExp(`^${e}(${r})${n}$`);const a=i.exec(t);return!!hasValue(a)&&a[1]}export function minMax(t,e,r){return assert(t<=r,"Basic:minMax | min can not be larger than max"),e<t?t:e>r?r:e}export class Deferred{constructor(){const t="fulfilled",e="rejected";this.resolve=null,this.reject=null,this.provision=null,this.status="pending",this.isSettled=()=>[t,e].includes(this.status),this.promise=new Promise(((r,n)=>{this.resolve=e=>{this.status=t,r(e)},this.reject=t=>{this.status=e,n(t)}}))}then(t){return this.promise.then(t)}catch(t){return this.promise.catch(t)}finally(t){return this.promise.finally(t)}}export class Observable{constructor(t){this.__className__="Observable",this._value=t,this._subscriptions=[]}getValue(){return this._value}setValue(t,e=!1){const r=this._value,n=r!==t;this._value=t,(n||e)&&this._subscriptions.forEach((e=>e(t,r)))}subscribe(t){return assert(isA(t,"function"),`Basic:${this.__className__}.subscribe | subscription must be function`),this._subscriptions.indexOf(t)<0&&(this._subscriptions=[...this._subscriptions,t]),t}unsubscribe(t){this._subscriptions=this._subscriptions.filter((e=>e!==t))}}
//# sourceMappingURL=basic.js.map

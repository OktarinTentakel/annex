/*!
 * @oktarintentakel/annex v0.1.13-beta
 */
/*!
 * Module Basic
 */
const MODULE_NAME="Basic";import{log,warn}from"./logging.js";export function assert(t,e){if(!t)throw e=orDefault(e,"assert exception: assertion failed","str"),new Error(e)}export function attempt(t){assert(isFunction(t),"Basic:attempt | closure is no function");try{t()}catch(t){return!1}return!0}export function hasValue(){let t=!0;return Array.from(arguments).forEach((e=>{t&&=null!=e})),t}export function size(t,e=!0){if(isFunction(t?.values))return Array.from(t.values()).length;let r;switch(getType(t)){case"array":r=t.length;break;case"set":case"map":r=t.size;break;case"iterator":r=Array.from(t).length;break;case"string":r=e?[...t].length:t.length;break;case"object":r=Object.values(t).length;break;default:r=null}return r}export function isEmpty(){let t=!0,e=[void 0,null,"",0];return Array.from(arguments).forEach((t=>{isArray(t?.__additionalEmptyValues__)&&(e=e.concat(t.__additionalEmptyValues__))})),e=Array.from(new Set(e)),Array.from(arguments).forEach((r=>{t&&!isArray(r?.__additionalEmptyValues__)&&(t=e.includes(r),t||(t=0===size(r)))})),t}export function hasMembers(t,e,r=!1){e=orDefault(e,[],"arr"),r=orDefault(r,!1,"bool");let n=!0;return e.forEach((e=>{hasValue(t[`${e}`])||(r&&log().info(`Basic:hasMembers | missing member ${e}`),n=!1)})),n}export function orDefault(t,e,r=null,n=null){return n=hasValue(n)?[].concat(n):[],hasValue(r)?!isFunction(r)&&["str","string","int","integer","bool","boolean","float","arr","array"].includes(`${r.toLowerCase()}`)?(r=`${r}`.toLowerCase(),["str","string"].includes(r)?r=function(t){return`${t}`}:["int","integer"].includes(r)?r=function(t){return parseInt(t,10)}:["bool","boolean"].includes(r)?r=function(t){return!!t}:"float"===r?r=function(t){return parseFloat(t)}:["arr","array"].includes(r)&&(r=function(t){return[].concat(t)})):isFunction(r)||(r=function(t){return t}):r=function(t){return t},!hasValue(t)||n.includes(t)?e:r(t)}export function getType(t){if(!hasValue(t))return`${t}`.toLowerCase();const e=Object.prototype.toString.call(t).slice(8,-1).toLowerCase();return"generatorfunction"===e?"function":"document"===e?"htmldocument":"element"===e||/^html.*element$/.test(e)?"htmlelement":/^.*iterator$/.test(e)?"iterator":e.match(/^(array|bigint|date|error|function|generator|regexp|symbol|set|weakset|map|weakmap|htmldocument|htmlcollection|nodelist|window|url|urlsearchparams)$/)?e:"object"==typeof t||"function"==typeof t?"object":typeof t}export function isA(t,e){return["undefined","null","boolean","number","bigint","string","symbol","function","object","array","date","error","generator","iterator","regexp","set","weakset","map","weakmap","htmldocument","htmlelement","htmlcollection","nodelist","window","url","urlsearchparams"].includes(`${e}`.toLowerCase())?getType(t)===`${e}`.toLowerCase():(warn(`Basic:isA | "${e}" is not a recognized type`),!1)}export function isBoolean(t){return isA(t,"boolean")}export function isNumber(t){return isA(t,"number")}export function isBigInt(t){return isA(t,"bigint")}export function isInt(t){return parseInt(t,10)===t}export function isFloat(t){return parseFloat(t)===t}export function isNaN(t,e=!0){return(e=orDefault(e,!0,"bool"))?t!=t:isNaN(t)}export function isString(t){return isA(t,"string")}export function isSymbol(t){return isA(t,"symbol")}export function isFunction(t){return isA(t,"function")}export function isObject(t){return isA(t,"object")}export function isPlainObject(t){return isObject(t)&&hasValue(t)&&t.constructor===Object&&"[object Object]"===Object.prototype.toString.call(t)}export function isArray(t){return isA(t,"array")}export function isDate(t){return isA(t,"date")}export function isError(t){return isA(t,"error")}export function isGenerator(t){return isA(t,"generator")}export function isIterator(t){return isA(t,"iterator")}export function isRegExp(t){return isA(t,"regexp")}export function isSet(t){return isA(t,"set")}export function isWeakSet(t){return isA(t,"weakset")}export function isMap(t){return isA(t,"map")}export function isWeakMap(t){return isA(t,"weakmap")}export function isDocument(t){return isA(t,"htmldocument")}export function isElement(t){return isA(t,"htmlelement")}export function isCollection(t){return isA(t,"htmlcollection")}export function isNodeList(t){return isA(t,"nodelist")}export function isWindow(t){return isA(t,"window")}export function isUrl(t){return isA(t,"url")}export function isUrlSearchParams(t){return isA(t,"urlsearchparams")}export function isEventTarget(t){return hasValue(t)&&isFunction(t.addEventListener)&&isFunction(t.removeEventListener)&&isFunction(t.dispatchEvent)}export function isSelector(t){t=orDefault(t,0,"str");const e=document.createDocumentFragment();try{e.querySelector(t)}catch(t){return!1}return!0}export function isPotentialId(t,e="",r="[1-9][0-9]*",n="",o=!0){t=`${t}`,e=orDefault(e,"","str"),r=orDefault(r,"[1-9][0-9]*","str"),n=orDefault(n,"","str");const i=t=>`${t}`.replace(/([\-\[\]\/{}()*+?.\\^$|])/g,"\\$&");let s;s=(o=orDefault(o,!0,"bool"))?new RegExp(`^${i(e)}(${r})${i(n)}$`):new RegExp(`^${e}(${r})${n}$`);const u=s.exec(t);return!!hasValue(u)&&u[1]}export function min(t,e){return t<e?e:t}export function max(t,e){return t>e?e:t}export function minMax(t,e,r){return assert(t<=r,"Basic:minMax | minValue can not be larger than maxValue"),min(max(e,r),t)}export function round(t,e=0){t=parseFloat(t),e=min(orDefault(e,0,"int"),0);const r=Math.pow(10,e);return Math.round(parseFloat(t)*r)/r}export class Deferred{constructor(){const t="fulfilled",e="rejected";this.resolve=null,this.reject=null,this.provision=null,this.status="pending",this.isSettled=()=>[t,e].includes(this.status),this.promise=new Promise(((r,n)=>{this.resolve=e=>{this.status=t,r(e)},this.reject=t=>{this.status=e,n(t)}}))}then(t){return this.promise.then(t)}catch(t){return this.promise.catch(t)}finally(t){return this.promise.finally(t)}}export class Observable{#t="Observable";#e;#r;constructor(t){this.#e=t,this.#r=[]}getValue(){return this.#e}setValue(t,e=!1){const r=this.#e,n=r!==t;this.#e=t,(n||e)&&this.#r.forEach((e=>e(t,r)))}subscribe(t){return assert(isFunction(t),`Basic:${this.#t}.subscribe | subscription must be function`),this.#r.indexOf(t)<0&&(this.#r=[...this.#r,t]),t}unsubscribe(t){this.#r=this.#r.filter((e=>e!==t))}toString(){return`${this.#e}`}}
//# sourceMappingURL=basic.js.map

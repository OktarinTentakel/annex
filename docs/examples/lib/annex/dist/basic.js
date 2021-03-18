/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Basic
 */
const MODULE_NAME="Basic";import{log,warn}from"./logging.js";export function assert(t,e){if(!t)throw e=orDefault(e,"assert exception: assertion failed","str"),new Error(e)}export function attempt(t){assert(isA(t,"function"),"Basic:attempt | closure is not a function");try{t()}catch(t){return!1}return!0}export function hasValue(){let t=!0;return Array.from(arguments).forEach((e=>{t=t&&null!=e})),t}export function isEmpty(){let t=!0,e=[void 0,null,"",0];return Array.from(arguments).forEach((t=>{isA(t?.__additionalEmptyValues__,"array")&&(e=e.concat(t.__additionalEmptyValues__))})),e=Array.from(new Set(e)),Array.from(arguments).forEach((r=>{t&&!isA(r?.__additionalEmptyValues__,"array")&&(t=e.includes(r),t||(isA(r,"array")?t=0===r.length:isA(r,"object")?t=0===Object.keys(r).length:(isA(r,"set")||isA(r,"map"))&&(t=0===r.size)))})),t}export function hasMembers(t,e,r){r=orDefault(r,!1,"bool");let n=!0;return e.forEach((e=>{hasValue(t[e])||(r&&log().info(`Basic:hasMembers | missing member ${e}`),n=!1)})),n}export function orDefault(t,e,r=null,n=null){return n=hasValue(n)?[].concat(n):[],hasValue(r)?!isA(r,"function")&&["str","string","int","integer","bool","boolean","float","arr","array"].includes(`${r.toLowerCase()}`)?(r=`${r}`.toLowerCase(),["str","string"].includes(r)?r=function(t){return`${t}`}:["int","integer"].includes(r)?r=function(t){return parseInt(t,10)}:["bool","boolean"].includes(r)?r=function(t){return!!t}:"float"===r?r=function(t){return parseFloat(t)}:["arr","array"].includes(r)&&(r=function(t){return[].concat(t)})):isA(r,"function")||(r=function(t){return t}):r=function(t){return t},!hasValue(t)||n.includes(t)?e:r(t)}export function getType(t){if(!hasValue(t))return`${t}`.toLowerCase();const e=Object.prototype.toString.call(t).slice(8,-1).toLowerCase();return"generatorfunction"===e?"function":"document"===e?"htmldocument":"element"===e||/^html.*element$/.test(e)?"htmlelement":e.match(/^(array|bigint|date|error|function|generator|regexp|symbol|set|weakset|map|weakmap|htmldocument|nodelist)$/)?e:"object"==typeof t||"function"==typeof t?"object":typeof t}export function isA(t,e){return["undefined","null","boolean","number","bigint","string","symbol","function","object","array","date","error","generator","regexp","set","weakset","map","weakmap","htmldocument","htmlelement","nodelist"].includes(`${e}`.toLowerCase())?getType(t)===`${e}`.toLowerCase():(warn(`Basic:isA | "${e}" is not a recognized type`),!1)}export function isInt(t){return parseInt(t,10)===t}export function isFloat(t){return parseFloat(t)===t}export function isPlainObject(t){return isA(t,"object")&&hasValue(t)&&t.constructor===Object&&"[object Object]"===Object.prototype.toString.call(t)}export function isNaN(t,e){return(e=orDefault(e,!0,"bool"))?t!=t:isNaN(t)}export function minMax(t,e,r){return assert(t<=r,"Basic:minMax | min can not be larger than max"),e<t?t:e>r?r:e}export class Deferred{constructor(){this.resolve=null,this.reject=null,this.promise=new Promise(((t,e)=>{this.resolve=t,this.reject=e}))}then(t){return this.promise.then(t)}catch(t){return this.promise.catch(t)}}
//# sourceMappingURL=basic.js.map

/*!
 * @oktarintentakel/annex v0.1.19-beta
 */
/*!
 * Module Random
 */
const MODULE_NAME="Random";import{orDefault,assert,hasValue,isFunction}from"./basic.js";import{pad}from"./strings.js";import{toBaseX}from"./conversion.js";const RANDOM_UUIDS_USED_SINCE_RELOAD=new Set,DEFAULT_USER_CODE_ALPHABET="ACDEFGHKLMNPQRSTUVWXYZ2345679";export function randomNumber(o=0,t=10,e=!1,r=2){o=orDefault(o,0,"float"),t=orDefault(t,10,"float"),e=orDefault(e,!1,"bool"),r=orDefault(r,2,"int"),assert(t>=o,`${MODULE_NAME}:randomInt | ceiling smaller than floor`);const n=Math.pow(10,r);e&&(o*=n,t*=n);const a=Math.floor(Math.random()*(t-o+1)+o);return e?Math.round(parseFloat(a)*n)/n/n:a}export function randomUuid(o=!0){o=orDefault(o,!0,"bool");let t=null,e=0;for(;!hasValue(t)||RANDOM_UUIDS_USED_SINCE_RELOAD.has(t);)t=isFunction(window.crypto?.getRandomValues)||isFunction(window.msCrypto?.getRandomValues)?([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(o=>(o^(isFunction(window.crypto?.getRandomValues)?window.crypto.getRandomValues(new Uint8Array(1)):window.msCrypto?.getRandomValues(new Uint8Array(1)))[0]&15>>o/4).toString(16))):"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(o=>{const t=16*Math.random()|0;return("x"===o?t:3&t|8).toString(16)})),RANDOM_UUIDS_USED_SINCE_RELOAD.has(t)&&(e++,e>100&&assert(e<=100,`${MODULE_NAME}:randomUuid | too many collisions, there seems to be randomization problem`));return RANDOM_UUIDS_USED_SINCE_RELOAD.add(t),o?t:t.replace(/-/g,"")}export function randomUserCode(o=DEFAULT_USER_CODE_ALPHABET,t="8",e=8,r=12,n=null){const a="randomUserCode";if(o=orDefault(o,DEFAULT_USER_CODE_ALPHABET,"str"),t=orDefault(t,"8","str")[0],e=orDefault(e,8,"int"),r=orDefault(r,12,"int"),n=orDefault(n,window.crypto?.getRandomValues?.(new Uint16Array(15)).reduce(((o,t)=>o+t),0)??window.msCrypto?.getRandomValues?.(new Uint16Array(15)).reduce(((o,t)=>o+t),0)??randomNumber(1,999999),"int"),r<e)throw Error(`${MODULE_NAME}:${a} | minLength cannot be smaller than maxLength`);let s=""+toBaseX(Number(`${n}${(new Date).toISOString().replace(/[\-T:.Z]/g,"?").split("?").reduce(((o,t)=>o+Number(t)),0)}`),o);if(s.length>r)throw Error(`${MODULE_NAME}:${a} | code too long, check maxLength and custom randomValue`);return s.length<e&&(s=pad(s,t,e,"right")),s}
//# sourceMappingURL=random.js.map

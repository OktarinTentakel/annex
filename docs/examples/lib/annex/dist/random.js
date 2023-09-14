/*!
 * @oktarintentakel/annex v0.1.8-beta
 */
/*!
 * Module Random
 */
const MODULE_NAME="Random";import{orDefault,assert,hasValue,isFunction}from"./basic.js";const RANDOM_UUIDS_USED_SINCE_RELOAD=new Set;export function randomNumber(o=0,t=10,n=!1,a=2){o=orDefault(o,0,"float"),t=orDefault(t,10,"float"),n=orDefault(n,!1,"bool"),a=orDefault(a,2,"int"),assert(t>=o,"Random:randomInt | ceiling smaller than floor");const e=Math.pow(10,a);n&&(o*=e,t*=e);const r=Math.floor(Math.random()*(t-o+1)+o);return n?Math.round(parseFloat(r)*e)/e/e:r}export function randomUuid(o=!0){o=orDefault(o,!0,"bool");let t=null,n=0;for(;!hasValue(t)||RANDOM_UUIDS_USED_SINCE_RELOAD.has(t);)t=isFunction(window.crypto?.getRandomValues)||isFunction(window.msCrypto?.getRandomValues)?([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(o=>(o^(isFunction(window.crypto?.getRandomValues)?window.crypto.getRandomValues(new Uint8Array(1)):window.msCrypto?.getRandomValues(new Uint8Array(1)))[0]&15>>o/4).toString(16))):"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(o=>{const t=16*Math.random()|0;return("x"===o?t:3&t|8).toString(16)})),RANDOM_UUIDS_USED_SINCE_RELOAD.has(t)&&(n++,n>100&&assert(n<=100,"Random:randomUuid | too many collisions, there seems to be randomization problem"));return RANDOM_UUIDS_USED_SINCE_RELOAD.add(t),o?t:t.replace(/-/g,"")}
//# sourceMappingURL=random.js.map

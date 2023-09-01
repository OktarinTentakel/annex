/*!
 * @oktarintentakel/annex v0.1.5-beta
 */
/*!
 * Module Random
 */
const MODULE_NAME="Random";import{orDefault,assert,hasValue,isA}from"./basic.js";const RANDOM_UUIDS_USED_SINCE_RELOAD=new Set;export function randomNumber(o=0,t=10,a=!1,n=2){o=orDefault(o,0,"float"),t=orDefault(t,10,"float"),a=orDefault(a,!1,"bool"),n=orDefault(n,2,"int"),assert(t>=o,"Random:randomInt | ceiling smaller than floor");const e=Math.pow(10,n);a&&(o*=e,t*=e);const r=Math.floor(Math.random()*(t-o+1)+o);return a?Math.round(parseFloat(r)*e)/e/e:r}export function randomUuid(o=!0){o=orDefault(o,!0,"bool");let t=null,a=0;for(;!hasValue(t)||RANDOM_UUIDS_USED_SINCE_RELOAD.has(t);)t=isA(window.crypto?.getRandomValues,"function")||isA(window.msCrypto?.getRandomValues,"function")?([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(o=>(o^(isA(window.crypto?.getRandomValues,"function")?window.crypto.getRandomValues(new Uint8Array(1)):window.msCrypto?.getRandomValues(new Uint8Array(1)))[0]&15>>o/4).toString(16))):"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(o=>{const t=16*Math.random()|0;return("x"===o?t:3&t|8).toString(16)})),RANDOM_UUIDS_USED_SINCE_RELOAD.has(t)&&(a++,a>100&&assert(a<=100,"Random:randomUuid | too many collisions, there seems to be randomization problem"));return RANDOM_UUIDS_USED_SINCE_RELOAD.add(t),o?t:t.replace(/-/g,"")}
//# sourceMappingURL=random.js.map

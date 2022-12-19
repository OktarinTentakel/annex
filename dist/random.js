/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Random
 */
const MODULE_NAME="Random";import{orDefault,assert,hasValue,isA}from"./basic.js";const RANDOM_UUIDS_USED_SINCE_RELOAD=new Set;export function randomNumber(o=0,t=10,a=!1,e=2){o=orDefault(o,0,"float"),t=orDefault(t,10,"float"),a=orDefault(a,!1,"bool"),e=orDefault(e,2,"int"),assert(t>=o,"Random:randomInt | ceiling smaller than floor");const r=Math.pow(10,e);a&&(o*=r,t*=r);const n=Math.floor(Math.random()*(t-o+1)+o);return a?Math.round(parseFloat(n)*r)/r/r:n}export function randomUuid(o=!0){o=orDefault(o,!0,"bool");const t=window.crypto?.getRandomValues??window.msCrypto?.getRandomValues;let a=null,e=0;for(;!hasValue(a)||RANDOM_UUIDS_USED_SINCE_RELOAD.has(a);)a=isA(t,"function")?([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(o=>(o^t(new Uint8Array(1))[0]&15>>o/4).toString(16))):"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(o=>{const t=16*Math.random()|0;return("x"===o?t:3&t|8).toString(16)})),RANDOM_UUIDS_USED_SINCE_RELOAD.has(a)&&(e++,e>100&&assert(e<=100,"Random:randomUuid | too many collisions, there seems to be randomization problem"));return RANDOM_UUIDS_USED_SINCE_RELOAD.add(a),o?a:a.replace(/-/g,"")}
//# sourceMappingURL=random.js.map

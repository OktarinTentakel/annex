/*!
 * @oktarintentakel/annex v0.1.13-beta
 */
/*!
 * Module Animation
 */
const MODULE_NAME="Animation";import{hasValue,isPlainObject,isEmpty,isNaN,isElement,orDefault,assert,Deferred}from"./basic.js";import{warn}from"./logging.js";import{pschedule,countermand,waitForRepaint}from"./timers.js";import{applyStyles}from"./css.js";const RUNNING_TRANSITIONS=new WeakMap;export const EasingFunctions={linear:e=>e,easeInQuad:e=>e*e,easeOutQuad:e=>e*(2-e),easeInOutQuad:e=>e<.5?2*e*e:(4-2*e)*e-1,easeInCubic:e=>e*e*e,easeOutCubic:e=>--e*e*e+1,easeInOutCubic:e=>e<.5?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1,easeInQuart:e=>e*e*e*e,easeOutQuart:e=>1- --e*e*e*e,easeInOutQuart:e=>e<.5?8*e*e*e*e:1-8*--e*e*e*e,easeInQuint:e=>e*e*e*e*e,easeOutQuint:e=>1+--e*e*e*e*e,easeInOutQuint:e=>e<.5?16*e*e*e*e*e:1+16*--e*e*e*e*e};export function transition(e,t=null,a=null,s=!1){const n="cssTransition";t=orDefault(t,{}),a=orDefault(a,{}),s=orDefault(s,!1,"bool"),assert(isElement(e),`Animation:${n} | element is not usable`),assert(isPlainObject(t),`Animation:${n} | classChanges is not a plain object`),assert(isPlainObject(a),`Animation:${n} | styleChanges is not a plain object`);const i=new Deferred,o=RUNNING_TRANSITIONS.get(e);if(hasValue(o))if(countermand(o.timer),s){const t=new Error("interrupted");t.element=e,o.deferred.reject(t)}else o.deferred.resolve(e);RUNNING_TRANSITIONS.delete(e);const r=["transition-duration","-webkit-transition-duration","-moz-transition-duration","-o-transition-duration"],l=["transition","-webkit-transition","-moz-transition","-o-transition"],u=[...r,...l],c={property:null,value:null};if(!isEmpty(a)){let t;[r,l].forEach((e=>{t=!1,e.forEach((s=>{const n=a[s];!t&&hasValue(n)&&(t=!0,e.forEach((e=>{a[e]=n})))}))})),applyStyles(e,a)}return isEmpty(t?.remove)||[].concat(t.remove).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.remove(t.trim())}))})),isEmpty(t?.add)||[].concat(t.add).forEach((t=>{`${t}`.split(" ").forEach((t=>{e.classList.add(t.trim())}))})),waitForRepaint((()=>{const t=getComputedStyle(e);if(u.forEach((e=>{!hasValue(c.value)&&hasValue(t[e])&&(c.property=e,c.value=t[e])})),hasValue(c.value)){const t=c.value.match(/(^|\s)(\d+(\.\d+)?)s(\s|,|$)/g),a=c.value.match(/(^|\s)(\d+)ms(\s|,|$)/g);let s=0;(t??[]).forEach((e=>{e=parseFloat(e),isNaN(e)||(e=Math.floor(1e3*e))>s&&(s=e)})),(a??[]).forEach((e=>{e=parseInt(e,10),!isNaN(e)&&e>s&&(s=e)})),RUNNING_TRANSITIONS.set(e,{deferred:i,timer:pschedule(s,(()=>{waitForRepaint((()=>{i.resolve(e),RUNNING_TRANSITIONS.delete(e)}))}))})}else warn(`Animation:${n} | no usable transitions on element "${e}"`),i.resolve(e)})),i}
//# sourceMappingURL=animation.js.map

/*!
 * @oktarintentakel/annex v0.1.11-beta
 */
/*!
 * Module Context
 */
const MODULE_NAME="Context";import{hasValue,isFunction,isArray,orDefault,Observable}from"./basic.js";import{throttle}from"./functions.js";import{reschedule}from"./timers.js";const INTERACTION_TYPE_DETECTION={touchHappening:!1,touchEndingTimer:null,touchStartHandler(){INTERACTION_TYPE_DETECTION.touchHappening=!0,"touch"!==CURRENT_INTERACTION_TYPE.getValue()&&CURRENT_INTERACTION_TYPE.setValue("touch")},touchEndHandler(){INTERACTION_TYPE_DETECTION.touchEndingTimer=reschedule(INTERACTION_TYPE_DETECTION.touchEndingTimer,1032,(()=>{INTERACTION_TYPE_DETECTION.touchHappening=!1}))},blurHandler(){INTERACTION_TYPE_DETECTION.touchEndingTimer=reschedule(INTERACTION_TYPE_DETECTION.touchEndingTimer,1032,(()=>{INTERACTION_TYPE_DETECTION.touchHappening=!1}))},mouseMoveHandler:throttle(1e3,(function(){CURRENT_INTERACTION_TYPE.getValue("pointer")&&!INTERACTION_TYPE_DETECTION.touchHappening&&CURRENT_INTERACTION_TYPE.setValue("pointer")}))};export let CURRENT_INTERACTION_TYPE;export function browserSupportsHistoryManipulation(){return hasValue(window.history)&&isFunction(window.history.pushState)&&isFunction(window.history.replaceState)}export function contextHasHighDpi(){return!!window.matchMedia&&window.matchMedia("only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (-o-min-device-pixel-ratio: 3/2),only screen and (min--moz-device-pixel-ratio: 1.5),only screen and (min-device-pixel-ratio: 1.5),only screen and (min-resolution: 144dpi),only screen and (min-resolution: 1.5dppx)").matches}export function getBrowserScrollbarWidth(){const e=document.createElement("div");e.style.visibility="hidden",e.style.opacity="0",e.style.pointerEvents="none",e.style.overflow="scroll",e.style.position="fixed",e.style.top="0",e.style.right="0",e.style.left="0",e.style.height="50px";const t=document.createElement("div");t.style.width="100%",t.style.height="100px",e.appendChild(t),document.body.appendChild(e);const n=e.offsetWidth-t.offsetWidth;return document.body.removeChild(e),n}export function detectInteractionType(e=!1){return e=orDefault(e,!1,"bool"),hasValue(CURRENT_INTERACTION_TYPE)||(CURRENT_INTERACTION_TYPE=new Observable(""),"ontouchstart"in document&&"ontouchend"in document&&window.navigator.maxTouchPoints>0?CURRENT_INTERACTION_TYPE.setValue("touch"):CURRENT_INTERACTION_TYPE.setValue("pointer"),document.addEventListener("touchstart",INTERACTION_TYPE_DETECTION.touchStartHandler),document.addEventListener("touchend",INTERACTION_TYPE_DETECTION.touchEndHandler),window.addEventListener("blur",INTERACTION_TYPE_DETECTION.blurHandler),document.addEventListener("mousemove",INTERACTION_TYPE_DETECTION.mouseMoveHandler)),e?CURRENT_INTERACTION_TYPE:CURRENT_INTERACTION_TYPE.getValue()}export function detectAppleDevice(e=null){let t=/iPhone|iPad|iPod|Macintosh/.exec(window.navigator.userAgent),n=null;if(Array.isArray(t)&&t.length>0?t=t[0]:(t=/^(iPhone|iPad|iPod|Mac)/.exec(window.navigator.platform),Array.isArray(t)&&t.length>0?(t=t[0],"Mac"===t&&(t="Macintosh")):t=null),hasValue(t)){switch("Macintosh"===t&&window.navigator.maxTouchPoints>1&&(t="iPad"),t){case"iPad":n="ipad";break;case"iPhone":n="iphone";break;case"iPod":n="ipod";break;case"Macintosh":n="mac"}isFunction(e)&&(n=e(n))}return n}export function getBrowserLanguage(e=null){let t=null;if(hasValue(window.navigator.languages)){const e=Array.from(window.navigator.languages);isArray(e)&&e.length>0&&(t=`${e[0]}`)}hasValue(t)||["language","browserLanguage","userLanguage","systemLanguage"].forEach((e=>{if(!hasValue(t)){const n=window.navigator[e];t=hasValue(n)?`${n}`:null}})),!hasValue(t)&&hasValue(e)&&(t=`${e}`);const n=t.split("-");t=n[0].toLowerCase().trim();const o=n?.[1]?.toUpperCase()?.trim();return t=hasValue(o)?`${t}-${o}`:t,t}export function getLocale(e=null,t=null){e=orDefault(e,document.documentElement);const n={code:null,country:null,language:null,isFallback:!1};let o=isFunction(e.getAttribute)?e.getAttribute("lang"):null;if(!hasValue(o)&&hasValue(t)&&(o=`${t}`,n.isFallback=!0),hasValue(o)){const e=`${o}`.split("-");n.country=e?.[1]?.toLowerCase()?.trim(),n.language=e[0].toLowerCase().trim(),n.code=hasValue(n.country)?`${n.language}-${n.country.toUpperCase()}`:n.language}return n}export function getBrowserLocale(e=null){return getLocale({getAttribute:()=>getBrowserLanguage(e)},e)}
//# sourceMappingURL=context.js.map

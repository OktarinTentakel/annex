/*!
 * @oktarintentakel/annex v0.1.3-beta
 */
/*!
 * Module Interaction
 */
const MODULE_NAME="Interaction";import{assert,isA,orDefault,hasValue,Deferred}from"./basic.js";import{findTextNodes}from"./elements.js";import{applyStyles}from"./css.js";export const TAPPABLE_ELEMENTS_SELECTOR="a, button, .button, input[type=button], input[type=submit]";const NOT_AN_HTMLELEMENT_ERROR="given node/target is not an HTMLElement";export function createSelection(e,t=0,n=0){let s,a,l,o;if(t=orDefault(t,0,"int"),n=orDefault(n,0,"int"),assert(isA(e,"htmlelement"),`${MODULE_NAME}:createSelection | ${NOT_AN_HTMLELEMENT_ERROR}`),hasValue(e.selectionStart,e.selectionEnd))e.focus(),e.select(),o=e.value,e.selectionStart=t,e.selectionEnd=o.length-n,s=o.substring(e.selectionStart,e.selectionEnd);else if(isA(window.getSelection,"function")){if(a=document.createRange(),a.selectNodeContents(e),hasValue(t)||hasValue(n)){const s=findTextNodes(e);if(s.length>0){let e=0,l=s[e],o=s.length-1,r=s[o];if(hasValue(t)){let n=t,o=n<=l.length;for(;!o&&hasValue(l);)e++,hasValue(s[e])?(n-=l.length,l=s[e],o=n<=l.length):(n=l.length,o=!0);a.setStart(l,n)}if(hasValue(n)){let e=n,t=e<=r.length;for(;!t&&hasValue(r);)o--,hasValue(s[o])?(e-=r.length,r=s[o],t=e<=r.length):(e=r.length,t=!0);a.setEnd(r,r.length-e)}}}l=window.getSelection(),l.removeAllRanges(),l.addRange(a),s=a.toString()}else isA(document.body.createTextRange,"function")&&(a=document.body.createTextRange(),a.moveToElementText(e),hasValue(t)&&a.moveStart("character",t),hasValue(n)&&a.moveEnd("character",-n),a.select(),s=a.text);return s}export function removeSelections(){isA(window.getSelection,"function")?window.getSelection().removeAllRanges():isA(document.getSelection,"function")&&document.getSelection().removeAllRanges(),hasValue(document.selection)&&document.selection.empty()}export function disableSelection(e){return assert(isA(e,"htmlelement"),`${MODULE_NAME}:disableSelection | ${NOT_AN_HTMLELEMENT_ERROR}`),e.onselectstart=()=>!1,e.unselectable="on",applyStyles(e,{"user-select":"none"},!0),applyStyles(e,{"-webkit-touch-callout":"none"}),e}export function enableSelection(e){return assert(isA(e,"htmlelement"),`${MODULE_NAME}:disableSelection | ${NOT_AN_HTMLELEMENT_ERROR}`),e.onselectstart=void 0,e.unselectable="off",applyStyles(e,{"user-select":null},!0),applyStyles(e,{"-webkit-touch-callout":null}),e}export function obfuscatePrivateMailToLink(e,t=!1,n="",s="",a="",l="",o="",r="",i="",c=""){t=orDefault(t,!1,"bool"),l=orDefault(l,"","str"),o=orDefault(o,"","str"),a=orDefault(a,"","str"),s=orDefault(s,"","str"),n=orDefault(n,"","str"),c=orDefault(c,"","str"),i=orDefault(i,"","str"),r=orDefault(r,"","str"),assert(""!==a&&""!==s,`${MODULE_NAME}:obfuscatePrivateMailToLink | basic mail parts missing`),""!==n&&(n=`.${n}`),""!==r&&(r=`.${r}`);let u=new URLSearchParams;""!==l&&u.set("subject",l),""!==o&&u.set("body",o),""!==c&&""!==i&&u.set("cc",`${c}@${i}${r}`),u=u.toString(),""!==u&&(u=`?${u.replaceAll("+","%20")}`);let E=0;const f=()=>{E++,e.setAttribute("href",`mailto:${a}@${s}${n}${u}`)};e.addEventListener("mouseenter",f),e.addEventListener("focusin",f);const d=()=>{E--,E<=0&&e.setAttribute("href","")};return e.addEventListener("mouseleave",d),e.addEventListener("focusout",d),t&&(e.innerHTML=`${a}@${s}${n}`.replace(/(\w{1})/g,"$1&zwnj;")),e}export function obfuscatePrivateTelLink(e,t=!1,n="",s="",a="",l=""){t=orDefault(t,!1,"bool"),n=orDefault(n,"","str").replace(/[^0-9\-]/g,""),s=orDefault(s,"","str").replace(/[^0-9\-]/g,""),a=orDefault(a,"","str").replace(/[^0-9]/g,""),l=orDefault(l,"","str").replace(/[^0-9]/g,""),assert(""!==s||""!==n,`${MODULE_NAME}:obfuscatePrivateTelLink | basic tel parts missing`);let o=0;const r=()=>{o++,e.setAttribute("href",`tel:+${l}${a}${s.replace(/-/g,"")}${n.replace(/-/g,"")}`)};e.addEventListener("mouseenter",r),e.addEventListener("focusin",r);const i=()=>{o--,o<=0&&e.setAttribute("href","")};e.addEventListener("mouseleave",i),e.addEventListener("focusout",i),t&&(e.innerHTML=`+${l} ${a} ${s}${n}`.replace(/(\w{1})/g,"$1&zwnj;"))}export function setTappedState(e,t="tapped",n=200){t=orDefault(t,"tapped","str"),n=orDefault(n,200,"int"),assert(isA(e,"htmlelement"),`${MODULE_NAME}:setTappedState | ${NOT_AN_HTMLELEMENT_ERROR}`);const s=new Deferred;return e.classList.add(t),window.setTimeout((()=>{e.classList.remove(t),e.blur(),s.resolve(e)}),n),s}export function setupAutoTappedStates(e=null,t=TAPPABLE_ELEMENTS_SELECTOR,n="click",s="tapped",a=200){e=orDefault(e,document.body),t=orDefault(t,TAPPABLE_ELEMENTS_SELECTOR,"str"),n=orDefault(n,"click","str"),n=[].concat(n),assert(isA(e,"htmlelement"),`${MODULE_NAME}:setupAutoTappedStates | ${NOT_AN_HTMLELEMENT_ERROR}`),n.forEach((n=>{e.addEventListener(n,(e=>{hasValue(e.target?.matches)&&e.target.matches(t)&&setTappedState(e.target,s,a)}))}))}
//# sourceMappingURL=interaction.js.map

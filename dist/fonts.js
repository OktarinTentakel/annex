/*!
 * annex v0.1.1-beta
 */
/*!
 * Module Fonts
 */
const MODULE_NAME="Fonts";import{hasValue,orDefault,Deferred}from"./basic.js";import{createNode}from"./elements.js";import{applyStyles}from"./css.js";import{loop,countermand}from"./timers.js";export function waitForWebfonts(e,t="sans-serif",o=5e3){e=orDefault(e,[],"arr").map((e=>`${e}`)),t=orDefault(t,"sans-serif","string"),o=orDefault(o,5e3,"int");const n=new Deferred,r=(new Date).getTime();let i=0;return e.forEach((l=>{let s=createNode("span",null,"giItT1WQy@!-/#");applyStyles(s,{position:"absolute",visibility:"hidden",left:"-10000px",top:"-10000px","font-size":"300px","font-family":t,"font-variant":"normal","font-style":"normal","font-weight":"normal","letter-spacing":"0","white-space":"pre","line-height":1}),document.body.appendChild(s);const a={width:s.offsetWidth,height:s.offsetHeight};applyStyles(s,{"font-family":`${l}, ${t}`});let f=null;const h=()=>{return(new Date).getTime()-r>=o?(countermand(f),hasValue(s)&&(document.body.removeChild(s),s=null),n.reject(new Error("timeout")),!0):(hasValue(s)&&(t={width:s.offsetWidth,height:s.offsetHeight},l=a,t.width!==l.width||t.height!==l.height)&&(countermand(f),document.body.removeChild(s),s=null,i++),i>=e.length&&(n.resolve(1===e.length?e[0]:e),!0));var t,l};h()||(f=loop(100,h))})),n}
//# sourceMappingURL=fonts.js.map

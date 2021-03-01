/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Viewport
 */
import{hasValue,orDefault,isA,Deferred}from"./basic.js";import{EasingFunctions}from"./animation.js";import{requestAnimationFrame}from"./timers.js";export function isInViewport(t,e){let n,o;e=orDefault(e,!1,"boolean");try{n=t.getBoundingClientRect()}catch(t){return!0}return o=e?{top:0,right:window.innerWidth,bottom:window.innerHeight,left:0}:{top:1-(n.bottom-n.top),right:window.innerWidth+(n.right-n.left)+1,bottom:window.innerHeight+(n.bottom-n.top)+1,left:1-(n.right-n.left)},n.top>=o.top&&n.right<=o.right&&n.left>=o.left&&n.bottom<=o.bottom}export function scrollTo(t,e,n,o,i,r){e=orDefault(e,1e3,"integer"),n=orDefault(n,0,"integer"),o=orDefault(o,"easeInOutCubic","string"),i=orDefault(i,!1,"boolean"),r=orDefault(r,!1,"boolean"),o=isA(EasingFunctions[o],"function")?EasingFunctions[o]:EasingFunctions.easeInOutCubic;const s=new Deferred,a=t.self===t;let l=!a&&isInViewport(t,!0);try{t.getBoundingClientRect()}catch(t){l=!1}if(i||!l){let i,l,u=!1;const f=window.pageYOffset;l=a?n:window.pageYOffset+t.getBoundingClientRect().top-Math.round(window.innerHeight/2)+n;const c=l-f,w=function(t){if(!u){hasValue(i)||(i=t);const n=t-i,r=o(Math.min(n/e,1));window.scrollTo(0,f+c*r),n<e&&r<1?requestAnimationFrame(w):s.resolve()}};if(r){const t=function(){u=!0,s.reject(),window.removeEventListener("DOMMouseScroll",t),window.removeEventListener("mousewheel",t)};window.addEventListener("DOMMouseScroll",t),window.addEventListener("mousewheel",t)}0!==c&&requestAnimationFrame(w)}return s}
//# sourceMappingURL=viewport.js.map

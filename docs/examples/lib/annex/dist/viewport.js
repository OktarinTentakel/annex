/*!
 * annex v0.1.0-dev
 */
/*!
 * Module Viewport
 */
const MODULE_NAME="Viewport";import{hasValue,orDefault,isA,Deferred}from"./basic.js";import{EasingFunctions}from"./animation.js";import{requestAnimationFrame}from"./timers.js";export function isInViewport(t,e){let o,n;e=orDefault(e,!1,"bool");try{o=t.getBoundingClientRect()}catch(t){return!0}return n=e?{top:0,right:window.innerWidth,bottom:window.innerHeight,left:0}:{top:1-(o.bottom-o.top),right:window.innerWidth+(o.right-o.left)+1,bottom:window.innerHeight+(o.bottom-o.top)+1,left:1-(o.right-o.left)},o.top>=n.top&&o.right<=n.right&&o.left>=n.left&&o.bottom<=n.bottom}export function scrollTo(t,e,o,n,i,r){e=orDefault(e,1e3,"int"),o=orDefault(o,0,"int"),n=orDefault(n,"easeInOutCubic","str"),i=orDefault(i,!1,"bool"),r=orDefault(r,!1,"bool"),n=isA(EasingFunctions[n],"function")?EasingFunctions[n]:EasingFunctions.easeInOutCubic;const s=new Deferred,l=t.self===t;let u=!l&&isInViewport(t,!0);try{t.getBoundingClientRect()}catch(t){u=!1}if(i||!u){let i,u,a=!1;const f=window.pageYOffset;u=l?o:window.pageYOffset+t.getBoundingClientRect().top-Math.round(window.innerHeight/2)+o;const c=u-f,w=function(t){if(!a){hasValue(i)||(i=t);const o=t-i,r=n(Math.min(o/e,1));window.scrollTo(0,f+c*r),o<e&&r<1?requestAnimationFrame(w):s.resolve()}};if(r){const t=function(){a=!0,s.reject(),window.removeEventListener("DOMMouseScroll",t),window.removeEventListener("mousewheel",t)};window.addEventListener("DOMMouseScroll",t),window.addEventListener("mousewheel",t)}0!==c&&requestAnimationFrame(w)}return s}
//# sourceMappingURL=viewport.js.map

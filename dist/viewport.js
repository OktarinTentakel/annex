/*!
 * @oktarintentakel/annex v0.1.9-beta
 */
/*!
 * Module Viewport
 */
const MODULE_NAME="Viewport";import{hasValue,orDefault,isWindow,isFunction,isElement,isBoolean,isNumber,Deferred,Observable,assert,min,minMax,round}from"./basic.js";import{isInDom}from"./elements.js";import{EasingFunctions}from"./animation.js";import{requestAnimationFrame,cancelAnimationFrame}from"./timers.js";import{throttle,defer}from"./functions.js";import{warn}from"./logging.js";export const VISIBILITY_BASE_FPS=15;const DISTANCE_BASE_FPS=4;function getBoundingClientRect(t){let e;try{e=t.getBoundingClientRect()}catch(t){e=window.DOMRect?new DOMRect(0,0,0,0):{top:0,right:0,bottom:0,left:0,width:0,height:0}}return e}class SimplePollingObserver{#t="SimplePollingObserver";#e;#i;#s;#r;constructor(t,e){this.#e=t,this.#i=new Set,this.#s=e?.targetFps??15,this.connect()}connect(){this.disconnect();const t=round(1e3/this.#s),e=throttle(t,(()=>{this.#e(Array.from(this.#i).map((t=>{const e=getBoundingClientRect(t),i=window.innerWidth,s=window.innerHeight,r=e.top<0?Math.abs(e.top):0,o=e.top+e.height>s?e.top+e.height-s:0,n=minMax(0,e.height-r-o,round(e.height)),l={target:t,rootBounds:isInDom(t)?{top:0,right:i,bottom:s,left:0,width:i,height:s}:null,boundingClientRect:e,intersectionRect:{height:n}};return l.intersectionRatio=n/l.boundingClientRect.height,l})))})).bind(this),i=()=>{e(),this.#r=requestAnimationFrame(i)};return this.#r=requestAnimationFrame(i),this}disconnect(){return cancelAnimationFrame(this.#r),this.#r=null,this.#i.clear(),this}observe(t){return this.#i.add(t),this}unobserve(t){return this.#i.delete(t),this}}class VisibilityState{#t="VisibilityState";#o="visibilitystate";#n;#l=!1;#a=!1;#h=!1;#d=!1;#u=0;#c=0;calculateScrolled=!1;#p=0;#w=null;#b=null;calculateDistance=!1;#g=Number.POSITIVE_INFINITY;#v=Number.POSITIVE_INFINITY;#f=null;#m=null;autoHandleTooLargeElements=!0;#V=null;#I=null;#S=null;constructor(t,e=!1,i=!1,s=!0){this.#n=t,this.calculateScrolled=!!e,this.calculateDistance=!!i,this.autoHandleTooLargeElements=!!s}inViewport(t=null){if(hasValue(t)){const e=this.#l;this.#l=!!t,this.#P(e,this.#l,"enteredviewport","leftviewport")}return this.#l}fullyInViewport(t=null){if(hasValue(t)){const e=this.#a;this.#a=!!t,this.#P(e,this.#a,"fullyenteredviewport","fullyleftviewport")}return this.#a}upperBoundInViewport(t=null){if(hasValue(t)){const e=this.#h;this.#h=!!t,this.#P(e,this.#h,"upperboundenteredviewport","upperboundleftviewport")}return this.#h}lowerBoundInViewport(t=null){if(hasValue(t)){const e=this.#d;this.#d=!!t,this.#P(e,this.#d,"lowerboundenteredviewport","lowerboundleftviewport")}return this.#d}visiblePercent(t=null){if(hasValue(t)){const e=this.#u;this.#u=minMax(0,round(parseFloat(t),2),100),this.#P(e,this.#u,"visiblepercent")}return this.#u}visiblePixels(t=null){if(hasValue(t)){const e=this.#c;this.#c=minMax(0,round(parseFloat(t)),round(this.#n.scrollHeight)),this.#P(e,this.#c,"visiblepixels")}return this.#c}scrolledPercent(t=null){if(hasValue(t)){const e=this.#p;this.#p=minMax(0,round(parseFloat(t),2),100),this.#P(e,this.#p,"scrolledpercent")}return this.#p}distancePixels(t=null){if(hasValue(t)){const e=this.#g;this.#g=round(parseFloat(t)),this.#P(e,this.#g,"distancepixels")}return this.#g}distanceViewports(t=null){if(hasValue(t)){const e=this.#v;this.#v=round(parseFloat(t),2),this.#P(e,this.#v,"distanceviewports")}return this.#v}startAutoScrolledPercentUpdates(t,e=15,i=!0){if(this.calculateScrolled&&!hasValue(this.#w)){this.#w=t;const s=round(1e3/e);this.#b=this.#w.subscribe(throttle(s,(()=>{const t=getBoundingClientRect(this.#n),e=window.innerHeight;this.scrolledPercent((t.top-e)/(-t.height-e)*100),i&&this.#E()})))}return this}stopAutoScrolledPercentUpdates(){return hasValue(this.#w)&&this.#w.unsubscribe(this.#b),this.#b=null,this.#w=null,this}startAutoDistanceUpdates(t,e=15){if(this.calculateDistance&&!hasValue(this.#f)){this.#f=t;const i=round(1e3/e);this.#m=this.#f.subscribe(throttle(i,(()=>{const t=getBoundingClientRect(this.#n),e=window.innerHeight,i=t.top-e,s=t.bottom,r=Math.abs(i)<Math.abs(s)?i:s;this.distancePixels(r),this.distanceViewports(r/e)})))}return this}stopAutoDistanceUpdates(){return hasValue(this.#f)&&this.#f.unsubscribe(this.#m),this.#m=null,this.#f=null,this}startAutoTooLargeUpdates(t,e=15){if(this.autoHandleTooLargeElements&&!hasValue(this.#V)){this.#V=t;const i=round(1e3/e);this.#I=this.#V.subscribe(throttle(i,(()=>{this.#E()})))}return this}stopAutoTooLargeUpdates(){return hasValue(this.#V)&&this.#V.unsubscribe(this.#I),this.#I=null,this.#V=null,this}toJson(){const t={inViewport:this.inViewport(),fullyInViewport:this.fullyInViewport(),upperBoundInViewport:this.upperBoundInViewport(),lowerBoundInViewport:this.lowerBoundInViewport(),visiblePercent:this.visiblePercent(),visiblePixels:this.visiblePixels()};return this.calculateScrolled&&(t.scrolledPercent=this.scrolledPercent()),this.calculateDistance&&(t.distancePixels=this.distancePixels(),t.distanceViewports=this.distanceViewports()),t}#U(t,e=null){return this.#n.dispatchEvent(new CustomEvent(`${t}.${this.#o}`,{detail:e??{}})),this}#O(){return hasValue(this.#S)||(this.#S=defer((()=>{this.#S=null,this.#U("changed")})),this.#S()),this}#P(t,e,i,s){return hasValue(e)&&(isBoolean(e)?e&&!t?(this.#U(i),this.#O()):!e&&t&&(this.#U(s),this.#O()):isNumber(e)&&e!==t&&(this.#U(i??s,e),this.#O())),this}#E(){const t=getBoundingClientRect(this.#n),e=window.innerHeight,i=t.top<0?Math.abs(t.top):0,s=t.top+t.height>e?t.top+t.height-e:0;return this.upperBoundInViewport(t.top>=0&&t.top<=e),this.lowerBoundInViewport(t.bottom>=0&&t.bottom<=e),this.visiblePixels(t.height-i-s),this.visiblePercent(this.visiblePixels()/t.height*100),this}}export function isInViewport(t,e=!1){if(e=orDefault(e,!1,"bool"),!isInDom(t))return!1;const i=t.getBoundingClientRect(),s=window.innerWidth,r=window.innerHeight;let o;return o=e?{top:0,right:s,bottom:r,left:0}:{top:1-(i.bottom-i.top),right:s+(i.right-i.left)+1,bottom:r+(i.bottom-i.top)+1,left:1-(i.right-i.left)},i.top>=o.top&&i.right<=o.right&&i.left>=o.left&&i.bottom<=o.bottom}export function scrollTo(t,e=1e3,i=0,s="easeInOutCubic",r=!1,o=!1){e=orDefault(e,1e3,"int"),i=orDefault(i,0,"int"),s=orDefault(s,"easeInOutCubic","str"),r=orDefault(r,!1,"bool"),o=orDefault(o,!1,"bool"),assert(isElement(t)||isWindow(t),"Viewport:scrollTo | element unusable"),assert(e>0,"Viewport:scrollTo | durationMs must be > 0"),s=isFunction(EasingFunctions[s])?EasingFunctions[s]:EasingFunctions.easeInOutCubic;const n=new Deferred,l=t.self===t,a=!l&&isInDom(t),h=!(l||!a)&&isInViewport(t,!0);if((a||l)&&(r||!h)){let r,a,h=!1;const d=window.scrollY??window.pageYOffset;a=l?i:d+getBoundingClientRect(t).top-round(window.innerHeight/2)+i;const u=a-d,c=function(t){if(!h){hasValue(r)||(r=t);const i=t-r,o=s(Math.min(i/e,1));window.scrollTo(0,d+u*o),i<e&&o<1?requestAnimationFrame(c):n.resolve()}};if(o){const t=function(){h=!0,n.reject(new Error("cancelled")),window.removeEventListener("DOMMouseScroll",t),window.removeEventListener("mousewheel",t)};window.addEventListener("DOMMouseScroll",t),window.addEventListener("mousewheel",t)}0!==u&&requestAnimationFrame(c)}return n}class VisibilityObserver{#t="VisibilityObserver";#o="visibilityobserver";#H="html element required";#T;#D=!1;#B=!1;#_;#s;#M;#F;#x;#R;#C;#L;#y;#A;#N;#$;#z;constructor(t=10,e=15,i=!1){this.#T=new Map,this.connect(t,e,i)}connect(t=10,e=15,i=!1){this.disconnect(),this.#_=min(orDefault(t,10,"int"),1),this.#s=minMax(1,orDefault(e,15,"int"),120);const s=round(1e3/e);let r;this.#M=throttle(s,this.#Y).bind(this),this.#F=throttle(s,this.#q).bind(this),this.#x=throttle(s,this.#j).bind(this),this.#R=throttle(s,this.#W).bind(this),this.#C=throttle(s,this.#U,!0,!0).bind(this);try{r=i?SimplePollingObserver:IntersectionObserver}catch(t){warn(`Viewport:${this.#t}.connect | IntersectionObserver not available, falling back to SimplePollingObserver`),r=SimplePollingObserver}return this.#k(),this.#y=new r(this.#J.bind(this),{threshold:this.#L,targetFps:this.#s}),this.#G(),this.#K(),this.#D=!0,this}disconnect(){return this.#Q(),hasValue(this.#y)&&(this.#y.disconnect(),this.#y=null),this.#T.clear(),this.#D=!1,this.#B=!1,this}observe(t,e=!1,i=!1,s=!0){if(this.#X()){const r="addElement";assert(isElement(t),`Viewport:${this.#t}.${r} | ${this.#H}`),isInDom(t)||warn(`Viewport:${this.#t}.${r} | element not in DOM`),this.#T.set(t,new VisibilityState(t,e,i,s)),this.#y.observe(t)}return this}unobserve(t){return this.#T.has(t)&&(this.#T.delete(t),this.#y.unobserve(t)),this}getViewportInfo(){return this.#X()?this.#$:null}getViewportObservable(){return this.#X()?this.#z:null}getState(t){return this.#X()&&this.#T.has(t)?this.#T.get(t):null}#X(){return!!this.#D||(warn(`Viewport:${this.#t}.${__methodName__} | not running, call connect() before`),!1)}#k(){const t=[];for(let e=0;e<=this.#_;e++)t.push(round(e/this.#_,2));return this.#L=t,this}#G(t=!1){const e=window.innerWidth,i=window.innerHeight;hasValue(this.#$)?t?this.#$.scrollTop=window.scrollY??window.pageYOffset:(this.#$.scrollTop=window.scrollY??window.pageYOffset,this.#$.width=e,this.#$.height=i,this.#$.bounds.right=e,this.#$.bounds.bottom=i,this.#$.bounds.width=e,this.#$.bounds.height=i):(this.#$={scrollTop:window.scrollY??window.pageYOffset,width:e,height:i,bounds:{top:0,right:e,bottom:i,left:0,width:e,height:i}},this.#z=new Observable(`${this.#$.scrollTop}${this.#$.width}${this.#$.height}`));const s=`${this.#$.scrollTop}${this.#$.width}${this.#$.height}`;return s!==this.#z.getValue()&&(this.#z.setValue(s),this.#C("viewportchanged",this.#$)),this.#$}#Y(){this.#G(!0)}#q(){this.#G()}#j(){this.#G()}#W(){this.#G()}#J(t){t.forEach((t=>{if(hasValue(t.rootBounds)){const e=this.#T.get(t.target);e.inViewport(t.intersectionRatio>0),e.fullyInViewport(t.intersectionRatio>=1),e.upperBoundInViewport(t.boundingClientRect.top>=t.rootBounds.top&&t.boundingClientRect.top<=t.rootBounds.bottom),e.lowerBoundInViewport(t.boundingClientRect.bottom>=t.rootBounds.top&&t.boundingClientRect.bottom<=t.rootBounds.bottom),e.visiblePercent(100*t.intersectionRatio),e.visiblePixels(t.intersectionRect.height),e.calculateScrolled&&(e.scrolledPercent((t.boundingClientRect.top-t.rootBounds.height)/(-t.boundingClientRect.height-t.rootBounds.height)*100),e.fullyInViewport()?e.startAutoScrolledPercentUpdates(this.#z,this.#s):e.stopAutoScrolledPercentUpdates()),e.calculateDistance&&(e.inViewport()?(e.stopAutoDistanceUpdates(),e.distancePixels(0),e.distanceViewports(0)):e.startAutoDistanceUpdates(this.#z,4)),e.autoHandleTooLargeElements&&t.boundingClientRect.height>t.rootBounds.height&&(e.inViewport()?(e.startAutoTooLargeUpdates(this.#z,this.#s),e.calculateScrolled&&e.startAutoScrolledPercentUpdates(this.#z,this.#s,!1)):(e.stopAutoTooLargeUpdates(),e.calculateScrolled&&e.stopAutoScrolledPercentUpdates()))}})),this.#B||(this.#B=!0,this.#U("initialized")),this.#C("updated")}#U(t,e=null){return document.body.dispatchEvent(new CustomEvent(`${t}.${this.#o}`,{detail:e??{}})),this}#K(){window.addEventListener("scroll",this.#M),window.addEventListener("resize",this.#F),this.#N=new MutationObserver(this.#x),this.#N.observe(document.body,{attributes:!0,childList:!0,subtree:!0});const t=round(1e3/this.#s),e=round(t/10);return this.#A=window.setInterval(this.#W.bind(this),e),this}#Q(){return window.clearInterval(this.#A),window.removeEventListener("scroll",this.#M),window.removeEventListener("resize",this.#F),hasValue(this.#N)&&(this.#N.disconnect(),this.#N=null),this}}export{VisibilityObserver};
//# sourceMappingURL=viewport.js.map

/*!
 * @oktarintentakel/annex v0.1.15-beta
 */
/*!
 * Module Viewport
 */
const MODULE_NAME="Viewport";import{hasValue,orDefault,isWindow,isPlainObject,isArray,isFunction,isElement,isBoolean,isNumber,Deferred,Observable,assert,min,minMax,round}from"./basic.js";import{isInDom}from"./elements.js";import{EasingFunctions}from"./animation.js";import{requestAnimationFrame,cancelAnimationFrame}from"./timers.js";import{throttle,defer}from"./functions.js";import{warn}from"./logging.js";import{fire}from"./events.js";const VISIBILITY_BASE_FPS=15,DISTANCE_BASE_FPS=4,BREAKPOINT_BASE_FPS=4;function getBoundingClientRect(t){let e;try{e=t.getBoundingClientRect()}catch(t){e=window.DOMRect?new DOMRect(0,0,0,0):{top:0,right:0,bottom:0,left:0,width:0,height:0}}return e}class SimplePollingObserver{#t="SimplePollingObserver";#e;#i;#s;#r;constructor(t,e){this.#e=t,this.#i=new Set,this.#s=e?.targetFps??15,this.connect()}connect(){this.disconnect();const t=round(1e3/this.#s),e=throttle(t,(()=>{this.#e(Array.from(this.#i).map((t=>{const e=getBoundingClientRect(t),i=window.innerWidth,s=window.innerHeight,r=e.top<0?Math.abs(e.top):0,n=e.top+e.height>s?e.top+e.height-s:0,o=minMax(0,e.height-r-n,round(e.height)),l={target:t,rootBounds:isInDom(t)?{top:0,right:i,bottom:s,left:0,width:i,height:s}:null,boundingClientRect:e,intersectionRect:{height:o}};return l.intersectionRatio=o/l.boundingClientRect.height,l})))})).bind(this),i=()=>{e(),this.#r=requestAnimationFrame(i)};return this.#r=requestAnimationFrame(i),this}disconnect(){return cancelAnimationFrame(this.#r),this.#r=null,this.#i.clear(),this}observe(t){return this.#i.add(t),this}unobserve(t){return this.#i.delete(t),this}}class VisibilityState{#t="VisibilityState";#n="visibilitystate";#o;#l=!1;#a=!1;#h=!1;#u=!1;#d=0;#c=0;calculateScrolled=!1;#p=0;#b=null;#w=null;calculateDistance=!1;#g=Number.POSITIVE_INFINITY;#v=Number.POSITIVE_INFINITY;#f=null;#m=null;autoHandleTooLargeElements=!0;#I=null;#V=null;#S=null;constructor(t,e=!1,i=!1,s=!0){this.#o=t,this.calculateScrolled=!!e,this.calculateDistance=!!i,this.autoHandleTooLargeElements=!!s}inViewport(t=null){if(hasValue(t)){const e=this.#l;this.#l=!!t,this.#B(e,this.#l,"enteredviewport","leftviewport")}return this.#l}fullyInViewport(t=null){if(hasValue(t)){const e=this.#a;this.#a=!!t,this.#B(e,this.#a,"fullyenteredviewport","fullyleftviewport")}return this.#a}upperBoundInViewport(t=null){if(hasValue(t)){const e=this.#h;this.#h=!!t,this.#B(e,this.#h,"upperboundenteredviewport","upperboundleftviewport")}return this.#h}lowerBoundInViewport(t=null){if(hasValue(t)){const e=this.#u;this.#u=!!t,this.#B(e,this.#u,"lowerboundenteredviewport","lowerboundleftviewport")}return this.#u}visiblePercent(t=null){if(hasValue(t)){const e=this.#d;this.#d=minMax(0,round(parseFloat(t),2),100),this.#B(e,this.#d,"visiblepercent")}return this.#d}visiblePixels(t=null){if(hasValue(t)){const e=this.#c;this.#c=minMax(0,round(parseFloat(t)),round(this.#o.scrollHeight)),this.#B(e,this.#c,"visiblepixels")}return this.#c}scrolledPercent(t=null){if(hasValue(t)){const e=this.#p;this.#p=minMax(0,round(parseFloat(t),2),100),this.#B(e,this.#p,"scrolledpercent")}return this.#p}distancePixels(t=null){if(hasValue(t)){const e=this.#g;this.#g=round(parseFloat(t)),this.#B(e,this.#g,"distancepixels")}return this.#g}distanceViewports(t=null){if(hasValue(t)){const e=this.#v;this.#v=round(parseFloat(t),2),this.#B(e,this.#v,"distanceviewports")}return this.#v}startAutoScrolledPercentUpdates(t,e=15,i=!0){if(this.calculateScrolled&&!hasValue(this.#b)){this.#b=t;const s=round(1e3/e);this.#w=this.#b.subscribe(throttle(s,(()=>{const t=getBoundingClientRect(this.#o),e=window.innerHeight;this.scrolledPercent((t.top-e)/(-t.height-e)*100),i&&this.#O()})))}return this}stopAutoScrolledPercentUpdates(){return hasValue(this.#b)&&this.#b.unsubscribe(this.#w),this.#w=null,this.#b=null,this}startAutoDistanceUpdates(t,e=15){if(this.calculateDistance&&!hasValue(this.#f)){this.#f=t;const i=round(1e3/e);this.#m=this.#f.subscribe(throttle(i,(()=>{const t=getBoundingClientRect(this.#o),e=window.innerHeight,i=t.top-e,s=t.bottom,r=Math.abs(i)<Math.abs(s)?i:s;this.distancePixels(r),this.distanceViewports(r/e)})))}return this}stopAutoDistanceUpdates(){return hasValue(this.#f)&&this.#f.unsubscribe(this.#m),this.#m=null,this.#f=null,this}startAutoTooLargeUpdates(t,e=15){if(this.autoHandleTooLargeElements&&!hasValue(this.#I)){this.#I=t;const i=round(1e3/e);this.#V=this.#I.subscribe(throttle(i,(()=>{this.#O()})))}return this}stopAutoTooLargeUpdates(){return hasValue(this.#I)&&this.#I.unsubscribe(this.#V),this.#V=null,this.#I=null,this}toJson(){const t={inViewport:this.inViewport(),fullyInViewport:this.fullyInViewport(),upperBoundInViewport:this.upperBoundInViewport(),lowerBoundInViewport:this.lowerBoundInViewport(),visiblePercent:this.visiblePercent(),visiblePixels:this.visiblePixels()};return this.calculateScrolled&&(t.scrolledPercent=this.scrolledPercent()),this.calculateDistance&&(t.distancePixels=this.distancePixels(),t.distanceViewports=this.distanceViewports()),t}#E(t,e=null){return this.#o.dispatchEvent(new CustomEvent(`${t}.${this.#n}`,{detail:e??{}})),fire(this.#o,`${t}.${this.#n}`,e??{}),this}#P(){return hasValue(this.#S)||(this.#S=defer((()=>{this.#S=null,this.#E("changed")})),this.#S()),this}#B(t,e,i,s){return hasValue(e)&&(isBoolean(e)?e&&!t?(this.#E(i),this.#P()):!e&&t&&(this.#E(s),this.#P()):isNumber(e)&&e!==t&&(this.#E(i??s,e),this.#P())),this}#O(){const t=getBoundingClientRect(this.#o),e=window.innerHeight,i=t.top<0?Math.abs(t.top):0,s=t.top+t.height>e?t.top+t.height-e:0;return this.upperBoundInViewport(t.top>=0&&t.top<=e),this.lowerBoundInViewport(t.bottom>=0&&t.bottom<=e),this.visiblePixels(t.height-i-s),this.visiblePercent(this.visiblePixels()/t.height*100),this}}export function isInViewport(t,e=!1){if(e=orDefault(e,!1,"bool"),!isInDom(t))return!1;const i=t.getBoundingClientRect(),s=window.innerWidth,r=window.innerHeight;let n;return n=e?{top:0,right:s,bottom:r,left:0}:{top:1-(i.bottom-i.top),right:s+(i.right-i.left)+1,bottom:r+(i.bottom-i.top)+1,left:1-(i.right-i.left)},i.top>=n.top&&i.right<=n.right&&i.left>=n.left&&i.bottom<=n.bottom}export function scrollTo(t,e=1e3,i=0,s="easeInOutCubic",r=!1,n=!1){const o="scrollTo";e=orDefault(e,1e3,"int"),i=orDefault(i,0,"int"),s=orDefault(s,"easeInOutCubic","str"),r=orDefault(r,!1,"bool"),n=orDefault(n,!1,"bool"),assert(isElement(t)||isWindow(t),`Viewport:${o} | element unusable`),assert(e>0,`Viewport:${o} | durationMs must be > 0`),s=isFunction(EasingFunctions[s])?EasingFunctions[s]:EasingFunctions.easeInOutCubic;const l=new Deferred,a=t.self===t,h=!a&&isInDom(t),u=!(a||!h)&&isInViewport(t,!0);if((h||a)&&(r||!u)){let r,o,h=!1;const u=window.scrollY??window.pageYOffset;o=a?i:u+getBoundingClientRect(t).top-round(window.innerHeight/2)+i;const d=o-u,c=function(t){if(!h){hasValue(r)||(r=t);const i=t-r,n=s(Math.min(i/e,1));window.scrollTo(0,u+d*n),i<e&&n<1?requestAnimationFrame(c):l.resolve()}};if(n){const t=function(){h=!0,l.reject(new Error("cancelled")),window.removeEventListener("DOMMouseScroll",t),window.removeEventListener("mousewheel",t)};window.addEventListener("DOMMouseScroll",t),window.addEventListener("mousewheel",t)}0!==d&&requestAnimationFrame(c)}return l}class VisibilityObserver{#t="VisibilityObserver";#n="visibilityobserver";#U="html element required";#_;#T=!1;#D=!1;#H;#s;#R;#y;#M;#k;#F;#$;#C;#L;#N;#x;#A;constructor(t=10,e=15,i=!1){this.#_=new Map,this.connect(t,e,i)}connect(t=10,e=15,i=!1){this.disconnect(),this.#H=min(orDefault(t,10,"int"),1),this.#s=minMax(1,orDefault(e,15,"int"),120);const s=round(1e3/e);let r;this.#R=throttle(s,this.#z,!0,!0).bind(this),this.#y=throttle(s,this.#j,!0,!0).bind(this),this.#M=throttle(s,this.#Y,!0,!0).bind(this),this.#k=throttle(s,this.#E,!0,!0).bind(this);try{r=i?SimplePollingObserver:IntersectionObserver}catch(t){warn(`Viewport:${this.#t}.connect | IntersectionObserver not available, falling back to SimplePollingObserver`),r=SimplePollingObserver}return this.#q(),this.#$=new r(this.#W.bind(this),{threshold:this.#F,targetFps:this.#s}),this.#J(),this.#K(),this.#T=!0,this}disconnect(){return this.#G(),hasValue(this.#$)&&(this.#$.disconnect(),this.#$=null),this.#_.clear(),this.#T=!1,this.#D=!1,this}observe(t,e=!1,i=!1,s=!0){if(this.#Q()){const r="addElement";assert(isElement(t),`Viewport:${this.#t}.${r} | ${this.#U}`),isInDom(t)||warn(`Viewport:${this.#t}.${r} | element not in DOM`),this.#_.set(t,new VisibilityState(t,e,i,s)),this.#$.observe(t)}return this}unobserve(t){return this.#_.has(t)&&(this.#_.delete(t),this.#$.unobserve(t)),this}getViewportInfo(){return this.#Q()?this.#N:null}getViewportObservable(){return this.#Q()?this.#A:null}getState(t){return this.#Q()&&this.#_.has(t)?this.#_.get(t):null}#Q(){return!!this.#T||(warn(`Viewport:${this.#t}.${__methodName__} | not running, call connect() before`),!1)}#q(){const t=[];for(let e=0;e<=this.#H;e++)t.push(round(e/this.#H,2));return this.#F=t,this}#J(t=!1){const e=window.innerWidth,i=window.innerHeight;if(hasValue(this.#N)){const s=window.scrollY??window.pageYOffset;s>this.#N.scrollTop?this.#N.scrollDirection="down":s<this.#N.scrollTop&&(this.#N.scrollDirection="up"),s>this.#x+10?(this.#N.fuzzyScrollDirection="down",this.#x=s):s<this.#x-10&&(this.#N.fuzzyScrollDirection="up",this.#x=s),this.#N.scrollTop=s,t||(this.#N.width=e,this.#N.height=i,this.#N.bounds.right=e,this.#N.bounds.bottom=i,this.#N.bounds.width=e,this.#N.bounds.height=i)}else this.#N={scrollTop:window.scrollY??window.pageYOffset,scrollDirection:"down",fuzzyScrollDirection:"down",width:e,height:i,bounds:{top:0,right:e,bottom:i,left:0,width:e,height:i}},this.#x=this.#N.scrollTop,this.#A=new Observable(`${this.#N.scrollTop}${this.#N.width}${this.#N.height}`);const s=`${this.#N.scrollTop}${this.#N.width}${this.#N.height}`;return s!==this.#A.getValue()&&(this.#A.setValue(s),this.#k("viewportchanged",this.#N)),this.#N}#z(){return this.#J(!0),this}#j(){return this.#J(),this}#Y(){return this.#J(),this}#X(){return this.#J(),this}#W(t){return t.forEach((t=>{if(hasValue(t.rootBounds)){const e=this.#_.get(t.target);e.inViewport(t.intersectionRatio>0),e.fullyInViewport(t.intersectionRatio>=1),e.upperBoundInViewport(t.boundingClientRect.top>=t.rootBounds.top&&t.boundingClientRect.top<=t.rootBounds.bottom),e.lowerBoundInViewport(t.boundingClientRect.bottom>=t.rootBounds.top&&t.boundingClientRect.bottom<=t.rootBounds.bottom),e.visiblePercent(100*t.intersectionRatio),e.visiblePixels(t.intersectionRect.height),e.calculateScrolled&&(e.scrolledPercent((t.boundingClientRect.top-t.rootBounds.height)/(-t.boundingClientRect.height-t.rootBounds.height)*100),e.fullyInViewport()?e.startAutoScrolledPercentUpdates(this.#A,this.#s):e.stopAutoScrolledPercentUpdates()),e.calculateDistance&&(e.inViewport()?(e.stopAutoDistanceUpdates(),e.distancePixels(0),e.distanceViewports(0)):e.startAutoDistanceUpdates(this.#A,4)),e.autoHandleTooLargeElements&&t.boundingClientRect.height>t.rootBounds.height&&(e.inViewport()?(e.startAutoTooLargeUpdates(this.#A,this.#s),e.calculateScrolled&&e.startAutoScrolledPercentUpdates(this.#A,this.#s,!1)):(e.stopAutoTooLargeUpdates(),e.calculateScrolled&&e.stopAutoScrolledPercentUpdates()))}})),this.#D||(this.#D=!0,this.#E("initialized")),this.#k("updated"),this}#E(t,e=null){return document.body.dispatchEvent(new CustomEvent(`${t}.${this.#n}`,{detail:e??{}})),fire(document.body,`${t}.${this.#n}`,e??{}),this}#K(){window.addEventListener("scroll",this.#R),window.addEventListener("resize",this.#y),this.#L=new MutationObserver(this.#M),this.#L.observe(document.body,{attributes:!0,childList:!0,subtree:!0});const t=round(1e3/this.#s),e=round(t/10);return this.#C=window.setInterval(this.#X.bind(this),e),this}#G(){return window.clearInterval(this.#C),window.removeEventListener("scroll",this.#R),window.removeEventListener("resize",this.#y),hasValue(this.#L)&&(this.#L.disconnect(),this.#L=null),this}}export{VisibilityObserver};class BreakpointObserver{#t="BreakpointObserver";#Z="handler must be function";#e;#tt;#et;#it;#st;#y;constructor(t=null,e=4){hasValue(t)&&(assert(isFunction(t),`Viewport:${this.#t}.constructor | ${this.#Z}`),this.#e=t),this.#tt=(t,e)=>{Object.keys(this.#et).length>0&&this.#e?.(t,e)},e=minMax(1,orDefault(e,15,"int"),120);const i=round(1e3/e);this.#y=throttle(i,this.#j,!0,!0).bind(this),this.connect(t)}connect(t=null){return this.disconnect(),hasValue(t)&&(assert(isFunction(t),`Viewport:${this.#t}.connect | ${this.#Z}`),this.#e=t),this.#it.subscribe(this.#tt),this.#it.subscribe((t=>{this.#st.setValue(t)})),this.#K(),this}disconnect(){return this.#et={},this.#it=new Observable,this.#st=new Observable,this.#G(),this}getBreakpoint(t){if(isNumber(t)){let e=null;for(const i in this.#et)if(t===this.#et[i]){e=i;break}return e}return this.#et[`${t}`]??null}getBreakpoints(){return{...this.#et}}getCurrentBreakpoint(){return this.#it.getValue()}getCurrentBreakpointObservable(){return this.#st}observe(...t){const e=this.#rt(t);return this.#et={...this.#et,...e},this.#nt(),this}unobserve(...t){const e=this.#rt(t,!0);return Object.keys(e).forEach((t=>{delete this.#et[t]})),this.#nt(),this}#rt(t,e=!1){const i="#parseBreakpointList",s="unusable breakpoint";let r={};return Array.from(t).forEach((t=>{if(isPlainObject(t)){for(const e in t)t[e]=parseInt(t[e],10),assert(!isNaN(t[e])&&t[e]>=0,`Viewport:${this.#t}.${i} | ${s} "${e}"`);r={...r,...t}}else if(isArray(t))if(2!==t.length||isPlainObject(t[0])||isArray(t[0])||isPlainObject(t[1])||isArray(t[1]))r={...r,...this.#rt(t,e)};else{const e=`${t[0]}`;r[e]=parseInt(t[1],10),assert(!isNaN(r[e])&&r[e]>=0,`Viewport:${this.#t}.${i} | ${s} "${e}"`)}else e&&(r[`${t}`]=null)})),r}#nt(){const t=window.innerWidth,e=Object.entries(this.#et).sort(((t,e)=>t[1]===e[1]?0:t[1]>e[1]?1:-1));let i=null;return e.forEach((([e,s])=>{t>=s&&(i=e)})),this.#it.setValue(i),this}#j(){return this.#nt(),this}#K(){return window.addEventListener("resize",this.#y),this}#G(){return window.removeEventListener("resize",this.#y),this}}export{BreakpointObserver};
//# sourceMappingURL=viewport.js.map

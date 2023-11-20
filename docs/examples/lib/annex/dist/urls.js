/*!
 * @oktarintentakel/annex v0.1.16-beta
 */
/*!
 * Module Urls
 */
const MODULE_NAME="Urls";import{hasValue,orDefault,size,assert,isFunction,isString,isArray,isObject,isNaN,isEmpty}from"./basic.js";import{log}from"./logging.js";import{replace}from"./strings.js";export const COMMON_TOP_LEVEL_DOMAINS=["aero","biz","cat","com","coop","edu","gov","info","int","jobs","mil","mobi","museum","name","net","org","travel","ac","ad","ae","af","ag","ai","al","am","an","ao","aq","ar","as","at","au","aw","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cs","cu","cv","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im","in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","ru","rw","sa","sb","sc","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","st","su","sv","sy","sz","tc","td","tf","tg","th","tj","tk","tm","tn","to","tp","tr","tt","tv","tw","tz","ua","ug","uk","um","us","uy","uz","va","vc","ve","vg","vi","vn","vu","wf","ws","ye","yt","yu","za","zm","zr","zw","local"];const URISON_VALUE_FORMAT="[^-0123456789 '!:(),*@$][^ '!:(),*@$]*",URISON_VALUE_REX=new RegExp(`^${URISON_VALUE_FORMAT}$`),URISON_NEXT_VALUE_REX=new RegExp(URISON_VALUE_FORMAT,"g");class UrisonParser{#e="UrisonParser";#t;#r="";#n=0;#s=null;#a;#i;constructor(e=null){const t=this;this.#t=isFunction(e)?e:null,this.#a={t:!0,f:!1,n:null,"(":this.#o},this.#i={"!":function(){const e=t.#r.charAt(t.#n++);if(""===e)return t.#c('"!" at end of input');const r=t.#a[e];return void 0===r?t.#c(`unknown literal: "!${e}"`):isFunction(r)?r.call(this):r},"(":function(){const e={};let r,n=!0;for(;")"!==(r=t.#l());){if(n){if(","===r)return t.#c('extra ","');t.#n--}else if(","!==r)return t.#c('missing ","');const s=t.#u();if(void 0===s)return;if(":"!==t.#l())return t.#c('missing ":"');const a=t.#u();if(void 0===a)return;e[s]=a,n=!1}return e},"'":function(){const e=[];let r,n=t.#n,s=t.#n;for(;"'"!==(r=t.#r.charAt(n++));){if(""===r)return t.#c('unmatched "\'"');if("!"===r){if(s<n-1&&e.push(t.#r.slice(s,n-1)),r=t.#r.charAt(n++),!["!","'"].includes(r))return t.#c(`invalid string escape: "!${r}"`);e.push(r),s=n}}return s<n-1&&e.push(t.#r.slice(s,n-1)),t.#n=n,1===e.length?e[0]:e.join("")},"-":function(){const e=t.#n-1,r={"int+.":"frac","int+e":"exp","frac+e":"exp"};let n=t.#r,s=t.#n,a="int",i="-";do{const e=n.charAt(s++);if(""===e)break;e>="0"&&e<="9"||(i.includes(e)?i="":(a=r[`${a}+${e.toLowerCase()}`],"exp"===a&&(i="-")))}while(void 0!==a);return s--,t.#n=s,n=n.slice(e,s),"-"===n?t.#c("invalid number"):Number(n)}},function(e){for(let t=0;t<=9;t++)e[`${t}`]=e["-"]}(this.#i)}parse(e){this.#r=`${e}`,this.#n=0,this.#s=null;let t=this.#u();const r=this.#l();if(!this.#s&&void 0!==r){let n;n=/\s/.test(r)?"whitespace detected":`trailing char "${r}"`,t=this.#c(`unable to parse string "${e}", ${n}`)}return this.#s&&this.#t&&this.#t(this.#s,this.#n),t}#o(){const e=[];let t;for(;")"!==(t=this.#l());){if(""===t)return this.#c('unmatched "!("');if(isEmpty(e)){if(","===t)return this.#c('extra ","');this.#n--}else if(","!==t)return this.#c('missing ","');const r=this.#u();if(void 0===r)return;e.push(r)}return e}#u(){const e=this.#l(),t=this.#i[e];if(isFunction(t))return t.apply(this);const r=this.#n-1;URISON_NEXT_VALUE_REX.lastIndex=r;const n=URISON_NEXT_VALUE_REX.exec(this.#r);if(!isEmpty(n)){const e=n[0];return this.#n=r+e.length,e}return hasValue(e)&&""!==e?this.#c(`invalid character "${e}"`):this.#c("empty expression")}#l(){let e,t=this.#n;if(!(t>=this.#r.length))return e=this.#r.charAt(t++),this.#n=t,e}#c(e){console.error(`${this.#e} error: `,e),this.#s=e}}export function urlParameter(e,t=null){let r;if(e=orDefault(e,"","str"),t=orDefault(t,null,"str"),e.startsWith("?"))r=new URLSearchParams(e);else{if(!e.startsWith("http://")&&!e.startsWith("https://")){const t=window.location.protocol;e=`${e.startsWith("//")?t:t+"//"}${e}`}try{r=new URL(e).searchParams}catch{throw new Error(`Urls:urlParameter | invalid url "${e}"`)}}const n=e=>""===e||e;if(hasValue(t)){const e=r.getAll(t);return 0===e.length?null:1===e.length?n(e[0]):Array.from(new Set(e.map(n)))}{const e={};return Array.from(r.keys()).forEach((t=>{const s=r.getAll(t);s.length>0&&(e[t]=1===s.length?n(s[0]):Array.from(new Set(s.map(n))))})),size(e)>0?e:null}}export function urlParameters(e){return urlParameter(e)}export function urlAnchor(e,t=!1){e=orDefault(e,"","str"),t=orDefault(t,!1,"bool");const r=e.split("#");let n=r.length>1?decodeURIComponent(r[1].trim()):null;return""===n&&(n=null),t&&hasValue(n)&&(n=`#${n}`),n}export function addNextParameter(e,t,r="next",n=!1,s=null){const a="addNextParameter";e=new URL(orDefault(e,"","str")),t=new URL(orDefault(t,"","str")),r=orDefault(r,"next","str"),(n=orDefault(n,!0,"bool"))&&assert(evaluateBaseDomain(e.hostname,s)===evaluateBaseDomain(t.hostname,s),`Urls:${a} | different base domains in url and next`);const i=new URLSearchParams(e.search);return i.has(r)&&log().info(`Urls:${a} | replaced "${r}" value "${i.get(r)}" with "${t.href}"`),i.set(r,t.href),`${e.origin}${e.pathname}?${i.toString().replaceAll("+","%20")}${e.hash}`}export function addCacheBuster(e,t="_"){e=new URL(orDefault(e,"","str"));const r=new URLSearchParams(e.search),n=Date.now();return r.has(t)&&log().info(`Urls:addCacheBuster | replaced "${t}" value "${r.get(t)}" with "${n}"`),r.set(t,n),`${e.origin}${e.pathname}?${r}${e.hash}`}export function evaluateBaseDomain(e,t=null){let r;e=orDefault(e,window.location.hostname,"str"),t=orDefault(t,null,"arr");try{r=new URL(e)}catch(e){r=null}hasValue(r)&&(e=r.hostname);const n=new Set([...COMMON_TOP_LEVEL_DOMAINS,...hasValue(t)?t.map((e=>`${e}`)):[]]),s=e.split(".").reverse();let a=e;if(s.length>2){let e;for(e=0;e<s.length&&n.has(s[e]);e++);a=s.slice(0,e+1).reverse().join(".")}return a}class Urison{#e="Urison";#h;#d;#m;#p;constructor(e=!0){const t=this;e=orDefault(e,!0,"bool"),this.#h=e?this.escape:e=>e,this.#d=e?decodeURIComponent:e=>e,this.#m={array(e){const r=[];for(let n of e){const e=t.encode(n);isString(e)&&r.push(e)}return`!(${r.join(",")})`},boolean:e=>e?"!t":"!f",null:()=>"!n",number:e=>isFinite(e)?`${e}`.replace(/\+/,""):"!n",object(e){if(hasValue(e)){if(isArray(e))return this.array(e);const r=Object.keys(e);r.sort();const n=[];for(let s of r){const r=t.encode(e[s]);if(isString(r)){const e=isNaN(parseInt(s,10))?this.string(s):this.number(s);n.push(`${e}:${r}`)}}return`(${n.join(",")})`}return"!n"},string:e=>""===e?"''":URISON_VALUE_REX.test(e)?e:`'${e=e.replace(/(['!])/g,(function(e,t){return`!${t}`}))}'`},this.#p=new UrisonParser(((e,t)=>{throw Error(`decoding error [${e}] at string index ${t}`)}))}encode(e){const t="encode";isFunction(e?.toJson)&&(e=e.toJson()),isFunction(e?.toJSON)&&(e=e.toJSON());const r=this.#m[typeof e];if(!isFunction(r))throw new Error(`${this.#e}.${t} | invalid data type`);let n;try{n=r.call(this.#m,e)}catch(e){throw new Error(`${this.#e}.${t} | encoding error [${e}]`)}return this.#h(this.#d(n))}encodeObject(e){if(!isObject(e))throw new Error(`${this.#e}.encodeObject | value is not an object`);const t=this.#m.object(e);return this.#h(this.#d(t.substring(1,t.length-1)))}encodeArray(e){if(!isArray(e))throw new Error(`${this.#e}.encodeArray | value is not an array`);const t=this.#m.array(e);return this.#h(this.#d(t.substring(2,t.length-1)))}decode(e){return this.#p.parse(this.#d(e))}decodeObject(e){return this.decode(`(${e})`)}decodeArray(e){return this.decode(`!(${e})`)}escape(e){return/^[\-A-Za-z0-9~!*()_.',:@$\/+]*$/.test(e=`${e}`)?e:replace(encodeURIComponent(e),["%2C","%3A","%40","%24","%2F","%2B"],[",",":","@","$","/","+"])}}export{Urison};
//# sourceMappingURL=urls.js.map

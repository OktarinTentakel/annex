/*!
 * @oktarintentakel/annex v0.1.2-beta
 */
/*!
 * Module Urls
 */
const MODULE_NAME="Urls";import{hasValue,orDefault,size,assert}from"./basic.js";import{log}from"./logging.js";export const COMMON_TOP_LEVEL_DOMAINS=["aero","biz","cat","com","coop","edu","gov","info","int","jobs","mil","mobi","museum","name","net","org","travel","ac","ad","ae","af","ag","ai","al","am","an","ao","aq","ar","as","at","au","aw","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cs","cu","cv","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im","in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","ru","rw","sa","sb","sc","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","st","su","sv","sy","sz","tc","td","tf","tg","th","tj","tk","tm","tn","to","tp","tr","tt","tv","tw","tz","ua","ug","uk","um","us","uy","uz","va","vc","ve","vg","vi","vn","vu","wf","ws","ye","yt","yu","za","zm","zr","zw","local"];export function urlParameter(e,t=null){let r;if(e=orDefault(e,"","str"),t=orDefault(t,null,"str"),e.startsWith("?"))r=new URLSearchParams(e);else{if(!e.startsWith("http://")&&!e.startsWith("https://")){const t=window.location.protocol;e=`${e.startsWith("//")?t:t+"//"}${e}`}try{r=new URL(e).searchParams}catch{throw new Error(`Urls:urlParameter | invalid url "${e}"`)}}const a=e=>""===e||e;if(hasValue(t)){const e=r.getAll(t);return 0===e.length?null:1===e.length?a(e[0]):Array.from(new Set(e.map(a)))}{const e={};return Array.from(r.keys()).forEach((t=>{const n=r.getAll(t);n.length>0&&(e[t]=1===n.length?a(n[0]):Array.from(new Set(n.map(a))))})),size(e)>0?e:null}}export function urlParameters(e){return urlParameter(e)}export function urlAnchor(e,t=!1){e=orDefault(e,"","str"),t=orDefault(t,!1,"bool");const r=e.split("#");let a=r.length>1?decodeURIComponent(r[1].trim()):null;return""===a&&(a=null),t&&hasValue(a)&&(a=`#${a}`),a}export function addNextParameter(e,t,r="next",a=!1,n=null){const s="addNextParameter";e=new URL(orDefault(e,"","str")),t=new URL(orDefault(t,"","str")),r=orDefault(r,"next","str"),(a=orDefault(a,!0,"bool"))&&assert(evaluateBaseDomain(e.hostname,n)===evaluateBaseDomain(t.hostname,n),`Urls:${s} | different base domains in url and next`);const l=new URLSearchParams(e.search);return l.has(r)&&log().info(`Urls:${s} | replaced "${r}" value "${l.get(r)}" with "${t.href}"`),l.set(r,t.href),`${e.origin}${e.pathname}?${l.toString().replaceAll("+","%20")}${e.hash}`}export function addCacheBuster(e,t="_"){e=new URL(orDefault(e,"","str"));const r=new URLSearchParams(e.search),a=Date.now();return r.has(t)&&log().info(`Urls:addCacheBuster | replaced "${t}" value "${r.get(t)}" with "${a}"`),r.set(t,a),`${e.origin}${e.pathname}?${r}${e.hash}`}export function evaluateBaseDomain(e,t=null){let r;e=orDefault(e,window.location.hostname,"str"),t=orDefault(t,null,"arr");try{r=new URL(e)}catch(e){r=null}hasValue(r)&&(e=r.hostname);const a=new Set([...COMMON_TOP_LEVEL_DOMAINS,...hasValue(t)?t.map((e=>`${e}`)):[]]),n=e.split(".").reverse();let s=e;if(n.length>2){let e;for(e=0;e<n.length&&a.has(n[e]);e++);s=n.slice(0,e+1).reverse().join(".")}return s}
//# sourceMappingURL=urls.js.map

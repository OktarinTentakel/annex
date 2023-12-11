/*!
 * @oktarintentakel/annex v0.1.18-beta
 */
/*!
 * Module Units
 */
const MODULE_NAME="Units";import{orDefault,assert,isNaN,isArray,round}from"./basic.js";export const LOCAL_FLOAT_SEPARATOR=.1.toLocaleString().replace(/[0-9]/g,"").slice(0,1),LOCAL_THOUSAND_SEPARATOR=1e3.toLocaleString().replace(/[0-9]/g,"").slice(0,1);export function asFileSize(e,r=LOCAL_FLOAT_SEPARATOR,t=1,n=!1){e=parseInt(e,10),assert(!isNaN(e)&&e>=0,"Units:asFileSize | bytes not usable or negative"),r=orDefault(r,LOCAL_FLOAT_SEPARATOR,"str"),t=orDefault(t,1,"int");const i=n?1024:1e3,a=n?["KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"]:["kB","MB","GB","TB","PB","EB","ZB","YB"];if(e<i)return`${e} B`;let o=-1;do{e/=i,o++}while(e>=i&&o<a.length-1);return`${e=`${round(e,t)}`.replace(".",r)} ${a[o]}`}export function asCurrency(e,r="en-US",t="USD",n="symbol"){return e=parseFloat(e),r=orDefault(r,"en-US"),(!isArray(r)&&"en-US"!==r||isArray(r)&&!r.includes("en-US"))&&(r=[].concat(r).concat("en-US")),t=orDefault(t,"USD","str"),n=orDefault(n,"symbol","str"),new Intl.NumberFormat(r,{style:"currency",currency:t,currencyDisplay:n}).format(e)}export function asDecimal(e,r="en-US",t=2,n=null){return e=parseFloat(e),r=orDefault(r,"en-US"),(!isArray(r)&&"en-US"!==r||isArray(r)&&!r.includes("en-US"))&&(r=[].concat(r).concat("en-US")),t=orDefault(t,2,"int"),n=orDefault(n,t,"int"),new Intl.NumberFormat(r,{style:"decimal",useGrouping:!1,minimumFractionDigits:t,maximumFractionDigits:n}).format(e)}
//# sourceMappingURL=units.js.map

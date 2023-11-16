/*!
 * @oktarintentakel/annex v0.1.15-beta
 */
/*!
 * Module Dates
 */
const MODULE_NAME="Dates";import{hasValue,assert,orDefault,isArray,isDate,isString,isNumber,isInt,isNaN,isObject,isPlainObject,isFunction}from"./basic.js";import{pad}from"./strings.js";const DATE_PART_SETTERS_AND_GETTERS={local:{year:{setter:"setFullYear",getter:"getFullYear"},month:{setter:"setMonth",getter:"getMonth"},date:{setter:"setDate",getter:"getDate"},hours:{setter:"setHours",getter:"getHours"},minutes:{setter:"setMinutes",getter:"getMinutes"},seconds:{setter:"setSeconds",getter:"getSeconds"},milliseconds:{setter:"setMilliseconds",getter:"getMilliseconds"}},utc:{year:{setter:"setUTCFullYear",getter:"getUTCFullYear"},month:{setter:"setUTCMonth",getter:"getUTCMonth"},date:{setter:"setUTCDate",getter:"getUTCDate"},hours:{setter:"setUTCHours",getter:"getUTCHours"},minutes:{setter:"setUTCMinutes",getter:"getUTCMinutes"},seconds:{setter:"setUTCSeconds",getter:"getUTCSeconds"},milliseconds:{setter:"setUTCMilliseconds",getter:"getUTCMilliseconds"}}};export function format(t,e="long",s="en-US",a="datetime",r=null){const i="UTC"===r?.timeZone,n=i?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local,o=["full","long","medium","short","none"];if(hasValue(e)&&!o.includes(e)){let s="";const a=t.getTimezoneOffset();if(!i&&0!==a){const t=pad(Math.floor(Math.abs(a)/60),"0",2);s=`${a<0?"+":"-"}${t}:${pad(Math.abs(a)-60*t,"0",2)}`}const r=new Map;r.set("YYYY",`${t[n.year.getter]()}`),r.set("YY",`${t[n.year.getter]()}`.slice(-2)),r.set("MM",pad(`${t[n.month.getter]()+1}`,"0",2)),r.set("M",`${t[n.month.getter]()+1}`),r.set("DD",pad(`${t[n.date.getter]()}`,"0",2)),r.set("D",`${t[n.date.getter]()}`),r.set("HH",pad(`${t[n.hours.getter]()}`,"0",2)),r.set("H",`${t[n.hours.getter]()}`),r.set("hh",pad(`${0===t[n.hours.getter]()?12:t[n.hours.getter]()>12?t[n.hours.getter]()-12:t[n.hours.getter]()}`,"0",2)),r.set("h",`${0===t[n.hours.getter]()?12:t[n.hours.getter]()>12?t[n.hours.getter]()-12:t[n.hours.getter]()}`),r.set("mm",pad(`${t[n.minutes.getter]()}`,"0",2)),r.set("m",`${t[n.minutes.getter]()}`),r.set("ss",pad(`${t[n.seconds.getter]()}`,"0",2)),r.set("s",`${t[n.seconds.getter]()}`),r.set("SSS",pad(`${t[n.milliseconds.getter]()}`,"0",3)),r.set("ZZ",s.replaceAll(":","")),r.set("Z",s),r.set("A",""+(t[n.hours.getter]()>=12?"PM":"AM")),r.set("a",""+(t[n.hours.getter]()>=12?"pm":"am"));let o=e;return r.forEach(((t,e)=>{o=o.replaceAll(e,t)})),o}{let i={};return o.includes(e)&&(["datetime","date"].includes(a)&&(i.dateStyle=e),["datetime","time"].includes(a)&&(i.timeStyle=e)),s=orDefault(s,"en-US"),(!isArray(s)&&"en-US"!==s||isArray(s)&&!s.includes("en-US"))&&(s=[].concat(s).concat("en-US")),i={...i,...r??{}},Intl.DateTimeFormat(s,i).format(t)}}class SaneDate{#t="SaneDate";#e="invalid date, please check parameters - SaneDate only accepts values that result in a valid date, where the given value is reflected exactly (e.g.: setting hours to 25 will not work)";#s="invalid or out of range";#a=null;#r=!1;constructor(t=null,e=null,s=null,a=null,r=null,i=null,n=null){let o=null;const l={year:o,month:e,date:s,hours:a,minutes:r,seconds:i,milliseconds:n};let h=Object.values(l).filter((t=>isNumber(t))).length>=1;t instanceof SaneDate?this.#a=t.getVanillaDate():isDate(t)?this.#a=t:isString(t)?this.#a=this.#i(t):isNumber(t)?h?(o=parseInt(t,10),l.year=o):this.#a=new Date(t):isObject(t)&&(isFunction(t.toISOString)||isFunction(t.toIsoString)||isFunction(t.getISOString)||isFunction(t.getIsoString))&&(this.#a=this.#i(t.toISOString?.()??t.toIsoString?.()??t.getISOString?.()??t.getIsoString?.())),isDate(this.#a)||(this.#a=h?new Date("1970-01-01T00:00:00.0"):new Date),assert(!isNaN(this.#a.getTime()),`Dates:${this.#t}.constructor | ${this.#e}`),this.#n(),h&&Object.entries(l).filter((([t,e])=>isNumber(e))).forEach((([t,e])=>{this[t]=e}))}#n(){const t={enumerable:!0};Object.defineProperty(this,"utc",{...t,set(t){this.#r=!!t},get(){return this.#r}}),Object.defineProperty(this,"year",{...t,set(t){t=parseInt(t,10),assert(isInt(t)&&t>=0&&t<=9999,`Dates:${this.#t}.set year | year ${this.#s} (0...9999)`),this.#o("year",t)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.year.getter]()}}),Object.defineProperty(this,"month",{...t,set(t){t=parseInt(t,10),assert(isInt(t)&&t>=1&&t<=12,`Dates:${this.#t}.set month | month ${this.#s} (1...12)`),this.#o("month",t-1)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.month.getter]()+1}}),Object.defineProperty(this,"date",{...t,set(t){t=parseInt(t,10),assert(isInt(t)&&t>=1&&t<=31,`Dates:${this.#t}.set date | date ${this.#s} (1...31)`),this.#o("date",t)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.date.getter]()}}),Object.defineProperty(this,"hours",{set(t){t=parseInt(t,10),assert(isInt(t)&&t>=0&&t<=23,`Dates:${this.#t}.set hours | hours ${this.#s} (0...23)`),this.#o("hours",t)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.hours.getter]()}}),Object.defineProperty(this,"minutes",{set(t){t=parseInt(t,10),assert(isInt(t)&&t>=0&&t<=59,`Dates:${this.#t}.set hours | minutes ${this.#s} (0...59)`),this.#o("minutes",t)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.minutes.getter]()}}),Object.defineProperty(this,"seconds",{set(t){t=parseInt(t,10),assert(isInt(t)&&t>=0&&t<=59,`Dates:${this.#t}.set seconds | seconds ${this.#s} (0...59)`),this.#o("seconds",t)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.seconds.getter]()}}),Object.defineProperty(this,"milliseconds",{set(t){t=parseInt(t,10),assert(isInt(t)&&t>=0&&t<=999,`Dates:${this.#t}.set milliseconds | milliseconds ${this.#s} (0...999)`),this.#o("milliseconds",t)},get(){const t=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local;return this.#a[t.milliseconds.getter]()}})}getWeekDay(t="monday",e=!1){const s=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];t=orDefault(t,s[1],"str"),assert(s.includes(t),`Dates:${this.#t}.getWeekDay | unknown weekday "${t}"`);let a=this.#r?this.#a.getUTCDay():this.#a.getDay();if(e)return s[a];const r=a-s.indexOf(t);return a=r<0?7+r:r,a+1}getTimezone(){if(this.#r)return"Z";const t=this.#a.getTimezoneOffset();if(0===t)return"Z";{const e=this.#l(Math.floor(Math.abs(t)/60),2);return`${t<0?"+":"-"}${e}:${this.#l(Math.abs(t)-60*e,2)}`}}getIsoDateString(){return`${this.#l(this.year,4)}-${this.#l(this.month,2)}-${this.#l(this.date,2)}`}getIsoTimeString(t=!0){t=orDefault(t,!0,"bool");const e=this.#l(this.hours,2),s=this.#l(this.minutes,2),a=this.#l(this.seconds,2),r=this.#l(this.milliseconds,3),i=this.getTimezone();return`${e}:${s}:${a}${r>0?"."+r:""}${t?i:""}`}getIsoString(t=!0,e=!0){return t=orDefault(t,!0,"bool"),`${this.getIsoDateString()}${t?"T":" "}${this.getIsoTimeString(e)}`}format(t="long",e="en-US",s="datetime",a=null){return a=orDefault(a,{}),!hasValue(a.timeZone)&&this.#r&&(a.timeZone="UTC"),format(this.#a,t,e,s,a)}getVanillaDate(){return this.#a}compareTo(t,e="datetime",s=!0){e=orDefault(e,"datetime","string"),s=orDefault(s,!0,"bool");const a=new SaneDate(t),r=[DATE_PART_SETTERS_AND_GETTERS.utc.year.getter,DATE_PART_SETTERS_AND_GETTERS.utc.month.getter,DATE_PART_SETTERS_AND_GETTERS.utc.date.getter],i=[DATE_PART_SETTERS_AND_GETTERS.utc.hours.getter,DATE_PART_SETTERS_AND_GETTERS.utc.minutes.getter,DATE_PART_SETTERS_AND_GETTERS.utc.seconds.getter],n=DATE_PART_SETTERS_AND_GETTERS.utc.milliseconds.getter;let o,l,h,c=[].concat(r);"datetime"===e&&(c=c.concat(i),s&&(c=c.concat(n)));for(const t of c)if(o=this.#a[t](),l=a.getVanillaDate()[t](),h=o<l?-1:o>l?1:0,0!==h)break;return h}isBefore(t,e="datetime",s=!0){return-1===this.compareTo(t,e,s)}isAfter(t,e="datetime",s=!0){return 1===this.compareTo(t,e,s)}isSame(t,e="datetime",s=!0){return 0===this.compareTo(t,e,s)}move(t,e=0){e=orDefault(e,0,"int");const s=DATE_PART_SETTERS_AND_GETTERS.utc,a=["years","months","days","hours","minutes","seconds","milliseconds"];let r={};return isPlainObject(t)?r=t:r[t]=e,Object.keys(r).forEach((t=>{assert(a.includes(t),`Dates:${this.#t}.move; | part must be one of ${a.join(", ")}, is "${t}"`)})),Object.entries(r).forEach((([t,e])=>{switch(t){case"years":this.#a[s.year.setter](this.#a[s.year.getter]()+e);break;case"months":this.#a[s.month.setter](this.#a[s.month.getter]()+e);break;case"days":this.#a[s.date.setter](this.#a[s.date.getter]()+e);break;case"hours":this.#a[s.hours.setter](this.#a[s.hours.getter]()+e);break;case"minutes":this.#a[s.minutes.setter](this.#a[s.minutes.getter]()+e);break;case"seconds":this.#a[s.seconds.setter](this.#a[s.seconds.getter]()+e);break;case"milliseconds":this.#a[s.milliseconds.setter](this.#a[s.milliseconds.getter]()+e)}})),this}forward(t,e=0){const s="forward",a="amount must be >= 0";t=`${t}`,e=orDefault(e,0,"int");let r={};return isPlainObject(t)?(r=t,Object.entries(r).forEach((([t,e])=>{e=parseInt(e,10),assert(e>=0,`Dates:${this.#t}.${s} | ${a}`),r[t]=e}))):(assert(e>=0,`Dates:${this.#t}.${s} | ${a}`),r[t]=e),this.move(r)}backward(t,e=0){const s="backward",a="amount must be >= 0";t=`${t}`,e=orDefault(e,0,"int");let r={};return isPlainObject(t)?(r=t,Object.entries(r).forEach((([t,e])=>{assert(e>=0,`Dates:${this.#t}.${s} | ${a}`),r[t]=0===e?0:-e}))):(assert(e>=0,`Dates:${this.#t}.${s} | ${a}`),r[t]=0===e?0:-e),this.move(r)}getDelta(t,e="days",s=!1){const a=new SaneDate(t);e=orDefault(e,"days","string"),assert(["days","hours","minutes","seconds","milliseconds"].includes(e),`Dates:${this.#t}.getDelta | unknown largest unit`);const r={};let i=(s=orDefault(s,!1,"bool"))?this.#a.getTime()-a.#a.getTime():Math.abs(this.#a.getTime()-a.#a.getTime());const n=i<0;if(i=Math.abs(i),"days"===e&&(r.days=Math.floor(i/1e3/60/60/24),i-=1e3*r.days*60*60*24,e="hours"),"hours"===e&&(r.hours=Math.floor(i/1e3/60/60),i-=1e3*r.hours*60*60,e="minutes"),"minutes"===e&&(r.minutes=Math.floor(i/1e3/60),i-=1e3*r.minutes*60,e="seconds"),"seconds"===e&&(r.seconds=Math.floor(i/1e3),i-=1e3*r.seconds,e="milliseconds"),"milliseconds"===e&&(r.milliseconds=i),n)for(const t in r)r[t]=0===r[t]?0:-r[t];return r}clone(){const t=new SaneDate(new Date(this.getVanillaDate().getTime()));return t.utc=this.#r,t}#l(t,e=2){return pad(t,"0",e)}#i(t){const e="#parseIsoString";let s=1970,a=1,r=1,i=0,n=0,o=0,l=0,h=0,c=!1,u=(t=`${t}`).split("T");1===u.length&&(u=u[0].split(" "));const d=u[0].split("-");if(s=d[0],d.length>=2&&(a=d[1]),d.length>=3&&(r=d[2]),u.length>=2){let t=u[1].split("Z");if(t.length>=2)c=!0;else{let s=0;if(t[0].includes("+")?(s=-1,t=t[0].split("+")):t[0].includes("-")&&(s=1,t=t[0].split("-")),t.length>=2){const a=t[1].split(":");a.length>=2?(h+=60*parseInt(a[0],10),h+=parseInt(a[1],10)):a[0].length>=3?(h+=60*parseInt(a[0].slice(0,2),10),h+=parseInt(a[1].slice(2),10)):h+=60*parseInt(a[0],10),h*=s,assert(!isNaN(h),`Dates:${this.#t}.${e} | invalid timezone "${t[1]}"`)}}const s=t[0].split(":");if(i=s[0],s.length>=2&&(n=s[1]),s.length>=3){const t=s[2].split(".");o=t[0],t.length>=2&&(l=t[1],l.length>3?l=l.slice(0,3):2===l.length?l=""+10*parseInt(l,10):1===l.length&&(l=""+100*parseInt(l,10)))}}const T=new SaneDate;T.utc=c||0!==h;try{T.year=s,T.month=a,T.date=r,T.hours=i,T.minutes=n,T.seconds=o,T.milliseconds=l}catch(s){throw Error(`Dates:${this.#t}.${e} | ISO string not parsable "${t}"`)}return T.move("minutes",h),T.getVanillaDate()}#o(t,e){const s=this.clone().getVanillaDate(),a=this.#r?DATE_PART_SETTERS_AND_GETTERS.utc:DATE_PART_SETTERS_AND_GETTERS.local,r=Object.values(a).map((t=>t.getter));s[a[t].setter](e);let i=!1;for(const e of r)if(e!==a[t].getter&&(i||=this.#a[e]()!==s[e]()),i)break;return assert(s[a[t].getter]()===e&&!i,`Dates:${this.#t}.#tryDatePartChange | date part change "${t} = ${e}" is invalid or has side effects`),this.#a=s,this}}export{SaneDate};
//# sourceMappingURL=dates.js.map

/*!
 * @oktarintentakel/annex v0.1.9-beta
 */
/*!
 * Module Logging
 */
const MODULE_NAME="Logging";export const LOG_LEVELS=["log","warn","err"],XLOG_CONTEXT_COUNTS={};export let LOG_LEVEL="log",TRY_TO_LOG_TO_PARENT=!1;const LOG_CHAINABLE_OBJECT={__documentation_for_chainable_object_of_log_execution__:()=>"Use this object to chain logging calls. All standard methods are supported (see https://developer.mozilla.org/en-US/docs/Web/API/Console) and are executed with silent fails if not supported by the browser. See other methods in this object for an overview. Use disable()/enable() to deactivate/activate all debug outputs (exceptions are assert, clear, error and warn) to the console centrally",setLogLevel:e=>(e=`${e}`,LOG_LEVELS.includes(e)&&(LOG_LEVEL=e),log()),tryToLogToParent:e=>(TRY_TO_LOG_TO_PARENT=e=void 0===e||!!e,log()),assert:genericConsoleMethodWrapperFactory("assert"),clear:genericConsoleMethodWrapperFactory("clear"),count:genericConsoleMethodWrapperFactory("count"),dir:genericConsoleMethodWrapperFactory("dir"),dirxml:genericConsoleMethodWrapperFactory("dirxml"),dirXml:genericConsoleMethodWrapperFactory("dirxml"),error(){return err(...Array.from(arguments))},group:genericConsoleMethodWrapperFactory("group"),groupCollapsed:genericConsoleMethodWrapperFactory("groupCollapsed"),groupEnd:genericConsoleMethodWrapperFactory("groupEnd"),info:genericConsoleMethodWrapperFactory("info"),log(){return log(...Array.from(arguments))},profile:genericConsoleMethodWrapperFactory("profile"),profileEnd:genericConsoleMethodWrapperFactory("profileEnd"),table:genericConsoleMethodWrapperFactory("table"),time:genericConsoleMethodWrapperFactory("time"),timeEnd:genericConsoleMethodWrapperFactory("timeEnd"),timeLog:genericConsoleMethodWrapperFactory("timeLog"),timeStamp:genericConsoleMethodWrapperFactory("timeStamp"),trace:genericConsoleMethodWrapperFactory("trace"),warn(){return warn(...Array.from(arguments))}};function genericConsoleMethodWrapper(e,o=null,...r){if(e=`${e}`,o=LOG_LEVELS.includes(`${o}`)?`${o}`:LOG_LEVELS[0],LOG_LEVELS.indexOf(LOG_LEVEL)<=LOG_LEVELS.indexOf(o))if("function"==typeof window.console?.[e])try{TRY_TO_LOG_TO_PARENT?parent.console[e].apply(parent.console,r):console[e].apply(console,r)}catch(o){try{warn(`console call to "${e}" failed, implementation seemingly incompatible`)}catch(e){}}else try{warn(`console call to "${e}" failed, is seemingly not supported`)}catch(e){}return log()}function genericConsoleMethodWrapperFactory(e,o){return function(){return genericConsoleMethodWrapper(e,o,...Array.from(arguments))}}export function log(){return"function"==typeof window.console?.log&&LOG_LEVELS.indexOf(LOG_LEVEL)<=LOG_LEVELS.indexOf("log")&&Array.from(arguments).forEach((e=>{!0!==e&&!1!==e||(e=e?"true":"false"),TRY_TO_LOG_TO_PARENT?parent.console.log(e):console.log(e)})),LOG_CHAINABLE_OBJECT}export function warn(){return"function"==typeof window.console?.warn&&LOG_LEVELS.indexOf(LOG_LEVEL)<=LOG_LEVELS.indexOf("warn")&&Array.from(arguments).forEach((e=>{!0!==e&&!1!==e||(e=e?"true":"false"),TRY_TO_LOG_TO_PARENT?parent.console.warn(e):console.warn(e)})),LOG_CHAINABLE_OBJECT}export function err(){return"function"==typeof window.console?.error&&LOG_LEVELS.indexOf(LOG_LEVEL)<=LOG_LEVELS.indexOf("err")&&Array.from(arguments).forEach((e=>{!0!==e&&!1!==e||(e=e?"true":"false"),TRY_TO_LOG_TO_PARENT?parent.console.error(e):console.error(e)})),LOG_CHAINABLE_OBJECT}export function xlog(e=null){let o;try{o=(new Error).stack.split("\n")[2].trim()}catch(e){o="anonymous"}void 0===XLOG_CONTEXT_COUNTS[o]&&(XLOG_CONTEXT_COUNTS[o]=0),XLOG_CONTEXT_COUNTS[o]++,log(`<<XLOG>> ${o} [${XLOG_CONTEXT_COUNTS[o]}]${e?" | "+e:""}`)}
//# sourceMappingURL=logging.js.map

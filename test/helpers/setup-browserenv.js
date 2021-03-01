import browserEnv from 'browser-env';

browserEnv();

global.__AVA_ENV__ = window.__AVA_ENV__ = true;
global.__AVA_SOURCE__ = window.__AVA_SOURCE__ = process.env.SOURCE ?? 'source';

console.log(`> testing sources using "${global.__AVA_SOURCE__}"`);

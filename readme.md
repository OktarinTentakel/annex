![annex](annex.png)



annex
=====
by Sebastian Schlapkohl

> Unit-tested and semantically packaged standard solutions for everyday frontend tasks and syntax streamlining for
> those ugly darks corners of JS.

![NPM - no peer dependencies](https://img.shields.io/badge/NPM-no%20peer%20dependencies-blue)
![JavaScript - ES6+](https://img.shields.io/badge/JavaScript-ES6%2B-blue)
![JavaScript - Module](https://img.shields.io/badge/JavaScript-Modules-blue)
![JavaScript - Legacy ES5 Monolith](https://img.shields.io/badge/JavaScript-Legacy%20ES5%20Monolith-blue)
![Ava - Unit Tested](https://img.shields.io/badge/Ava-Unit%20Tested-brightgreen)
![Examples - Interactive Demonstrations](https://img.shields.io/badge/Examples-Interactive%20Demonstrations-brightgreen)
![JSDOC - Fully Documented](https://img.shields.io/badge/JSDOC-Fully%20Documented-green)
![GitHub Pages - Online Documentation & Examples](https://img.shields.io/badge/GitHub%20Pages-Online%20Documentation%20%26%20Examples-yellow)
![Docker - Docker Compose Dev Setup With Gulp and Rollup](https://img.shields.io/badge/Docker-Docker%20Compose%20Dev%20Setup%20With%20Gulp%20and%20Rollup-yellow)



A Word of Caution
-----------------
This package has reached beta status. Everything included is tested with unit tests and/or browser examples. And the
contents include everything I aimed for in the first version. Although everything is finished from a technical
perspective, this package is not yet battle-proven.

The beta should be fine to use (cautiously), but I will delay the bump to version 1.0.0 stable until after I've used
this in a real-world project.



What is This?
-------------
After more than 15 years of web development I have gotten quite opinionated about JavaScript, its way of doing things,
the dark places of this language, what it is lacking and how I like to do things instead.

This package is a collection of helpers, solutions and best practices that have amassed over the years, providing
quality of life solutions, best practices (in my opinion) and additions, that I can't and don't want to live without
(especially some Python stuff).

Everything included here is strictly **frontend-oriented** and not meant for node or window-less or dom-less
environments. Think of it as lodash's little frontend brother.

Every single solution/helper/function is importable by itself using ES6 imports (and maybe a bundler),
documented with jsdoc, tested with [Ava](https://github.com/avajs/ava) (unit tests can be found in `test`),
used in a live browser example (in case unit tests are not helpful; examples can be found in `examples`) and
semantically structured into modules concerning topics and aspects of development
(such as `logging` or `strings`).

So, the TL;DR is: annex is a battle-proven, tested pool of frontend js tools to solve reappearing tasks quickly and make
JavaScript more bearable by streamlining syntactical nonsense and providing functions other languages provide naturally. 



Some of the Batteries Included
------------------------------
- event helpers including a complete event system
- variable normalization and type evaluation
- DOM handling with element creation and manipulation
- streamlined standard requests (basic requests & special versions for html/css/js/json)
- url and navigation helpers
- better logging
- better randomization for numbers and ids
- string generation and conversion tools like formatting and slugification
- array tools like actually usable removal functionality based on values and flexible indices
- browser capability checks and context evaluation
- viewport information and functionality
- interaction solutions like obfuscated mailto and tel links
- better (& more precise) timers
- polling
- cookie handling
- image and webfont availability callbacks
- form helpers for data



Is This Documented Somewhere?
-----------------------------
Yes, that as well.

Visit the documentation on [GitHub](https://oktarintentakel.github.io/annex/documentation/) or open
`/docs/documentation/index.html` locally after checking out the repo.



Is This Tested in Any Way?
--------------------------
Yes, it actually is!

The algorithmic core is tested via [Ava](https://github.com/avajs/ava) and all tests are to be found in `test`.

Many features are not really well suited for unit testing but require a real browser as a context.
For all those cases I built example pages (to be found under `examples`, just opening `index.hml` from the file system
should work, at least for the es5 version). In these example pages you can browse all topics not covered by unit tests
and play around with the functionality.



How Can I Run the Examples?
---------------------------
Either view the examples on [GitHub](https://oktarintentakel.github.io/annex/examples/) or open
`/docs/examples/index.html` locally after checking out the repo.



How Do I Install This?
----------------------
Besides just downloading the zip file and dropping the package in your project (which I would not recommend doing), you
may easily use NPM or Yarn.

Currently, I'm publishing to Github packages and not the central NPM registry. If you want to directly install the
package, not using the repository URL, , you'll have to tell NPM/Yarn, that `@oktarintentakel` can be found at GitHub
packages and not at the central NPM registry and add an access token to use for installing. To do this, add or edit a
`.npmrc` file (either globally in your home folder or next to the `package.json` to your project) and add
`@oktarintentakel:registry=https://npm.pkg.github.com` to the file (following GitHub's
[documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)
). After this, the defined namespace is installed from there automatically. Additionally, we also need a personal access
token by adding the line `//npm.pkg.github.com/:_authToken=TOKEN` (following GitHub's
[documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)
).

**Hint:** I am aware, that this is rather cumbersome currently, and therefore I currently suggest using the repository
URL, but I implemented the workflow anyway, awaiting an easier workflow in the future.


### NPM

```bash
npm install @oktarintentakel/annex
```
or with a version
```bash
npm install @oktarintentakel/annex@X.X.X
```
or via GitHub repository
```bash
npm install oktarintentakel/annex
```
or via GitHub repository using a tag
```bash
npm install oktarintentakel/annex#vX.X.X
```


### Yarn

```bash
yarn add @oktarintentakel/annex
```
or with a version
```bash
yarn add @oktarintentakel/annex@X.X.X
```
or via GitHub repository
```bash
yarn add oktarintentakel/annex
```
or via GitHub repository using a tag
```bash
yarn add oktarintentakel/annex#vX.X.X
```


### Using an Alias Location

In many cases (especially when installing directly from Github repository) it makes sense to define an install alias,
to manually define a folder inside `node_modules` to install to.

Using NPM
```bash
npm install my-alias-location@:npm@oktarintentakel/annex@X.X.X
```
or using NPM with GitHub repository
```bash
npm install my-alias-location@oktarintentakel/annex#vX.X.X
```
or using Yarn
```bash
yarn add my-alias-location@:npm@oktarintentakel/annex@X.X.X
```
or using Yarn with GitHub repository
```bash
yarn add my-alias-location@oktarintentakel/annex#vX.X.X
```
or in `package.json`
```json
{
  "dependencies": {
      "my-alias-location" : "npm:@oktarintentakel/annex@X.X.X"
  }
}
```
or with Github repository
````json
{
  "dependencies": {
      "my-alias-location" : "oktarintentakel/annex#vX.X.X"
  }
}
````


### @client Package Separation

It may be a good idea, to generally split node and client packages up. Why? Client packages are delivered directly to
the client and are executed and interpreted on the user's machine. So, these packages have a different set of rules
applying to them. For example: it is not really clever to give client packages an approximate version, like a normal
node dependency using `^` oder `~`, because every minor change in a client package may affect all receiving clients
after a reevaluation of npm versions. This is a nightmare, because this means, that, at undetermined points in time, all
cross-browser testing you did may be invalid and since you are not seeing everything while developing all the time, your
app may fall apart on certain devices, without you knowing.

Another problem is sharing of packages between dev/build/hosting and frontend/client. Let's say both use lodash or q
promises: both have to agree on the exact same version, that should not be changed frequently because of the afore
mentioned problems. That is very unpractical for both usages and each should be able to use the version fitting its
purpose, since they are used for different things on very different machines, even if it is the same package under the
hood.

So I generally propse separating all npm packages, that are delivered to the client directly in any way into a specific
`@client` package in `node_modules` using fixed versioning for these (I originally got the idea when I transitioned)
from bower to npm, reading the bower team's [ideas](https://bower.io/blog/2017/how-to-migrate-away-from-bower/) about
this.

So, I propose to generally use an alias location for client packages, such as this
(see previous point, for all/other options):

```json
{
  "dependencies": {
      "@client/jig" : "oktarintentakel/annex#vX.X.X"
  }
}
```



How Do I Include and Use This?
------------------------------
After installation, just include single functions/symbols from the semantic packages like this:

`import {log} from 'annex/source/logging';`

It might be a good idea, to set a path alias in your bundler, to skip the source path.

In Webpack a path alias would look like this (see [documentation](https://webpack.js.org/configuration/resolve/#resolvealias)):

```js
{
  resolve: {
    alias: {
      annex : path.resolve(__dirname, 'node_modules/@client/annex/source/')
    }
  }
}
```

Which would allow you an import like this:
`import {log} from 'annex/logging';`

If you want to serve packages without bundling, as they are, you can do so, by serving them as type module scripts.
For this purpose I included a `dist` dir, containing minified, ES6 scripts. Use these, you would do:

`<script type="module" src="annex/dist/logging.js"></script>`

In this case, make sure all dist file are publicly available and are in the same dir, so imports can work.

Of course you can also import `dist` files via a bundler, but in that case you would lose the capability to jump to
readable source in your IDE and you would also lose all JSDOC strings.

Be aware, that all module source code is written in fairly up-to-date ES6, disregarding legacy concerns. So, whether
you are bundling the modules or using them verbatim, keep the browser support in mind and make sure to set up
transpilation during bundling, matching your browser matrix, if necessary. All features I'm using are transpilable
with [Babel](https://babeljs.io/) and polyfillable with [core-js](https://github.com/zloirock/core-js)
(have a look at the gulpfile for a working webpack setup). Anything additionally necessary, I've included as a 
polyfill function in the "polyfills" module (stuff like CustomEvents, which are not included in core-js).

If you need to use ES5, I also included a monolithic ES5 version in `dist` as a UMD. So you can easily load the script
with

`<script src="public/annex/dist/es5-monolith.js"></script>`

After which there should be `window.annex`, which has each package as a key, so for example

`window.annex.logging.log('test')`

should write something to the console.

ES5 is compiled with a target >= IE11.



Versioning
----------
I'm using semver, so majors are definitely breaking, minors may be breaking and bugfixes should never break anything.



Is This Any Good, Why Should I Use This?
----------------------------------------
Well, since this package is not monolithic: Why not?

If anything catches your eye, just use this one thing and maybe you find other helpful things as well. Since ES6 we have
the luxurious situation of being able to pick and choose, without immediately bloating the bundle. And since annex has
no peer dependencies, you are not even bloating your node_modules.

On the other hand, you are also completely free to just scan the source and copy whatever you need, if you do not want
to add the dependency. You are completely free to just use the repo as reference as well!

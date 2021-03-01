![annex](annex.png)



annex
=====
by Sebastian Schlapkohl



!WARNING!
---------
This is still in early phases of development, 1.0.0 will be the first stable version. Do not use before beta status!



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
(such as `logging` or `string-handling`).

So, the TL;DR is: annex is a battle-proven, tested pool of frontend js tools to solve reappearing tasks quickly and make
JavaScript more bearable by streamlining syntactical nonsense and providing functions other languages provide naturally. 



Some of the Batteries Included
------------------------------
- better logging 
- variable normalization
- info getters for variable states like type and value checks
- string format functionality
- string generation and conversion tools like slugification and safe id generation
- array tools
- math helpers
- better timers
- polling
- url and navigation helpers
- solutions for obfuscated mailto and tel links
- browser capability checks
- cookie handling
- image and webfont callback helpers
- form helpers for data
- event tools
- ...

Have a look at the documentation in `doc` to get a complete picture of what's there and play around with
the examples in `examples`.



Is This Tested in Any Way?
--------------------------
Yes, it actually is!

The algorithmic core is tested via [Ava](https://github.com/avajs/ava) and all tests are to be found in `test`.

Many features are not really well suited for unit testing but require a real browser as a context.
For all those cases I built example pages (to be found under `examples`, just opening `index.hml` from the file system
should work). In these example pages you can browse all topics not covered by unit tests and play around with the
functionality.



Is This Documented Somewhere?
-----------------------------
Yes, that as well.

Visit the documentation on [GitHub](https://oktarintentakel.github.io/annex/) or open `/doc/index.html` locally
after checking out the repo.



How Do I Install This?
----------------------
Besides just downloading the zip and dropping the package in your project (which I would not recommend doing), you may
easily use npm or yarn. Since I do not publish to npm yet, you can just reference the github repo and maybe the version
tag (which I would recommed) and you are done. To get an idea about the latest version and/or changes, have a look at
the tags and releases in Github.

### NPM
```
npm install oktarintentakel/annex
```
or
```
npm install oktarintentakel/annex#vX.X.X
```

### Yarn
```
yarn add oktarintentakel/annex
```
or
```
yarn add oktarintentakel/annex#vX.X.X
```

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

So, adding a `@client` dependency may look like this in `package.json`:

```
"dependencies": {
    "@client/annex" : "oktarintentakel/annex#vX.X.X",
    ...
}
```

You can also add the dependency on the command line like this, albeit the command gets a little lengthy then:

```
yarn add @client/annex@oktarintentakel/annex#vX.X.X
```

If the package is on npm you can, of course, pull the package from there as well:

```
"dependencies": {
    "@client/some-npm-package" : "npm:some-npm-package@1.0.0",
    ...
}
```


How Do I Include and Use This?
------------------------------
After installation, just include single functions/symbols from the semantic packages like this:

`import {log} from 'annex/source/logging';`

If you want to serve packages without bundling, as they are, you can do so, by serving them as type module scripts.
For this purpose I included a `dist` dir, containing minified, ES6 scripts. Use these, you would do:

`<script type="module" src="annex/dist/logging.js"></script>`

In this case, make sure all dist file are publicly available and are in the same dir, so imports can work.

Of course you can also import `dist` files via a bundler, but in that case you would lose the capability to jump to
readable source in your IDE and you would also lose all JSDOC strings.

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

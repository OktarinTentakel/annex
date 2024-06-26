//###[ IMPORTS ]########################################################################################################

import fs from 'node:fs';
import gulp from'gulp';
import shell from 'gulp-shell';
import yargs from 'yargs';

import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import inject from 'gulp-inject-string';
import connect from 'gulp-connect';

import serveStatic from 'st';

import * as rollup from 'rollup';
import {babel as rollupBabel} from '@rollup/plugin-babel';
import rollupCommonJs from '@rollup/plugin-commonjs';
import rollupNodeResolve from '@rollup/plugin-node-resolve';
import rollUpTerser from '@rollup/plugin-terser';
import rollupIncludePaths from 'rollup-plugin-includepaths';



//###[ CONSTANTS ]######################################################################################################

const
	SOURCE_DIR = './source',
	DIST_DIR = './dist',
	EXAMPLES_DIR = './docs/examples',
	DOCUMENTATION_DIR = './docs/documentation',
	PACKAGE_CONFIG = JSON.parse(fs.readFileSync('./package.json', {encoding : 'utf-8'})),
	ARGV = yargs(process.argv).argv
;



//###[ FUNCTIONS ]######################################################################################################

function buildJs(){
	return gulp.src([`${SOURCE_DIR}/**/*.js`, `!${SOURCE_DIR}/_monolith.js`])
		.pipe(sourcemaps.init())
			.pipe(terser({
				output : {
					comments : /^\**!|@preserve|@license|@cc_on/i
				}
			}))
			.pipe(inject.prepend(
				'/*!\n'
				+` * ${PACKAGE_CONFIG.name} v${PACKAGE_CONFIG.version}\n`
				+' */\n'
			))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(DIST_DIR))
	;
}



function buildEs5Monolith(){
	const rollupConfig = {
		input : `${SOURCE_DIR}/_monolith.js`,
		output : {
			file : `${DIST_DIR}/es5-monolith.js`,
			format : 'umd',
			name : 'annex',
			sourcemap : true,
			banner : ''
				+'/*!\n'
				+` * ${PACKAGE_CONFIG.name} v${PACKAGE_CONFIG.version}\n`
				+' */\n'
		},
		plugins : [
			rollupIncludePaths({
				paths : [SOURCE_DIR]
			}),
			rollupNodeResolve(),
			rollupCommonJs(),
			rollupBabel({
				exclude : 'node_modules/**',
				babelHelpers : 'bundled',
				presets : [
					['@babel/preset-env', {
						corejs : 3,
						targets : PACKAGE_CONFIG.browserslist,
						useBuiltIns : 'usage'
					}]
				]
			}),
			rollUpTerser({
				output : {
					comments : /^\**!|@preserve|@license|@cc_on/i
				}
			})
		]
	};

	return rollup.rollup(rollupConfig).then(bundle => bundle.write(rollupConfig.output));
}



function copyExamplesLibs(){
	gulp.src([`${SOURCE_DIR}/**/*.js`])
		.pipe(gulp.dest(`${EXAMPLES_DIR}/lib/annex/source`))
	;

	return gulp.src([`${DIST_DIR}/**/*.js`, `${DIST_DIR}/**/*.js.map`])
		.pipe(gulp.dest(`${EXAMPLES_DIR}/lib/annex/dist`))
	;
}



function serveExamples(done){
	connect.server({
		https : true,
		host : '0.0.0.0',
		root : EXAMPLES_DIR,
		port : 3000,
		livereload : {
			port : 3001
		},
		middleware(connect, opt){
			return [
				function(req, res, next){
					// treat POST request like GET during dev
					req.method = 'GET';
					return next();
				},
				serveStatic({
					path : DOCUMENTATION_DIR,
					url : '/documentation',
					// otherwise connect produces a content encoding error
					gzip : false
				})
			];
		}
	});

	done();
}



function reload(source){
	return gulp.src(source)
		.pipe(connect.reload())
	;
}



//###[ TASKS ]##########################################################################################################

gulp.task('watch-build', gulp.series(buildJs, buildEs5Monolith, copyExamplesLibs));
gulp.task('watch', function(done){
	const watchConfig = {
		usePolling : true,
		interval : 1000,
		binaryInterval : 1000
	};

	gulp.watch(
		`${SOURCE_DIR}/**/*.js`,
		watchConfig,
		gulp.series('watch-build', function reloadJs(){ return reload(`${SOURCE_DIR}/**/*.js`); })
	);

	gulp.watch(
		`${EXAMPLES_DIR}/**/*.*`,
		watchConfig,
		gulp.series(function reloadExamples(){ return reload(`${EXAMPLES_DIR}/**/*.*`); })
	);

	done();
});

gulp.task('documentation', shell.task([`rm -rf ${DOCUMENTATION_DIR}`, 'sleep 1', 'jsdoc -c jsdoc.config.json --verbose']));

const testTopic = ARGV.topic ? ` --topic=${ARGV.topic}` : '';
gulp.task('test', shell.task(`yarn run test${testTopic}`));
gulp.task('test-dist', shell.task(`yarn run test-dist${testTopic}`));
gulp.task('test-es5-monolith', shell.task(`yarn run test-es5-monolith${testTopic}`));

gulp.task('build', gulp.series(
	function removeDist(done){ shell.task(`rm -rf ${DIST_DIR}/*`)().then(done); },
	function removeExamplesDist(done) { shell.task(`rm -rf ${EXAMPLES_DIR}/lib/annex/dist/*`)().then(done); },
	function waitForFileSystem(done) { shell.task(`sleep 5`)().then(done); },
	'test',
	buildJs, 'test-dist',
	buildEs5Monolith, 'test-es5-monolith',
	copyExamplesLibs
));

gulp.task('examples', gulp.series('build', 'documentation', serveExamples, 'watch'));

gulp.task('default', gulp.series('build'));

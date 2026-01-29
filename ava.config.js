let topic = '*';

process.argv.slice(2).forEach(arg => {
	const
		argParts = arg.split('='),
		argName = argParts[0],
		argValue = argParts[1]
	;

	switch( argName ){
		case 'topic':
		case '--topic':
			if( !!argValue ){
				topic = `${argValue}`;
			}
		break;
	}
});



const SOURCE = process.env.SOURCE ?? 'source';
console.log(`> testing "${SOURCE}"`);



export default {
	files : [
		['arrays', 'basic'].includes(topic)
			? `./test/annex/${topic}.ts`
			: `./test/annex/${topic}.js`
	],
	environmentVariables : {
		SOURCE
	},
	require : [
		'./test/helpers/setup-browserenv.js',
	],
	verbose : true,
	timeout : '60s',
	extensions : {
		js : true,
		ts : 'module',
	},
}

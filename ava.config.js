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

export default {
	files : [
		`./test/annex/${topic}.js`
	],
	require : [
		'./test/helpers/setup-browserenv.js'
	],
	verbose : true,
	timeout : '60s',
}

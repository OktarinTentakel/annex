(function(){
	var fRandomInt = function(floor, ceiling){
		return Math.floor(Math.random() * (ceiling - floor + 1) + floor);
	};

	var message = document.createElement('div');
	message.textContent = 'Script has been inserted and executed.';
	message.style.padding = '1rem';
	message.style.backgroundColor = 'white';
	message.style.position = 'fixed';
	message.style.zIndex = '1000';
	message.style.top = fRandomInt(25, 75)+'%';
	message.style.left = fRandomInt(25, 75)+'%';
	message.style.transform = 'translate(-50%, -50%)';
	message.style.boxShadow = 'inset 0 -3em 3em rgba(0,0,0,0.1), 0 0 0 2px rgb(255,255,255), 0.3em 0.3em 1em rgba(0,0,0,0.3)';

	document.body.appendChild(message);

	window.setTimeout(function(){
		document.body.removeChild(message);
	}, 1000);
})();

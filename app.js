var game = require('./src/game'),
	prompt = require('prompt');

prompt.message = '';
prompt.start();

function hit() {
	prompt.get([{
		name: 'field',
		message: 'Hit the ship! Use format: "A4"'
	}], function (err, result) {

		game.hit(result.field);

		if (!game.over) {
			hit();
		}
	});
}

hit()

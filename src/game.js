'use strict';

var utils = require('./utils'),
	board = require('./board'),
	game = {},
	BOARD_SIDE = 10,
	FIELD_NAMES_MAP = 'ABCDEFGHIJ',

	ships = [5, 4, 4],
	table;

table = board.createEmptyTable(BOARD_SIDE);

ships = ships.map(function (shipSize) {
	var ship;

	do {
		ship = getRandomShip(shipSize);

	} while (!checkShipField(ship, table));

	// Marking ship on a table...
	//   0 1 2 3 4
	// 0 O X X X O
	// 1 O O O O O
	// 2 O O O O O
	// 3 O O O O O
	// 4 O O O O O

	board.eachSegmentField(ship, function (x, y) {
		table[x][y] = ship;

		// ...and ship rim
		//   0 1 2 3 4
		// 0 X O O O X
		// 1 X X X X X
		// 2 O O O O O
		// 3 O O O O O
		// 4 O O O O O
		board.eachFieldAround(x, y, table, function (x, y) {
			if (typeof table[x][y] !== 'object') {
				table[x][y] = true;
			}
		});
	});

	return ship;
});

function checkShipField(segment, table) {
	var result = true;

	board.eachSegmentField(segment, function (x, y) {
		var field = table[x][y];

		// Checking whether one of ship field in on another ship.
		if (typeof field === 'object') {
			result = false;
			return false;
		}

		board.eachFieldAround(x, y, table, function (x, y) {
			var row = table[x];

			// Checking whether in ship rim there is an another ship.
			if (row && row[y] && typeof row[y] === 'object') {
				result = false;
				return false;
			}
		});
	});

	return result;
}

// @TODO: This function might be a part of board module.
function getRandomShip(shipSize) {
	var maxStartPos = BOARD_SIDE - shipSize,
		orientation = utils.getRandomInt(0, 1) === 1 ? board.ORIENTATION.HORIZONTAL : board.ORIENTATION.VERTICAL,
		segment;

	// For table with side equals to 5, and horizontal ship with width of 4
	// there are only two columns possible to start ship. With offset 0 and 1.
	// All rows are available - offset with range from 0 to 4.
	// [+] - available     [-] - unavailable

	//    A   B   C   D   E
	// 1 [+] [+] [-] [-] [-]
	// 2 [+] [+] [-] [-] [-]
	// 3 [+] [+] [-] [-] [-]
	// 4 [+] [+] [-] [-] [-]
	// 5 [+] [+] [-] [-] [-]
	segment = board.createSegment(
		utils.getRandomInt(0, orientation === board.ORIENTATION.HORIZONTAL ? maxStartPos : BOARD_SIDE - 1),
		utils.getRandomInt(0, orientation === board.ORIENTATION.VERTICAL ? maxStartPos : BOARD_SIDE - 1),
		shipSize,
		orientation
	);

	segment.hits = [];
	segment.sunken = false;

	return segment;
}

function getSunkenShipsAmount(ships) {
	var max = ships.length,
		sunken = 0;

	while (max--) {
		if (ships[max].sunken) {
			sunken++;
		}
	}

	return sunken;
}

function hit(x, y) {
	var row = table[x],
		field = row ? row[y] : undefined,
		ship,
		fieldPositionInShip;

	if (typeof field !== 'object') {
		console.log('Nope, not this time!');
		return;
	}

	ship = field;
	fieldPositionInShip = board.getFieldPositionInSegment(ship, x, y);

	if (ship.hits.indexOf(fieldPositionInShip) !== -1) {
		console.log('You hit it already!');
		return;
	}

	console.log('Nice shot!');
	ship.hits.push(fieldPositionInShip);

	if (ship.hits.length >= ship.size) {
		ship.sunken = true;
		console.log('You sink a ship, well done!');
	}

	if (getSunkenShipsAmount(ships) >= ships.length) {
		game.over = true;
		console.log('End of game!');
	}
}

game.hit = function (pos) {
	var x = FIELD_NAMES_MAP.indexOf(pos[0].toUpperCase()),
		y = pos.substr(1) - 1;

	hit(x, y);
};

module.exports = game;

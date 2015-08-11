window.game = (function () {
	'use strict';

	var BOARD_SIDE = 10,
		FIELD_NAMES_MAP = 'ABCDEFGHIJ',
		ORIENTATION = {
			VERTICAL: 'V',
			HORIZONTAL: 'H'
		},
		OFFSETS = [
			[-1,-1], [0,-1], [1,-1],
			[-1, 0],         [1, 0],
			[-1, 1], [0, 1], [1, 1]
		],

		ships = [5, 4, 4],
		table;

	table = createEmptyTable(BOARD_SIDE);

	ships = ships.map(function(shipSize) {
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

		eachShipField(ship, table, function(field, x, y) {
			table[x][y] = ship;

			// ...and ship rim
			//   0 1 2 3 4
			// 0 X O O O X
			// 1 X X X X X
			// 2 O O O O O
			// 3 O O O O O
			// 4 O O O O O
			eachFieldAround(x, y, table, function(x, y) {
				var row = table[x];

				if (
					x < 0 || x >= table.length ||
					y < 0 || y >= table.length
				) {
					return;
				}

				if (typeof row[y] !== 'object') {
					row[y] = true;
				}
			});
		});

		return ship;
	});

	function eachFieldAround(x, y, table, cb) {
		OFFSETS.forEach(function(offset) {
			var _x = x + offset[0],
				_y = y + offset[1];

			cb(_x, _y, table);
		});
	}

	function eachShipField(ship, table, cb) {
		for (var i = 0; i < ship.size; i++) {
			// If it's a horizontal ship, we are going through X axis, otherwise - Y.
			var x, y;

			if (ship.orientation == ORIENTATION.HORIZONTAL) {
				x = ship.x + i;
				y = ship.y;
			} else {
				x = ship.x;
				y = ship.y + i;
			}

			// Terminate when callback returns false.
			if(cb(table[x][y], x, y) === false) {
				return;
			}
		}
	}

	function getFieldPositionInShip(ship, x, y) {
		if (ship.orientation === ORIENTATION.HORIZONTAL) {
			return x - ship.x;
		} else {
			return y - ship.y;
		}
	}

	function checkShipField(ship, table) {
		var result = true;

		eachShipField(ship, table, function(field, x, y) {
			// Checking whether one of ship field in on another ship.
			if (typeof field === 'object') {
				result = false;
				return false;
			}

			eachFieldAround(x, y, table, function(x, y) {
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

	function getRandomShip(shipSize) {
		var maxStartPos = BOARD_SIDE - shipSize;
		var orientation = getRandomInt(0, 1) === 1 ? ORIENTATION.HORIZONTAL : ORIENTATION.VERTICAL;

		// For table with side equals to 5, and horizontal ship with width of 4
		// there are only two columns possible to start ship. With offset 0 and 1.
		// All rows are available - offset with range from 0 to 4.
		// O - available     X - unavailable

		//   0 1 2 3 4
		// 0 O O X X X
		// 1 O O X X X
		// 2 O O X X X
		// 3 O O X X X
		// 4 O O X X X

		return {
			x: getRandomInt(0, orientation === ORIENTATION.HORIZONTAL ? maxStartPos : BOARD_SIDE - 1),
			y: getRandomInt(0, orientation === ORIENTATION.VERTICAL ? maxStartPos : BOARD_SIDE - 1),
			size: shipSize,
			hits: [],
			orientation: orientation,
			sunken: false
		};
	}

	function hit(x, y) {
		var row = table[x],
			field = row ? row[y] : undefined;

		if (typeof field !== 'object') {
			console.log('Nope, not this time!');
			return;
		}

		var ship = field;
		var fieldPositionInShip = getFieldPositionInShip(ship, x, y);

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

		var max = ships.length,
			sunken = 0;

		while (max--) {
			if (ships[max].sunken) {
				sunken++;
			}
		}

		if (sunken >= ships.length) {
			console.log('End of game!');
		}
	}

	// Utils.
	function createEmptyTable(size) {
		var arr = [],
			i;

		for (i = 0; i < size; i++) {
			arr.push(new Array(size));
		}

		return arr;
	}

	// Utils.
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	return {
		hit: function (pos) {
			hit(FIELD_NAMES_MAP.indexOf(pos[0]), pos[1] - 1);
		}
	};
}());

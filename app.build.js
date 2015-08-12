(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['exports', 'game'], factory);
	} else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
		// CommonJS
		factory(exports);
	} else {
		// Browser globals
		factory(root.game = {});
	}
}(this, function (exports) {
	'use strict';
	var utils = require('./src/utils'),
		board = require('./src/board');

	var BOARD_SIDE = 10,
		FIELD_NAMES_MAP = 'ABCDEFGHIJ',

		ships = [5, 4, 4],
		table;

	table = board.createEmptyTable(BOARD_SIDE);

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

		board.eachSegmentField(ship, table, function(field, x, y) {
			table[x][y] = ship;

			// ...and ship rim
			//   0 1 2 3 4
			// 0 X O O O X
			// 1 X X X X X
			// 2 O O O O O
			// 3 O O O O O
			// 4 O O O O O
			board.eachFieldAround(x, y, table, function(x, y) {
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

	function checkShipField(segment, table) {
		var result = true;

		board.eachSegmentField(segment, table, function(field, x, y) {
			// Checking whether one of ship field in on another ship.
			if (typeof field === 'object') {
				result = false;
				return false;
			}

			board.eachFieldAround(x, y, table, function(x, y) {
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
		var orientation = utils.getRandomInt(0, 1) === 1 ? board.ORIENTATION.HORIZONTAL : board.ORIENTATION.VERTICAL;

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
			x: utils.getRandomInt(0, orientation === board.ORIENTATION.HORIZONTAL ? maxStartPos : BOARD_SIDE - 1),
			y: utils.getRandomInt(0, orientation === board.ORIENTATION.VERTICAL ? maxStartPos : BOARD_SIDE - 1),
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
		var fieldPositionInShip = table.getFieldPositionInSegment(ship, x, y);

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

	exports.hit = function(pos) {
		hit(FIELD_NAMES_MAP.indexOf(pos[0]), pos[1] - 1);
	};
}));

},{"./src/board":2,"./src/utils":3}],2:[function(require,module,exports){
module.exports = {
	OFFSETS: [
		[-1,-1], [0,-1], [1,-1],
		[-1, 0],         [1, 0],
		[-1, 1], [0, 1], [1, 1]
	],

	ORIENTATION: {
		VERTICAL: 'V',
		HORIZONTAL: 'H'
	},

	createEmptyTable: function(size) {
		var arr = [],
		  i;

		for (i = 0; i < size; i++) {
			arr.push(new Array(size));
		}

		return arr;
	},

	eachFieldAround: function(x, y, board, cb) {
		this.OFFSETS.forEach(function(offset) {
			var _x = x + offset[0],
			  _y = y + offset[1];

			cb(_x, _y, board);
		});
	},

	eachSegmentField: function(segment, board, cb) {
		for (var i = 0; i < segment.size; i++) {
			// If it's a horizontal ship, we are going through X axis, otherwise - Y.
			var x, y;

			if (segment.orientation == this.ORIENTATION.HORIZONTAL) {
				x = segment.x + i;
				y = segment.y;
			} else {
				x = segment.x;
				y = segment.y + i;
			}

			// Terminate when callback returns false.
			if(cb(board[x][y], x, y) === false) {
				return;
			}
		}
	},

	getFieldPositionInSegment: function(segment, x, y) {
		if (segment.orientation === this.ORIENTATION.HORIZONTAL) {
			return x - segment.x;
		} else {
			return y - segment.y;
		}
	}
};

},{}],3:[function(require,module,exports){
module.exports = {
	getRandomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAuanMiLCJzcmMvYm9hcmQuanMiLCJzcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoWydleHBvcnRzJywgJ2dhbWUnXSwgZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBleHBvcnRzLm5vZGVOYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdC8vIENvbW1vbkpTXG5cdFx0ZmFjdG9yeShleHBvcnRzKTtcblx0fSBlbHNlIHtcblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KHJvb3QuZ2FtZSA9IHt9KTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cdHZhciB1dGlscyA9IHJlcXVpcmUoJy4vc3JjL3V0aWxzJyksXG5cdFx0Ym9hcmQgPSByZXF1aXJlKCcuL3NyYy9ib2FyZCcpO1xuXG5cdHZhciBCT0FSRF9TSURFID0gMTAsXG5cdFx0RklFTERfTkFNRVNfTUFQID0gJ0FCQ0RFRkdISUonLFxuXG5cdFx0c2hpcHMgPSBbNSwgNCwgNF0sXG5cdFx0dGFibGU7XG5cblx0dGFibGUgPSBib2FyZC5jcmVhdGVFbXB0eVRhYmxlKEJPQVJEX1NJREUpO1xuXG5cdHNoaXBzID0gc2hpcHMubWFwKGZ1bmN0aW9uKHNoaXBTaXplKSB7XG5cdFx0dmFyIHNoaXA7XG5cblx0XHRkbyB7XG5cdFx0XHRzaGlwID0gZ2V0UmFuZG9tU2hpcChzaGlwU2l6ZSk7XG5cblx0XHR9IHdoaWxlICghY2hlY2tTaGlwRmllbGQoc2hpcCwgdGFibGUpKTtcblxuXHRcdC8vIE1hcmtpbmcgc2hpcCBvbiBhIHRhYmxlLi4uXG5cdFx0Ly8gICAwIDEgMiAzIDRcblx0XHQvLyAwIE8gWCBYIFggT1xuXHRcdC8vIDEgTyBPIE8gTyBPXG5cdFx0Ly8gMiBPIE8gTyBPIE9cblx0XHQvLyAzIE8gTyBPIE8gT1xuXHRcdC8vIDQgTyBPIE8gTyBPXG5cblx0XHRib2FyZC5lYWNoU2VnbWVudEZpZWxkKHNoaXAsIHRhYmxlLCBmdW5jdGlvbihmaWVsZCwgeCwgeSkge1xuXHRcdFx0dGFibGVbeF1beV0gPSBzaGlwO1xuXG5cdFx0XHQvLyAuLi5hbmQgc2hpcCByaW1cblx0XHRcdC8vICAgMCAxIDIgMyA0XG5cdFx0XHQvLyAwIFggTyBPIE8gWFxuXHRcdFx0Ly8gMSBYIFggWCBYIFhcblx0XHRcdC8vIDIgTyBPIE8gTyBPXG5cdFx0XHQvLyAzIE8gTyBPIE8gT1xuXHRcdFx0Ly8gNCBPIE8gTyBPIE9cblx0XHRcdGJvYXJkLmVhY2hGaWVsZEFyb3VuZCh4LCB5LCB0YWJsZSwgZnVuY3Rpb24oeCwgeSkge1xuXHRcdFx0XHR2YXIgcm93ID0gdGFibGVbeF07XG5cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHggPCAwIHx8IHggPj0gdGFibGUubGVuZ3RoIHx8XG5cdFx0XHRcdFx0eSA8IDAgfHwgeSA+PSB0YWJsZS5sZW5ndGhcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHR5cGVvZiByb3dbeV0gIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0cm93W3ldID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gc2hpcDtcblx0fSk7XG5cblx0ZnVuY3Rpb24gY2hlY2tTaGlwRmllbGQoc2VnbWVudCwgdGFibGUpIHtcblx0XHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuXHRcdGJvYXJkLmVhY2hTZWdtZW50RmllbGQoc2VnbWVudCwgdGFibGUsIGZ1bmN0aW9uKGZpZWxkLCB4LCB5KSB7XG5cdFx0XHQvLyBDaGVja2luZyB3aGV0aGVyIG9uZSBvZiBzaGlwIGZpZWxkIGluIG9uIGFub3RoZXIgc2hpcC5cblx0XHRcdGlmICh0eXBlb2YgZmllbGQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGJvYXJkLmVhY2hGaWVsZEFyb3VuZCh4LCB5LCB0YWJsZSwgZnVuY3Rpb24oeCwgeSkge1xuXHRcdFx0XHR2YXIgcm93ID0gdGFibGVbeF07XG5cblx0XHRcdFx0Ly8gQ2hlY2tpbmcgd2hldGhlciBpbiBzaGlwIHJpbSB0aGVyZSBpcyBhbiBhbm90aGVyIHNoaXAuXG5cdFx0XHRcdGlmIChyb3cgJiYgcm93W3ldICYmIHR5cGVvZiByb3dbeV0gPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRSYW5kb21TaGlwKHNoaXBTaXplKSB7XG5cdFx0dmFyIG1heFN0YXJ0UG9zID0gQk9BUkRfU0lERSAtIHNoaXBTaXplO1xuXHRcdHZhciBvcmllbnRhdGlvbiA9IHV0aWxzLmdldFJhbmRvbUludCgwLCAxKSA9PT0gMSA/IGJvYXJkLk9SSUVOVEFUSU9OLkhPUklaT05UQUwgOiBib2FyZC5PUklFTlRBVElPTi5WRVJUSUNBTDtcblxuXHRcdC8vIEZvciB0YWJsZSB3aXRoIHNpZGUgZXF1YWxzIHRvIDUsIGFuZCBob3Jpem9udGFsIHNoaXAgd2l0aCB3aWR0aCBvZiA0XG5cdFx0Ly8gdGhlcmUgYXJlIG9ubHkgdHdvIGNvbHVtbnMgcG9zc2libGUgdG8gc3RhcnQgc2hpcC4gV2l0aCBvZmZzZXQgMCBhbmQgMS5cblx0XHQvLyBBbGwgcm93cyBhcmUgYXZhaWxhYmxlIC0gb2Zmc2V0IHdpdGggcmFuZ2UgZnJvbSAwIHRvIDQuXG5cdFx0Ly8gTyAtIGF2YWlsYWJsZSAgICAgWCAtIHVuYXZhaWxhYmxlXG5cblx0XHQvLyAgIDAgMSAyIDMgNFxuXHRcdC8vIDAgTyBPIFggWCBYXG5cdFx0Ly8gMSBPIE8gWCBYIFhcblx0XHQvLyAyIE8gTyBYIFggWFxuXHRcdC8vIDMgTyBPIFggWCBYXG5cdFx0Ly8gNCBPIE8gWCBYIFhcblxuXHRcdHJldHVybiB7XG5cdFx0XHR4OiB1dGlscy5nZXRSYW5kb21JbnQoMCwgb3JpZW50YXRpb24gPT09IGJvYXJkLk9SSUVOVEFUSU9OLkhPUklaT05UQUwgPyBtYXhTdGFydFBvcyA6IEJPQVJEX1NJREUgLSAxKSxcblx0XHRcdHk6IHV0aWxzLmdldFJhbmRvbUludCgwLCBvcmllbnRhdGlvbiA9PT0gYm9hcmQuT1JJRU5UQVRJT04uVkVSVElDQUwgPyBtYXhTdGFydFBvcyA6IEJPQVJEX1NJREUgLSAxKSxcblx0XHRcdHNpemU6IHNoaXBTaXplLFxuXHRcdFx0aGl0czogW10sXG5cdFx0XHRvcmllbnRhdGlvbjogb3JpZW50YXRpb24sXG5cdFx0XHRzdW5rZW46IGZhbHNlXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGhpdCh4LCB5KSB7XG5cdFx0dmFyIHJvdyA9IHRhYmxlW3hdLFxuXHRcdFx0ZmllbGQgPSByb3cgPyByb3dbeV0gOiB1bmRlZmluZWQ7XG5cblx0XHRpZiAodHlwZW9mIGZpZWxkICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0Y29uc29sZS5sb2coJ05vcGUsIG5vdCB0aGlzIHRpbWUhJyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHNoaXAgPSBmaWVsZDtcblx0XHR2YXIgZmllbGRQb3NpdGlvbkluU2hpcCA9IHRhYmxlLmdldEZpZWxkUG9zaXRpb25JblNlZ21lbnQoc2hpcCwgeCwgeSk7XG5cblx0XHRpZiAoc2hpcC5oaXRzLmluZGV4T2YoZmllbGRQb3NpdGlvbkluU2hpcCkgIT09IC0xKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnWW91IGhpdCBpdCBhbHJlYWR5IScpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCdOaWNlIHNob3QhJyk7XG5cdFx0c2hpcC5oaXRzLnB1c2goZmllbGRQb3NpdGlvbkluU2hpcCk7XG5cblx0XHRpZiAoc2hpcC5oaXRzLmxlbmd0aCA+PSBzaGlwLnNpemUpIHtcblx0XHRcdHNoaXAuc3Vua2VuID0gdHJ1ZTtcblx0XHRcdGNvbnNvbGUubG9nKCdZb3Ugc2luayBhIHNoaXAsIHdlbGwgZG9uZSEnKTtcblx0XHR9XG5cblx0XHR2YXIgbWF4ID0gc2hpcHMubGVuZ3RoLFxuXHRcdFx0c3Vua2VuID0gMDtcblxuXHRcdHdoaWxlIChtYXgtLSkge1xuXHRcdFx0aWYgKHNoaXBzW21heF0uc3Vua2VuKSB7XG5cdFx0XHRcdHN1bmtlbisrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzdW5rZW4gPj0gc2hpcHMubGVuZ3RoKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnRW5kIG9mIGdhbWUhJyk7XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0cy5oaXQgPSBmdW5jdGlvbihwb3MpIHtcblx0XHRoaXQoRklFTERfTkFNRVNfTUFQLmluZGV4T2YocG9zWzBdKSwgcG9zWzFdIC0gMSk7XG5cdH07XG59KSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0T0ZGU0VUUzogW1xuXHRcdFstMSwtMV0sIFswLC0xXSwgWzEsLTFdLFxuXHRcdFstMSwgMF0sICAgICAgICAgWzEsIDBdLFxuXHRcdFstMSwgMV0sIFswLCAxXSwgWzEsIDFdXG5cdF0sXG5cblx0T1JJRU5UQVRJT046IHtcblx0XHRWRVJUSUNBTDogJ1YnLFxuXHRcdEhPUklaT05UQUw6ICdIJ1xuXHR9LFxuXG5cdGNyZWF0ZUVtcHR5VGFibGU6IGZ1bmN0aW9uKHNpemUpIHtcblx0XHR2YXIgYXJyID0gW10sXG5cdFx0ICBpO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IHNpemU7IGkrKykge1xuXHRcdFx0YXJyLnB1c2gobmV3IEFycmF5KHNpemUpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyO1xuXHR9LFxuXG5cdGVhY2hGaWVsZEFyb3VuZDogZnVuY3Rpb24oeCwgeSwgYm9hcmQsIGNiKSB7XG5cdFx0dGhpcy5PRkZTRVRTLmZvckVhY2goZnVuY3Rpb24ob2Zmc2V0KSB7XG5cdFx0XHR2YXIgX3ggPSB4ICsgb2Zmc2V0WzBdLFxuXHRcdFx0ICBfeSA9IHkgKyBvZmZzZXRbMV07XG5cblx0XHRcdGNiKF94LCBfeSwgYm9hcmQpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGVhY2hTZWdtZW50RmllbGQ6IGZ1bmN0aW9uKHNlZ21lbnQsIGJvYXJkLCBjYikge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VnbWVudC5zaXplOyBpKyspIHtcblx0XHRcdC8vIElmIGl0J3MgYSBob3Jpem9udGFsIHNoaXAsIHdlIGFyZSBnb2luZyB0aHJvdWdoIFggYXhpcywgb3RoZXJ3aXNlIC0gWS5cblx0XHRcdHZhciB4LCB5O1xuXG5cdFx0XHRpZiAoc2VnbWVudC5vcmllbnRhdGlvbiA9PSB0aGlzLk9SSUVOVEFUSU9OLkhPUklaT05UQUwpIHtcblx0XHRcdFx0eCA9IHNlZ21lbnQueCArIGk7XG5cdFx0XHRcdHkgPSBzZWdtZW50Lnk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR4ID0gc2VnbWVudC54O1xuXHRcdFx0XHR5ID0gc2VnbWVudC55ICsgaTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVGVybWluYXRlIHdoZW4gY2FsbGJhY2sgcmV0dXJucyBmYWxzZS5cblx0XHRcdGlmKGNiKGJvYXJkW3hdW3ldLCB4LCB5KSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRnZXRGaWVsZFBvc2l0aW9uSW5TZWdtZW50OiBmdW5jdGlvbihzZWdtZW50LCB4LCB5KSB7XG5cdFx0aWYgKHNlZ21lbnQub3JpZW50YXRpb24gPT09IHRoaXMuT1JJRU5UQVRJT04uSE9SSVpPTlRBTCkge1xuXHRcdFx0cmV0dXJuIHggLSBzZWdtZW50Lng7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB5IC0gc2VnbWVudC55O1xuXHRcdH1cblx0fVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRnZXRSYW5kb21JbnQ6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG5cdH1cbn07XG4iXX0=

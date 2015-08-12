module.exports = {
	//jscs:disable
	// Eight directions.
	OFFSETS: [
		[-1,-1], [0,-1], [1,-1],
		[-1, 0],         [1, 0],
		[-1, 1], [0, 1], [1, 1]
	],
	//jscs:enable

	ORIENTATION: {
		VERTICAL: 'V',
		HORIZONTAL: 'H'
	},

	// Will create two dimensional table.
	createEmptyTable: function (size) {
		var arr = [],
			i;

		for (i = 0; i < size; i++) {
			arr.push(new Array(size));
		}

		return arr;
	},

	// Will execute `cb` function for each field around one.
	//
	//    A   B   C   D
	// 1 [O] [O] [ ] [ ]
	// 2 [X] [O] [ ] [ ]
	// 3 [O] [O] [ ] [ ]
	// 4 [ ] [ ] [ ] [ ]
	//
	// Let's say that we got field at point A2 (one with X haracter)
	// callback function is going to be executed with all fields dimensions around
	// i.e. A1, B1, B2, B3, A3

	eachFieldAround: function (x, y, board, cb) {
		// @TODO: get rid of `this`
		this.OFFSETS.forEach(function (offset) {
			var _x = x + offset[0],
				_y = y + offset[1];

			// Out of range.
			if (
				_x < 0 || _x >= board.length ||
				_y < 0 || _y >= board.length
			) {
				return;
			}

			cb(_x, _y, board);
		});
	},

	// Will execute `cb` function for each segment field.
	//
	//    A   B   C   D
	// 1 [ ] [X] [ ] [ ]
	// 2 [ ] [X] [ ] [ ]
	// 3 [ ] [X] [ ] [ ]
	// 4 [ ] [ ] [ ] [ ]
	//
	// Let's say we have **vertical** segment with starting point **B1** with size of 3,
	// callback function is going to be executed with all fields in a segment
	// i.e. B1, B2, B3
	eachSegmentField: function (segment, cb) {
		var i, x, y;

		for (i = 0; i < segment.size; i++) {
			// If it's a horizontal ship, we are going through X axis, otherwise - Y.

			// @TODO: get rid of `this`
			if (segment.orientation == this.ORIENTATION.HORIZONTAL) {
				x = segment.x + i;
				y = segment.y;
			} else {
				x = segment.x;
				y = segment.y + i;
			}

			// Terminate when callback returns false.
			if (cb(x, y) === false) {
				return;
			}
		}
	},

	// Function will return index of a point in a segment.
	//
	//    A   B   C   D
	// 1 [ ] [ ] [ ] [ ]
	// 2 [ ] [X] [X] [X]
	// 3 [ ] [ ] [ ] [ ]
	// 4 [ ] [ ] [ ] [ ]
	//
	// For point D2 it will returns 2 which is last index.
	// For point B2 - index 0.
	getFieldPositionInSegment: function (segment, x, y) {
		if (segment.orientation === this.ORIENTATION.HORIZONTAL) {
			return x - segment.x;
		} else {
			return y - segment.y;
		}
	},

	// Function creates segment which we can imagine as some kind of vector.
	//
	//    A   B   C   D
	// 1 [ ] [ ] [ ] [ ]
	// 2 [ ] [X] [X] [X]
	// 3 [ ] [ ] [ ] [ ]
	// 4 [ ] [ ] [ ] [ ]
	//
	// Above there is a segment with x equals to 1,
	// x equals to 1, size of 3 and horizontal orientation.
	// x and y will be here a starting point B2.
	createSegment: function(x, y, size, orientation) {
		return {
			x: x,
			y: y,
			size: size,
			orientation: orientation
		};
	}
};

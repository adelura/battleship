module.exports = {
	//jscs:disable
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

	createEmptyTable: function (size) {
		var arr = [],
			i;

		for (i = 0; i < size; i++) {
			arr.push(new Array(size));
		}

		return arr;
	},

	eachFieldAround: function (x, y, board, cb) {
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

	eachSegmentField: function (segment, cb) {
		var i, x, y;

		for (i = 0; i < segment.size; i++) {
			// If it's a horizontal ship, we are going through X axis, otherwise - Y.

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

	getFieldPositionInSegment: function (segment, x, y) {
		if (segment.orientation === this.ORIENTATION.HORIZONTAL) {
			return x - segment.x;
		} else {
			return y - segment.y;
		}
	}
};

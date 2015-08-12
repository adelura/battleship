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

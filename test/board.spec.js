var expect = require('chai').expect,
	sinon = require('sinon'),

	board = require('../src/board');

describe('Function "createEmptyTable"', function () {
	it('should create two dimensional table with proper size', function () {
		var size = 3,
			table = board.createEmptyTable(size);

		expect(table.length).to.equal(size);
		expect(table[1].length).to.equal(size);
	});
});

describe('Function "eachSegmentField"', function () {
	var segmentHorizontal = {
		x: 1, y: 2, size: 2,
		orientation: board.ORIENTATION.HORIZONTAL
	}, segmentVertical = {
		x: 1, y: 2, size: 2,
		orientation: board.ORIENTATION.VERTICAL
	};

	it('should execute function on each field position on horizontal segment', function () {
		var spy = sinon.spy();

		board.eachSegmentField(segmentHorizontal, spy);

		expect(spy.firstCall.calledWithExactly(1, 2)).to.be.true;
		expect(spy.secondCall.calledWithExactly(2, 2)).to.be.true;
	});

	it('should execute function on each field position on vertical segment', function () {
		var spy = sinon.spy();

		board.eachSegmentField(segmentVertical, spy);

		expect(spy.firstCall.calledWithExactly(1, 2)).to.be.true;
		expect(spy.secondCall.calledWithExactly(1, 3)).to.be.true;
	});

	it('should terminate executing callback when one returns false', function () {
		var spy = sinon.spy(function () {
			return false;
		});

		board.eachSegmentField(segmentVertical, spy);
		expect(spy.calledOnce).to.be.true;
		expect(spy.firstCall.calledWithExactly(1, 2)).to.be.true;
	});
});

module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jscs: {
			src: [
				'app.js',
				'src/*.js',
				'test/*.js'
			],
			options: {
				config: '.jscsrc'
			}
		}
	});

	grunt.loadNpmTasks('grunt-jscs');

	grunt.registerTask('codestyle', ['jscs']);

};

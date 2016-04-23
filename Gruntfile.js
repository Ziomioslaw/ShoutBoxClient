module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        server: grunt.file.readJSON('server.json'),
        concat: {
            js: {
                src: ['src/javascript/core.js', 'src/javascript/**/*.js'],
                dest: 'build/shoutbox.js'
            },
            sass: {
                src: ['src/styles/*.sass'],
                dest: 'build/shoutbox.sass'
            }
        },
        sass: {
            options: {
                style: 'compressed',
                sourcemap: 'none',
                trace: true,
                noCache: true
            },
            build: {
                files: {
                    'build/shoutbox.min.css' : 'build/shoutbox.sass'
                }
            }
        },
        clean: [ 'build/*' ],
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/shoutbox.js',
                dest: 'build/shoutbox.min.js'
            }
        },
        scp: {
            options: {
                host: '<%= server.host %>',
                username: '<%= server.username %>',
                password: '<%= server.password %>'
            },
            upload: {
                files: [{
                    cwd: 'build',
                    src: ['*.js', '*.css'],
                    filter: 'isFile',
                    dest: '<%= server.path %>'
                }]
            },
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-scp');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'concat', 'sass', 'uglify', 'scp']);
};

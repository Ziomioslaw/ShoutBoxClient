module.exports = function(grunt) {
    var basics = null;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        server: grunt.file.readJSON('server.json'),
        concat: {
            js: {
                options: {
                    banner: "var ShoutBox = ShoutBox || {};\n(function(context, $) {\n'use strict';\n",
                    footer: '})(ShoutBox, jQuery);'
                },
                src: ['src/javascript/core/**/*.js', 'src/javascript/**/*.js'],
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
        copy: {
            build: {
                expand: true,
                cwd: 'src/styles/',
                src: 'fonts/**',
                dest: 'build/'
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
                    src: ['*.js', '*.css', 'fonts/*'],
                    dest: '<%= server.path %>'
                }]
            },
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                laxbreak: true,
                globals: {
                    jQuery: true,
                    getXMLDocument: true
                },
            },
            afterconcat: ['build/shoutbox.js']
        },
        gitinfo: {},
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'GIT_SHORT_SHA',
                            replacement: '<%= gitinfo.local.branch.current.shortSHA %>'
                        }
                    ]
                },
                files: [
                    { src: ['build/shoutbox.js'], dest: 'build/shoutbox.js' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-scp');
    grunt.loadNpmTasks('grunt-gitinfo');
    grunt.loadNpmTasks('grunt-replace');

    basics = [ 'gitinfo', 'clean', 'concat', 'sass', 'uglify', 'jshint', 'replace' ];

    // Default task(s).
    grunt.registerTask('default', basics);
    grunt.registerTask('devUpload', basics.concat(['scp']));
    grunt.registerTask('devUploadWithFonts', basics.concat(['copy', 'scp']));
};

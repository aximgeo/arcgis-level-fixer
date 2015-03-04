module.exports = function(grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', 'test');
    grunt.registerTask('test', ['jshint','jasmine_node']);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-lineending');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-git-describe');

    grunt.registerTask("build", [
        'clean:archive',
        'saveRevision',
        'uglify',
        'copy',
        'lineending',
        'compress:archive'
    ]);

    var gitRevision = 'asdf';
    grunt.registerTask('saveRevision', function() {
        grunt.event.once('git-describe', function (rev) {
            grunt.log.writeln("Git Revision: " + rev);
            gitRevision = rev;
            grunt.config.set('uglify.options.banner', '/*!\nArcGIS Level Fixer v' + gitRevision + '\nCopyright 2014 Geographic Information Services, Inc \n' +
                'ALF uses third-party libraries which remain the property of their respective authors.\n*/\n\n');
        });
        grunt.task.run('git-describe');
    });

    grunt.initConfig({
        jasmine_node: {
            forceExit: true,
            match: '.',
            matchall: false,
            extensions: 'js',
            specNameMatcher: 'unit',
            projectRoot: ".",
            files: ['src/**/*.unit.js'],
            all: ['src/**/*.unit.js']
        },

        jshint: {
            options: {
                "curly": true,
                "eqnull": true,
                "eqeqeq": true,
                "undef": true,
                "unused" : true,
                "strict" : true,
                "node":true,
                "globals": {
                    /* JASMINE */
                    jasmine:false,
                    spyOn:false,
                    describe:false,
                    it:false,
                    waitsFor:false,
                    waits:false,
                    runs:false,
                    expect:false,
                    beforeEach:false,
                    afterEach:false
                }
            },
            all: ['gruntFile.js', 'index.js', 'src/**/*.js']
        },

        watch: {
            scripts: {
                files: [
                    '**/*.js'
                ],
                tasks: ['test'],
                options: {
                    spawn: true
                }
            }
        },

        build: 'arcgis-level-fixer-build',

        'git-describe': {
            "options": {
                gitRevision:"0.0.0"
            },
            "getVersion": {
                // Target-specific file lists and/or options go here.
            }
        },

        clean: {
            archive: ['arcgis-level-fixer-build*.zip', 'arcgis-level-fixer-build/**']
        },

        //Uglify the javascript code into single file
        uglify: {
            "options": {
                "banner":""
            },
            app: {
                options: {
                    mangle: false,
                    preserveComments: false,
                    compress: false,
                    beautify: true
                },
                files: {
                    '<%= build %>/app.js': ['index.js'],
                }
            },
            source: {
                options: {
                    mangle: false,
                    preserveComments: false,
                    compress: false,
                    beautify: true
                },
                files: grunt.file.expandMapping([
                    'src/**/*.js',
                    '!src/**/*.integration-spec.js',
                    '!src/**/*.unit.js'
                ], '<%= build %>/')
            }
        },

        copy: {
            certs: {
                src : '**',
                dest: '<%= build %>/certs/',
                expand: true,
                cwd:'certs'
            },
            images: {
                src : '**',
                dest: '<%= build %>/images/',
                expand: true,
                cwd:'images'
            },
            html: {
                src : 'index.html',
                dest: '<%= build %>/index.html'
            },
            config: {
                src : 'config.json',
                dest: '<%= build %>/config.json'
            },
            package: {
                src : 'package.json',
                dest: '<%= build %>/package.json'
            }
        },

        lineending: {
            release: {
                dist: {
                    options: {
                        overwrite: true
                    },
                    files: {
                        '': ['<%= build %>/*']
                    }
                }
            }
        },

        compress: {
            archive: {
                options: {
                    mode: 'zip',
                    archive: function(){
                        return grunt.config.get('build')+'-'+gitRevision+'.zip';
                    }
                },
                files: [
                    {expand: true, cwd: '<%= build %>/', src: ['**'], dest: ''}
                ]
            }
        }
    });
};

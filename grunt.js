/*global module:false*/
module.exports = function (grunt) {
    var
        fs = require("fs"),
        path = require("path"),
        request = require("request"),
        util = require("util"),
        inspect = util.inspect,
        rimraf = require("rimraf");

    // Project configuration.
    grunt.initConfig({
        pkg:'<json:package.json>',
        meta:{
            banner:'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        concat:{
            dist:{
                src:['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
                dest:'dist/<%= pkg.name %>.js'
            }
        },
        min:{
            dist:{
                src:['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest:'dist/<%= pkg.name %>.min.js'
            }
        },
        qunit:{
            files:['test/**/*.html']
        },
        lint:{
//            files:['grunt.js', 'src/**/*.js', 'test/**/*.js']
            files:['src/**/*.js', 'test/**/*.js']
        },
        recess: {
            dist: {
                src: [
                    'themes/**/*.css'
                ],
                dest: 'dist/jquery.monthpicker.min.css',
                options: {
                    compile: true,
                    compress: true
                }
            }
        },
        watch:{
            files:'<config:lint.files>',
            tasks:'lint qunit'
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                boss:true,
                eqnull:true,
                browser:true
            },
            globals:{
                jQuery:true
            }
        },
        uglify:{}
    });
    grunt.loadNpmTasks('grunt-recess');

    // Default task.
    grunt.registerTask('default', 'lint qunit concat recess min');

    grunt.registerTask("clean", function () {
//        var rimraf = require("rimraf");
        rimraf.sync("dist");
    });
};

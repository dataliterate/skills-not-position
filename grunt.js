/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-reload');
  grunt.loadNpmTasks('grunt-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-jslint');

  // Project configuration.
  grunt.initConfig({
    jslint: {
      files: ['app/**/*.js'],
      directives: {
        browser: true,
        unparam: true,
        indent: 2,
        white: true,
        nomen: true,
        sloppy: true,
        vars: true,
        plusplus: true,
        predef: [ // array of pre-defined globals
          'require', 'module', 'Modernizr'
        ]
      },
      options: {
      }
    },
    copy: {
      main: {
        files: [
          {src: ['svgs/stack/stack.svg'], dest: 'public/assets/stack.svg', filter: 'isFile'} // includes files in path
        ]
      }
    },
    less: {
      all: {
        src: '*.less',
        dest: 'public/styles.css',
        options: {
          compress: true
        }
      }
    },
    concat: {
      lib: {
        src: ['lib/fixsvgstack.jquery.js', 'lib/html5slider.js', 'lib/keyboard.js', 'lib/modernizr.js', 'lib/tipsy.js'],
        dest: 'public/lib.js'
      },
      css: {
        src: ['public/styles.css', 'lib/tipsy.css'],
        dest: 'public/styles.css'
      }
    },
    browserify: {
      './public/app.js': {
        entries: ['./app/app.js'],
        aliases : ['jquery:jquery-browserify'] 
      }
    },
    mincss: {
      compress: {
        files: {
          "public/styles.min.css": ["public/styles.css"]
        }
      }
    },
    min: {
        'dist': {
            'src': ['public/app.js', 'public/lib.js'],
            'dest': 'public/position-finder.min.js'
        }
    },
    reload: {
      port: 35729, // LR default
      liveReload: {}
    },
    watch:{
      files:['app/**/*'],
      tasks:['build']
    },
    all: ['app/**/*.js']
  });

  // Default task.
  grunt.registerTask('default', 'lint jshint concat min');
  grunt.registerTask('build', 'browserify less concat copy mincss min');

};

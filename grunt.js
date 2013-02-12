/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-reload');
  grunt.loadNpmTasks('grunt-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-mincss');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-replace');

  // Project configuration.
  grunt.initConfig({
    settings: grunt.file.readJSON('settings.json'),
    replace: {
      dist: {
        // next time: real template system for HTML
        options: {
          variables: {
            'title-->': '<%= settings.title %>',
            'longtitle-->': '<%= settings.longtitle %>',
            'google-tracking-->': grunt.file.read("templates/custom/google-tracking.tmpl"),
            'join-us-->': grunt.file.read("templates/custom/join-us.tmpl"),
            'share-twitter-->': grunt.file.read("templates/custom/share-twitter.tmpl"),
            'share-facebook-->': grunt.file.read("templates/custom/share-facebook.tmpl")
          },
          prefix: '<!--@@'
        },
        files: {
          'public/index.html': ['public/index.html']
        }
      }
    },
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
          {src: ['svgs/stack/stack.svg'], dest: 'public/assets/stack.svg', filter: 'isFile'},
          {src: ['templates/index.html'], dest: 'public/index.html', filter: 'isFile'}
        ]
      }
    },
    less: {
      all: {
        src: 'less/*.less',
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
      liveReload: {},
      xproxy: {
        host: '10.42.30.30:8000'
      }
    },
    watch:{
      files:['lib/*', 'app/**/*', './styles.less'],
      tasks:['build']
    },
    all: ['app/**/*.js']
  });

  // Default task.
  grunt.registerTask('default', 'lint jshint concat min');
  grunt.registerTask('build', 'browserify less concat copy replace reload mincss min');
  grunt.registerTask('build:dev', 'browserify less concat copy replace');
  grunt.registerTask('build:template', 'copy replace');
};

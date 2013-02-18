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
  grunt.loadNpmTasks('grunt-clean');

  // Project configuration.
  grunt.initConfig({
    settings: grunt.file.readJSON('settings.json'),
    clean: {
      tmp: "tmp",
      production: "build/production",
      development: "build/dev"
    },
    replace: {
      // next time: real template system for HTML
      // (this is ugly by history :)
      production: {
        options: {
          variables: {
            'title-->': '<%= settings.title %>',
            'head-->': grunt.file.read("templates/common/production-head.tmpl"),
            'livereload-->': '',
            'longtitle-->': '<%= settings.longtitle %>',
            'google-tracking-->': grunt.file.read("templates/custom/google-tracking.tmpl"),
            'join-us-->': grunt.file.read("templates/custom/join-us.tmpl"),
            'do-not-join-us-->': grunt.file.read("templates/custom/do-not-join-us.tmpl"),
            'share-twitter-->': grunt.file.read("templates/custom/share-twitter.tmpl"),
            'share-facebook-->': grunt.file.read("templates/custom/share-facebook.tmpl")
          },
          prefix: '<!--@@'
        },
        files: {
          'build/production/index.html': ['build/production/index.html']
        }
      },
      development: {
        // next time: real template system for HTML
        options: {
          variables: {
            'title-->': '<%= settings.title %>',
            'head-->': grunt.file.read("templates/common/dev-head.tmpl"),
            'livereload-->': grunt.file.read("templates/common/dev-livereload.tmpl"),
            'longtitle-->': '<%= settings.longtitle %>',
            'google-tracking-->': '',
            'join-us-->': grunt.file.read("templates/custom/join-us.tmpl"),
            'do-not-join-us-->': grunt.file.read("templates/custom/do-not-join-us.tmpl"),
            'share-twitter-->': grunt.file.read("templates/custom/share-twitter.tmpl"),
            'share-facebook-->': grunt.file.read("templates/custom/share-facebook.tmpl")
          },
          prefix: '<!--@@'
        },
        files: {
          'build/development/index.html': ['build/development/index.html']
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
          'require', 'module', 'Modernizr', '_gaq'
        ]
      },
      options: {
      }
    },
    copy: {
      production: {
        files: [
          {src: ['svgs/stack/stack.svg'], dest: 'build/production/assets/stack.svg', filter: 'isFile'},
          {src: ['svgs/stack/stack.svg'], dest: 'build/production/assets/stack.svg', filter: 'isFile'},
          {src: ['templates/index.html'], dest: 'build/production/index.html', filter: 'isFile'},
          {src: ['public/*'], dest: 'build/production/'},
          {src: ['tmp/position-finder.min.js'], dest: 'build/production/position-finder.min.js'},
          {src: ['tmp/styles.min.css'], dest: 'build/production/styles.min.css'}
        ]
      },
      development: {
        files: [
          {src: ['svgs/stack/stack.svg'], dest: 'build/development/assets/stack.svg', filter: 'isFile'},
          {src: ['svgs/stack/stack.svg'], dest: 'build/development/assets/stack.svg', filter: 'isFile'},
          {src: ['templates/index.html'], dest: 'build/development/index.html', filter: 'isFile'},
          {src: ['public/*'], dest: 'build/development/'},
          {src: ['tmp/*.js'], dest: 'build/development/'},
          {src: ['tmp/*.css'], dest: 'build/development/'}
        ]
      }
    },
    less: {
      all: {
        src: 'less/*.less',
        dest: 'tmp/styles.css',
        options: {
          compress: true
        }
      }
    },
    concat: {
      lib: {
        src: ['lib/fixsvgstack.jquery.js', 'lib/html5slider.js', 'lib/keyboard.js', 'lib/modernizr.js', 'lib/tipsy.js'],
        dest: 'tmp/lib.js'
      },
      css: {
        src: ['tmp/styles.css', 'lib/tipsy.css'],
        dest: 'tmp/styles.css'
      }
    },
    browserify: {
      'tmp/app.js': {
        entries: ['./app/app.js'],
        aliases : ['jquery:jquery-browserify'] 
      }
    },
    mincss: {
      compress: {
        files: {
          "tmp/styles.min.css": ["tmp/styles.css"]
        }
      }
    },
    min: {
      'dist': {
        'src': ['tmp/app.js', 'tmp/lib.js'],
        'dest': 'tmp/position-finder.min.js'
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
      files:['lib/*', 'app/**/*', 'less/**/*', 'templates/**/*'],
      tasks:['build:dev', 'reload']
    },
    all: ['app/**/*.js']
  });

  // Default task.
  grunt.registerTask('default', 'build');
  grunt.registerTask('build', 'jslint clean:production browserify less concat mincss min copy:production replace:production clean:tmp');
  //grunt.registerTask('build:dev', 'clean:development browserify less concat copy:development replace:development clean:tmp');
  grunt.registerTask('build:dev', 'browserify less concat copy:development replace:development clean:tmp');
  grunt.registerTask('build:template', 'copy:production replace:production');
  
};

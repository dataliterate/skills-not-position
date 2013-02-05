/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-reload');
  grunt.loadNpmTasks('grunt-less');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'app.js']
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
    jshint: {
      options: {
        browser: true
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
  grunt.registerTask('build', 'browserify less concat copy');

};

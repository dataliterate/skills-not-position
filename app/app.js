var _ =  require('underscore')
  , Backbone =  require('backbone')
  , $ = require('jquery-browserify')
  //, Settings = require('./settings')
  ;

Backbone.$ = $;
window.r = require; // Expose require, for console debugging
var App = function() {
  this.initialize.apply(this, arguments);
}

_.extend(App.prototype, {
  version: 0.1,
  router: false,
  initialize: function(options) {
    require('./router');
    Backbone.history.start();
  }
});

$(function() {

  Modernizr.addTest('inputspeech', function() {
      return !(document.createElement("input").webkitSpeech === undefined)
  });
  Modernizr.addTest('svganchors', function() {
    // cheating:
    return !(/WebKit/.test(navigator.userAgent))
  });

  window.PositionFinder = module.exports = new App();
});
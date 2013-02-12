var _ = require('underscore')
  ;

var Settings = function() {
  this.initialize.apply(this, arguments);
};

_.extend(Settings.prototype, {
  N_STATEMENTS: 2,
  SETUP: (window.location.search.indexOf('setup') !== -1),
  TRACK: (true && window._gaq),
  initialize: function() {
    
  }
});

var SingletonSettings = new Settings();
module.exports = SingletonSettings;
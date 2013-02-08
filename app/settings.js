var _ = require('underscore')
  ;

var Settings = function() {
  this.initialize.apply(this, arguments);
};

_.extend(Settings.prototype, {
  N_STATEMENTS: 10,
  initialize: function() {
    
  }
});

var SingletonSettings = new Settings();
module.exports = SingletonSettings;
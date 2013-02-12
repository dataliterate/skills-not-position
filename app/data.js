var _ = require('underscore')
  ;

var Data = function() {
  this.initialize.apply(this, arguments);
};

_.extend(Data.prototype, {
  initialize: function() {
    if(!window.PositionFinderData) {
      window.console.error("Could not find PositionFinderData");
    }
  },
  words: function() {
    if(window.PositionFinderData.words) {
      return window.PositionFinderData.words;
    }
    window.console.error("Could not find PositionFinderData.words");
  },
  skills: function() {
    if(window.PositionFinderData.skills) {
      return window.PositionFinderData.skills;
    }
    window.console.error("Could not find PositionFinderData.skills");
  }
});

var SingletonData = new Data();
module.exports = SingletonData;
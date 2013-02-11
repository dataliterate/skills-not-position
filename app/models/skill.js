var _ =  require('underscore')
  , Backbone = require('backbone')

  , Skill
  ;

module.exports = Skill = Backbone.Model.extend({
    defaults: {
      'title': '',
      'score': 50,
      'completed': false,
      'quantifiers': []
    },
    test: function() {
    }
  });
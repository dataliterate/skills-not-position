var _ =  require('underscore')
  , Backbone = require('backbone')

  , Word
  ;

module.exports = Word = Backbone.Model.extend({
  defaults: {
    'title': '',
    'group': '',
    'score': 0,
    'n': 0,
    'orderScore': 0
  },
  addToScore: function(score) {
    this.set({'score': this.get('score') + score, 'n': this.get('n') + 1});
  },
  getAvgScore: function() {
    return this.get('score') / this.get('n');
  }
});
var _ =  require('underscore')
  , Backbone = require('backbone')
  , Settings = require('../settings')
  , Word = require('../models/word')
  ;

var Words = Backbone.Collection.extend({
  addWordsToGroup: function(titles, group) {
    _.each(titles, _.bind(function(title) {
      this.add(new Word({title: title, group: group}));
    }, this));
  },
  getByTitle: function(title) {
    return this.filter(function(model) {
      return (model.get('title').toLowerCase() == title.toLowerCase());
    });
  },
  getWordsByGroup: function() {
    return this.groupBy(function(word) {
      return word.get('group');
    });
  },
  getGroups: function() {
    return _.map(this.getWordsByGroup(), function(x, k) {return k});
  },
  getWordsInGroup: function(group) {
    var words = this.getWordsByGroup()[group];
    console.log("GROUP");
    var sortedWords = _.sortBy(words, function(word) {
      //return -1 * (word.get('score') / word.get('n'));
      var orderScore = (word.get('score') / Settings.N_STATEMENTS);
      var orderScore = (word.get('score') / word.get('n'));
      if(word.get('n') == 0) {
        orderScore = -1000;
      }
      
      //orderScore = word.get('score');
      console.log(word.get('title') + ' ' + orderScore + ' -- ' + (word.get('score') / word.get('n')) + ' ' + word.get('score') + ' ' + word.get('n'));
      word.set({orderScore: orderScore});
      return -1 * orderScore;
    });
    console.log(sortedWords);
    return sortedWords;
  }
});

var AppWords = new Words();

/**
Attitudes:
  Enthusiastic, Motivated, Open-minded, Critical
  Innovating, Refelcted
Level:
  Senior-level, Junior-level, Experienced, Lead, Head of
Field:
  UX, UI, IxD, Visual, Frontend, Product, Multiscreen
Title:
  Architect, Evanglist
*/
AppWords.addWordsToGroup('Enthusiastic, Motivated, Open-minded, Critical, Innovative, Reflecting, Technology-Loving'.split(', '), 'attitude');
AppWords.addWordsToGroup('Senior-level, Experienced, Lead, Head of'.split(', '), 'level');
AppWords.addWordsToGroup('UX, UI, IxD, Visual, Frontend, Digital Product, Multiscreen'.split(', '), 'field');
AppWords.addWordsToGroup('Design Architect, Design Evanglist, Designer, Creative Coder, Design Engineer'.split(', '), 'title');

module.exports = AppWords;
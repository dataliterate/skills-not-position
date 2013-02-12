var _ =  require('underscore')
  , Backbone = require('backbone')
  , AppWords = require('./app_words')
  , data = require('../data').skills()
  ;

var Skills = Backbone.Collection.extend({
  doExport: function() {
    var e = '[';
    this.each(function(skill) {
      e += "{\n";
      e += "  title: '" + skill.get('title').replace(/'/g, "\\'") + "',\n";
      e += "  quantifiers: {\n";
      _.each(skill.get('quantifiers'), function(q) {
        e += "    '" + q[0].get('title').replace(/'/g, "\\'") + "': " + q[1] + ",\n";
      });
      e = e.substr(0, e.length - 2) + "\n";
      e += "  }\n";
      e += "},\n";
    });
    e = e.substr(0, e.length - 2) + "\n";
    e += ']';
    return e;
  },
  getScores: function() {
    var e = '';
    this.each(function(skill) {
      if(!skill.get('completed')) {
        return;
      }
      e += '    (' + skill.get('score') + '/100) ' + skill.get('title') + "\n";
    });
    return e;
  }
});

function w(title, quotient) {
  if(!AppWords.getByTitle(title).length) {
    return false;
  }
  return [AppWords.getByTitle(title)[0], quotient];
}

var skills = [];
_.each(data, function(skillData) {

  var skill = {};
  skill.title = skillData.title;
  skill.quantifiers = [];
  _.each(skillData.quantifiers, function(value, word) {
    var resolved = w(word, value);
    if(resolved !== false) {
      skill.quantifiers.push(w(word, value));
    }
  });
  skills.push(skill);
});

module.exports = Skills = new Skills(_.shuffle(skills));
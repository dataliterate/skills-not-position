var _ =  require('underscore')
  , Backbone = require('backbone')
  , Settings = require('../settings')
  , AppWords = require('../collections/app_words')
  , AppSkills = require('../collections/app_skills')

  , Session
  ;

module.exports = Session = Backbone.Model.extend({
  defaults: {
    'skillPos': 0,
    'analysed': false
  },
  words: AppWords,
  skills: AppSkills,
  nStatements: Settings.N_STATEMENTS,
  currentSkill: function() {
    return this.skills.at(this.get('skillPos'));
  },
  hasNext: function() {
    if(this.get('skillPos') + 1 < this.nStatements) {
      return true;
    }
    return false;
  },
  next: function() {
    //this.set('skillPos', this.get('skillPos') + 1);
  },
  getPosition: function() {
    /**
    * analysis
    * - group
    * -- word, score
    * -- word, score
    */
    
    var exception = false;
    var min = 100;
    var max = 0;
    var sum = 0;
    var n = 0;
    var avg = 0;
    var absoluteAvg = 0;
    if(!this.get('analysed')) {

      // getting range
      this.skills.each(function(skill) {
        if(!skill.get('completed')) {
          return;
        }
        var score = skill.get('score');
        min = Math.min(min, score);
        max = Math.max(max, score);
        sum += score;
        n++;
      });

      avg = sum / n;
      absoluteAvg = (avg - min) / (max - min) * 100;
      /*
      console.log("\n");
      console.log("\n");
      console.log("--- - ----- ---- - - --- - ----- -- ");
      console.log(min);
      console.log(max);
      console.log(avg);
      console.log(absoluteAvg);
      console.log("--- - ----- ---- - - --- - ----- -- ");
      console.log("\n");
      console.log("\n");
      */
      if(min === max && avg === 50) {
        exception = 'avg';
      }
      if(min === max && avg === 100) {
        exception = '100';
      }
      if(min === max && avg === 0) {
        exception = '0';
      }

      this.skills.each(function(skill) {
        var userScore = skill.get('score');
        if(!skill.get('completed')) {
          return;
        }
        if(_.isUndefined(userScore)) {
          userScore = 0;
        }

        var absoluteScore = (userScore - min) / (max - min) * 100;

        var score = absoluteScore - absoluteAvg;
        userScore -= 40;
        _.each(skill.get('quantifiers'), function(wordFactor) {
          // wordFactor: [wordModel, quantifier]
          wordFactor[0].addToScore(score * wordFactor[1]);
        });
      });
      this.set({analysed: true});
    }

    if(exception !== false) {
      switch(exception) {
        case 'avg':
          return 'Average Designer';
        case '100':
          return '100% Designer';
        case '0':
          return 'No-Design Designer';
      }
    }

    var groups = this.words.getGroups();
    var grouped = {};
    var groupRanges = {};
    _.each(groups, function(group) {
      
      var words = AppWords.getWordsInGroup(group);
      grouped[group] = words;
      var min = _.min(words, function(w) { return w.get('orderScore');});
      var max = _.max(words, function(w) { return w.get('orderScore');});
      /*
      console.log("\n");
      console.log("\n");
      console.log(group);
      console.log(min.get('orderScore') + " " + max.get('orderScore') + " " + Math.abs(max.get('orderScore') - min.get('orderScore')));
      */
      groupRanges[group] = {min: min.get('orderScore'), max: max.get('orderScore'), range: Math.abs(max.get('orderScore') - min.get('orderScore'))};
      
    });

    /**
    grammar
    --
    Attitude [, Attitude] Level Field [Field] [Title] Designer
    */
    var title = grouped.attitude[0].get('title');
    if(grouped.attitude[0].get('orderScore') - grouped.attitude[1].get('orderScore') < groupRanges.attitude.range / 10) {
      title += ', ' + grouped.attitude[1].get('title');
    }
    title += ' ' + _.first(grouped.level).get('title');
    title += ' ' + grouped.field[0].get('title');
    if(grouped.field[0].get('orderScore') - grouped.field[1].get('orderScore') < groupRanges.field.range / 10) {
      title += ' & ' + grouped.field[1].get('title');
    }
    title += ' ' + _.first(grouped.title).get('title');
    return title;

  }
});
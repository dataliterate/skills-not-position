var init = function init() {
  var SKILL_N_STATEMENTS = 2;
  var app = window.app = app || {};
  var Router = Backbone.Router.extend({
    routes:{
      'statement/:n': 'statement',
      'position': 'position',
      '': 'default'
    },
    default: function() {
      this.startSession();
    },
    statement: function(i) {
      if(false && !this.hasSession()) {
        this.navigate('');
        return;
      }
      this.startSession();
      i = parseInt(i, 10) - 1;
      if(!_.isNumber(i) || i > app.AppSession.nStatements) {
        return;
      }
      app.AppSession.set({'skillPos': i, 'analysed': false});
    },
    position: function() {
      if(false && !this.hasSession()) {
        this.navigate('');
        return;
      }
      this.startSession();
      app.AppMainView.showPosition();
    },
    startSession: function() {
      if(!this.hasSession()) {
        app.AppSession = new app.Session();
        app.AppSession.skills = app.AppSkills;
        app.AppSession.words = app.AppWords;
        app.AppMainView = new app.MainView({model: app.AppSession});
        app.AppMainView.render();
        this.navigate('statement/' + 1, {trigger: true});
      }
    },
    hasSession: function() {
      return app.AppSession;
    },
    gotoNextQuestion: function() {
      var skillPos = app.AppSession.get('skillPos');
      this.navigate('statement/' + (skillPos + 2), {trigger: true});
    },
    gotoPosition: function() {
      this.navigate('position', {trigger: true});
    }
  });

  app.AppRouter = new Router();
  app.Skill = Backbone.Model.extend({
    defaults: {
      'title': '',
      'score': 50,
      'completed': false,
      'quantifiers': []
    },
    test: function() {
    },
    doExport: function() {
      /**
      for setup:
      {
        title: 'You are an experienced (4+) visual designer',
        quantifiers: [
          w('experienced', 10),
          w('visual', 10),
          w('designer', 10)
        ]
      },
      */
      var e = '';
      e += "{\n";
      e += "  title:'" + this.get('title') + "'\n";
      e += "  quantifiers: [\n";
      _.each(this.get('quantifiers'), function(q) {
        e += "    w('" + q[0].get('title') + "', " + q[1] + "),\n";
      });
      e += "  ]\n";
      e += "}\n";
      return e;
    }
  });
  app.Session = Backbone.Model.extend({
    defaults: {
      'skillPos': 0,
      'analysed': false
    },
    words: null,
    skills: null,
    nStatements: SKILL_N_STATEMENTS,
    hasNext: function() {
      if(this.get('skillPos') + 1 < this.nStatements) {
        return true;
      }
      return false;
    },
    next: function() {
      this.set('skillPos', this.get('skillPos') + 1);
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
        app.AppSkills.each(function(skill) {
          console.log(skill);
          if(!skill.get('completed')) {
            return;
          }
          var score = skill.get('score');
          console.log(" X X X");
          min = Math.min(min, score);
          max = Math.max(max, score);
          sum += score;
          n++;
        });

        avg = sum / n;
        absoluteAvg = (avg - min) / (max - min) * 100;
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

        if(min == max && avg == 50) {
          exception = 'avg';
        }
        if(min == max && avg == 100) {
          exception = '100';
        }
        if(min == max && avg == 0) {
          exception = '0';
        }

        app.AppSkills.each(function(skill) {
          var userScore = skill.get('score');
          if(!skill.get('completed')) {
            return;
          }
          if(_.isUndefined(userScore)) {
            userScore = 0;
          }
          console.log("\n");
          console.log(skill.get('title'));
          console.log(userScore);

          var absoluteScore = (userScore - min) / (max - min) * 100;
          console.log(absoluteScore);

          console.log(absoluteScore - absoluteAvg);

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

      var groups = app.AppWords.getGroups();
      var grouped = {};
      var groupRanges = {};
      _.each(groups, function(group) {
        
        var words = app.AppWords.getWordsInGroup(group);
        grouped[group] = words;
        var min = _.min(words, function(w) { return w.get('orderScore')});
        var max = _.max(words, function(w) { return w.get('orderScore')});
        console.log("\n");
        console.log("\n");
        console.log(group);
        console.log(min.get('orderScore') + " " + max.get('orderScore') + " " + Math.abs(max.get('orderScore') - min.get('orderScore')));
        groupRanges[group] = {min: min.get('orderScore'), max: max.get('orderScore'), range: Math.abs(max.get('orderScore') - min.get('orderScore'))};
        
      });

      /**
      grammar
      --
      Attitude [, Attitude] Level Field [Field] [Title] Designer
      */
      var title = grouped['attitude'][0].get('title');
      if(grouped['attitude'][0].get('orderScore') - grouped['attitude'][1].get('orderScore') < groupRanges['attitude'].range / 10) {
        title += ', ' + grouped['attitude'][1].get('title');
      }
      title += ' ' + _.first(grouped['level']).get('title');
      title += ' ' + grouped['field'][0].get('title');
      if(grouped['field'][0].get('orderScore') - grouped['field'][1].get('orderScore') < groupRanges['field'].range / 10) {
        title += ' & ' + grouped['field'][1].get('title');
      }
      title += ' ' + _.first(grouped['title']).get('title');
      return title;

    }
  });
  app.Skills = Backbone.Collection.extend({
    currentSkill: function() {
      return this.at(app.AppSession.get('skillPos'));
    },
    doExport: function() {
      var e = '[';
      this.each(function(skill) {
        e += "{\n";
        e += "  title: '" + skill.get('title') + "',\n";
        e += "  quantifiers: [\n";
        _.each(skill.get('quantifiers'), function(q) {
          e += "    w('" + q[0].get('title') + "', " + q[1] + "),\n";
        });
        e = e.substr(0, e.length - 2) + "\n";
        e += "  ]\n";
        e += "},\n";
      });
      e = e.substr(0, e.length - 2) + "\n";
      e += ']';
      console.log(e);
    }
  });
  app.InputElement = Backbone.View.extend({
    $el: null,
    template: _.template($('#input-element-tmpl').html()),
    value: 0,
    initialize: function() {
      $('body').keydown(_.bind(this.onKeyDown, this));
    },
    render: function() {
      //this.$el = $('<div id="skill-input"></div>');

      this.$el.html(this.template());
      this.$el.find('#speechinput')[0].onwebkitspeechchange = _.bind(this.onSpeechChange, this);

      this.$el.find('#scorer').change(_.bind(this.onRangeChange, this));
      this.$el.find('#submit').click(_.bind(this.onSubmit, this));
      if(Modernizr.touch) {
        this.$el.find('#scorer').bind('touchstart', _.bind(this.onTouch, this));
        this.$el.find('#scorer').bind('touchmove', _.bind(this.onTouch, this));
      }
      //this.$el.find('#scorer').bind('click', _.bind(this.onTouch, this));
    },
    onTouch: function(e) {
      var $scorer = this.$el.find('#scorer');
      var touch = event.touches[0];
      var v = Math.round((touch.pageX - $scorer.offset().left) / $scorer.width() * 100);
      this.trigger('change', v);
    },
    onRangeChange: function(e) {
      var v = $(e.currentTarget).val();
      this.trigger('change', v);
    },
    onSubmit: function() {
      this.trigger('submit');
    },
    onSpeechChange: function(e) {
      $('#speechinput').removeClass('error');
      if(['weiter', 'enter'].indexOf($(e.currentTarget).val()) !== -1) {
        this.trigger('submit');
        return;
      }
      var num = null;
      if($(e.currentTarget).val().indexOf('hundert') !== -1 || $(e.currentTarget).val().indexOf('hundred') !== -1) {
        num = 100;
      } else {
        num = parseInt($(e.currentTarget).val(), 10);
      }
      if(!isNaN(num)) {
        this.trigger('change', num);
        $('#speechinput').blur();
      } else {
        $('#speechinput').addClass('error');
      }
    },
    eventLog: {},
    waitingForCompletion: 0,
    waitingForCompletionTimer: null,
    stopWaitingForCompletion: function() {
      window.clearTimeout(this.waitingForCompletionTimer);
      this.waitingForCompletion = 0;
      this.displayNumber();
    },
    onKeyDown: function(e) {
      var ENTER_KEY = 13;
      if(e.keyCode == ENTER_KEY) {
        this.trigger('submit');
        return;
      }

      // up, down, shift+up, shift+down
      var UP_KEY = 38;
      var DOWN_KEY = 40;
      var LEFT_KEY = 37;
      var RIGHT_KEY = 39;
      switch(e.keyCode) {
        case UP_KEY:
          this.manipulateScore(10);
          return;
        case DOWN_KEY:
          this.manipulateScore(-10);
          return;
        case LEFT_KEY:
          this.manipulateScore(-1);
          return;
        case RIGHT_KEY:
          this.manipulateScore(1);
          return;
      }

      // numeric input
      var num = null;
      if(!isNaN(String.fromCharCode(e.keyCode))) {
        num = parseInt(String.fromCharCode(e.keyCode));
      } else if(!isNaN(String.fromCharCode(e.keyCode - 48))) {
        num = parseInt(String.fromCharCode(e.keyCode - 48));
      }
      if(num === null) {
        return;
      }
      var score = num;
      // photoshop opacity layer style input
      if(this.waitingForCompletion) {
        if(this.value == 10 && this.waitingForCompletion == 2) {
          num = 100;
        } else {
          num = this.value + num;
        }
        if(num == 10) {
          console.log("WON HUNDETEDT");
          this.waitingForCompletionTimer = window.setTimeout(_.bind(this.stopWaitingForCompletion, this), 900);
          this.waitingForCompletion = 2;
          this.displayNumber();
        } else {
          this.stopWaitingForCompletion();
        }
      } else {
        num = num * 10;
        this.waitingForCompletionTimer = window.setTimeout(_.bind(this.stopWaitingForCompletion, this), 900);
        this.waitingForCompletion = 1;
      }

      this.trigger('change', num);
    },
    manipulateScore: function(score) {
      var currentScore = this.value;
      var newScore = currentScore + score;
      this.trigger('change', newScore);
    },
    displayNumber: function() {
      var h = '';
      if(this.waitingForCompletion == 1) {
        if(this.value == 0) {
          // special: change first char
          h += '<span class="changeable">' + String(this.value)[0] + '</span>';
        } else {
          h += String(this.value)[0];
          h += '<span class="changeable">' + String(this.value)[1] + '</span>';
        }
      } else if(this.waitingForCompletion == 2) {
        // special: allow hundred
        h += '10<span class="changeable">&nbsp;</span>';
      } else {
        h += '<span class="overwritable">' + String(this.value) + '</span>';
      }
      this.$el.find('#score').html(h);
    },
    set: function(v) {
      this.value = v;
      this.displayNumber();
      $('.indicator-wrapper').css('width', v + '%');
      this.$el.find('#scorer').val(v);
    }
  });
  app.MainView = Backbone.View.extend({
    el: '#app',
    appTemplate: _.template($('#app-tmpl').html()),
    resultTemplate: _.template($('#result-tmpl').html()),
    /*
    events: {
      'keypress #app': 'onKeyDown'
    },
    */
    skillView: null,
    inputElement: null,
    indicatorView: null,
    initialize: function() {
      this.$el = $(this.el);
      this.inputElement = new app.InputElement;
      this.indicatorView = new app.IndicatorView({model: this.model});
      this.listenTo(this.inputElement, 'submit', this.submitScore);
      this.listenTo(this.inputElement, 'change', this.changeScore);
      this.listenTo(this.model, 'change:skillPos', this.skillChange);
      
    },

    render: function() {
      this.$el.html(this.appTemplate());
      this.skillChange();
      this.indicatorView.$el = $('#indicator');
      this.indicatorView.render();
      this.inputElement.$el = $('#input');
      this.inputElement.render();

      $('#input-keyboard').mouseup(function() {
        $('#ios-keyboard').focus();
      });
      //this.setupView();
    },
    eventLog: {},
    changeScore: function(score) {
      if(score > 100) {
        score = 100;
      }
      if(score < 0) {
        score = 0;
      }
      app.AppSkills.currentSkill().set({score: parseInt(score, 10)});
    },
    manipulateScore: function(score) {
      var currentScore = app.AppSkills.currentSkill().get('score');
      if(!_.isNumber(currentScore)) {
        currentScore = 0;
      }
      this.changeScore(currentScore + score);
    },
    submitScore: function() {
      //if last skill saved
      app.AppSkills.currentSkill().set({completed: true});
      console.log(app.AppSkills.currentSkill());

      if(!this.model.hasNext()) {
        app.AppRouter.gotoPosition();
        return;
      }
      var pos = this.model.get('skillPos');
      app.AppRouter.gotoNextQuestion();
      //this.model.next();
    },
    onScoreChange: function() {
      var score = app.AppSkills.currentSkill().get('score');
      this.inputElement.set(score);
      $('#ios-keyboard').val();
    },
    skillChange: function() {
      this.statementLayout();

      var currentSkill = app.AppSkills.currentSkill();
      this.listenTo(currentSkill, 'change:score', this.onScoreChange);
      this.skillView = new app.SkillView({model: app.AppSkills.currentSkill()});
      this.skillView.$el = this.$el.find('#skill');
      this.skillView.render();

      //this.skillView.appendInput(this.inputElement.$el);

      // strange, default value sometimes is undefined: quick fix:
      var score = app.AppSkills.currentSkill().get('score');
      if(!score) {
        app.AppSkills.currentSkill().set({'score': 50});
      } else {
        app.AppSkills.currentSkill().trigger('change:score');
      }
    },
    changeRange: function(e) {
      var x = $(e.currentTarget).val();
      this.changeScore(x);
    },
    showPosition: function() {
      var position = this.model.getPosition();
      var html = this.resultTemplate({position: position});
      $('#position').html(html);
      this.positionLayout();

      $('button.twitter').click(function(e) {

        var text = "My #designposition: " + position;
        text += " http://bit.ly/design-positions";
        var url = "https://twitter.com/intent/tweet?text=" + escape(text);
        window.location.href = url;
        
      });

      $('button.facebook').click(function(e) {
        var text = "My #designposition: " + position;
        var url = "http://www.facebook.com/sharer/sharer.php?u=" + escape('http://bit.ly/design-positions') + "&t=" + escape(text);
        window.location.href = url;
      });
    },
    positionLayout: function() {
      $('body').addClass('position');
      $('header h1').html('My position');

      if(!Modernizr.svganchors) {
        $('header h1').fixSVGStackBackground();
        $('.sharing button').fixSVGStackBackground();
      }
    },
    statementLayout: function() {
      console.log("))");
      $('body').removeClass('position');
      $('header h1').html('Rate this statement');
      if(!Modernizr.svganchors) {
        $('header h1').fixSVGStackBackground();
      }
    },
    setupView: function() {
      this.setupView = new app.SetupView({model: this.model});
      this.setupView.$el = this.$el.find('#setup');
      this.setupView.render();
    }
  });
  app.SetupView = Backbone.View.extend({
    template: _.template($('#setup-tmpl').html()),
    views: [],
    initialize: function() {
      
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.model.skills.each(_.bind(function(skillModel) {
        var skillSetupView = new app.SetupSkillView({model: skillModel});
        this.views.push(skillSetupView);
        skillSetupView.render()
        this.$el.find('ul').append(skillSetupView.el);
      }, this));
      
    },
    updateScore: function() {
      this.$el.find('input').val(this.model.get('score'));
    }
  });
  app.SetupSkillView = Backbone.View.extend({
    template: _.template($('#setup-skill-tmpl').html()),
    events: {
      'change input': 'inputChange'
    },
    initialize: function() {
      
    },
    render: function() {
      this.$el = $('<li></li>');
      var data = this.model.toJSON();
      data.skillid = '';
      data.words = this.getWordsInterface();
      this.$el.html(this.template(data));
      this.el = this.$el;
      this.delegateEvents();
    },
    getWordsInterface: function() {
      console.log(this.model);
      // DUCK TAPE PROGRAMMING::
      var grouped = app.AppSession.words.getWordsByGroup();
      var html = '';
      var that = this;
      _.each(grouped, function(words, group) {
        html += '<div class="word-group"><h4>' + group + '</h4>';
        _.each(words, function(word) {
          var value = 0;
          value = that.getQuantifier(word);
          html += '<label>' + word.get('title') + '</label>';
          html += '<input name="' + word.get('title') + '" type="range" min="0" max="10" step="1" value="' + value + '"><br />';
        })
        html += '</div>';
      });
      return html;
    },
    getQuantifier: function(word) {
      var quantifiers = this.model.get('quantifiers');
      var v = 0;
      _.each(quantifiers, function(q) {
        if(q[0].get('title') == word.get('title')) {
          v = q[1];
        }
      });
      return v;
    },
    setQuantifier: function(word, score) {
      var quantifiers = this.model.get('quantifiers');
      var newQuantifiers = [];
      var v = 0;
      var set = false;
      _.each(quantifiers, function(q) {
        if(q[0].get('title') == word) {
          q[1] = score;
          set = true;
        }
        newQuantifiers.push([q[0], q[1]]);
      });
      if(!set) {
        newQuantifiers.push([app.AppWords.getByTitle(word)[0], score]);
      }
      this.model.set({'quantifiers': newQuantifiers});
    },
    inputChange: function(e) {
      var $input = $(e.currentTarget);
      var name = $input.attr('name');
      this.setQuantifier($input.attr('name'), $input.val());
    }
  });
  app.SkillView = Backbone.View.extend({
    template: _.template($('#skill-tmpl').html()),
    initialize: function() {
      //this.listenTo(this.model, "change:score", this.updateScore);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    },
    updateScore: function() {
      var score = this.model.get('score');
      //this.$el.find('#score').val(score);
      this.$el.find('#scorer').val(score);
      this.$el.find('.indicator-wrapper').css('width', score + '%');
      //var style = $('<style>#scorer::-webkit-slider-thumb { width: ' + score + '%; margin-left: ' + (- score / 2 - score / 4 - score / 8) + '% }</style>');
      //$('#xtrastyle').remove();
    },
    appendInput: function($el) {
      this.$el.find('.skill').append($el);
    }
  });
  app.IndicatorView = Backbone.View.extend({
    //template: _.template($('#skill-tmpl').html()),
    initialize: function() {
      this.listenTo(this.model, "change:skillPos", this.onSkillPosChanged);
    },
    render: function() {
      var h = '<ul>';
      var currentPos = this.model.get('skillPos');
      for(var i = 0; i < this.model.nStatements; i++) {
        if(i == currentPos) {
          h += '<li class="active"><span href="#" data-target="' + (i + 1) + '">' + (i + 1) + '</span></li>';
        } else if(this.model.skills.at(i).get('completed')) {
          h += '<li><a href="#statement/' + (i + 1) + '" data-target="' + (i + 1) + '">' + (i + 1) + '</a></li>';
        } else {
          h += '<li><span>' + (i + 1) + '</span></li>';
        }
        
      }
      h += '</ul>';
      this.$el.html(h);
      this.$el.find('a').click(_.bind(this.gotoPos, this));
    },
    onSkillPosChanged: function() {
      this.render();
    },
    skillPos: function() {
      var i = this.model.get('skillPos');
      this.$el.find('li').get(i).removeClass();
      this.$el.find('li').get(i).addClass('active');
    },
    gotoPos: function() {

    }
  });

  /**
  grammar
  --
  Attitude Level [, Level] Field [Field] [Title] Designer
  */
  app.Word = Backbone.Model.extend({
    defaults: {
      'title': '',
      'group': '',
      'score': 0,
      'n': 0,
      'orderScore': 0
    },
    addToScore: function(score) {
      console.log("Adding Score " + this.get('title') + " : " + score);
      this.set({'score': this.get('score') + score, 'n': this.get('n') + 1});
    },
    getAvgScore: function() {
      return this.get('score') / this.get('n');
    }
  });
  app.Words = Backbone.Collection.extend({
    addWordsToGroup: function(titles, group) {
      _.each(titles, _.bind(function(title) {
        this.add(new app.Word({title: title, group: group}));
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
        var orderScore = (word.get('score') / SKILL_N_STATEMENTS);
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
  app.AppWords = new app.Words();

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
  app.AppWords.addWordsToGroup('Enthusiastic, Motivated, Open-minded, Critical, Innovative, Reflecting, Technology-Loving'.split(', '), 'attitude');
  app.AppWords.addWordsToGroup('Senior-level, Experienced, Lead, Head of'.split(', '), 'level');
  app.AppWords.addWordsToGroup('UX, UI, IxD, Visual, Frontend, Digital Product, Multiscreen'.split(', '), 'field');
  app.AppWords.addWordsToGroup('Design Architect, Design Evanglist, Designer, Creative Coder, Design Engineer'.split(', '), 'title');
  
  function w(title, quotient) {
    if(!app.AppWords.getByTitle(title)) {
      return;
    }
    return [app.AppWords.getByTitle(title)[0], quotient];
  }

  app.AppSkills = new app.Skills(_.shuffle([
{
  title: 'I am an experienced (4+) visual designer',
  quantifiers: [
    w('Experienced', 9),
    w('Visual', 10),
    w('Designer', 10),
    w('Senior-level', 4)
  ]
},
{
  title: 'I have the experience and ability to lead a project',
  quantifiers: [
    w('Lead', 10),
    w('Senior-level', 5),
    w('Head of', 2)
  ]
},
{
  title: 'I am able to develop visual languages, from idea to product',
  quantifiers: [
    w('Visual', 10),
    w('Digital Product', 10),
    w('Designer', 8),
    w('Experienced', 2),
    w('Senior-level', 3)
  ]
},
{
  title: 'I create interfaces for large HDTVs, tiny mobile phones and everything in between',
  quantifiers: [
    w('Visual', 7),
    w('UI', 10),
    w('Multiscreen', 10),
    w('Innovative', 5),
    w('Designer', 2)
  ]
},
{
  title: 'I share my own ideas and opinion on the web',
  quantifiers: [
    w('Design Evanglist', 7),
    w('Open-minded', 10),
    w('Reflecting', 7),
    w('Motivated', 2)
  ]
},
{
  title: 'I have a passion for interactive design',
  quantifiers: [
    w('UI', 0),
    w('Designer', 10),
    w('IxD', 10),
    w('UX', 2),
    w('Motivated', 5)
  ]
},
{
  title: 'I reflect, rethink and improve my design workflow',
  quantifiers: [
    w('Innovative', 10),
    w('Technology-Loving', 0),
    w('Design Evanglist', 9),
    w('Reflecting', 6),
    w('Critical', 3)
  ]
},
{
  title: 'I experiment with CSS3 to create stunning visual results',
  quantifiers: [
    w('Frontend', 10),
    w('Technology-Loving', 8),
    w('Innovative', 6),
    w('Creative Coder', 6),
    w('Designer', 8),
    w('Visual', 9)
  ]
},
{
  title: 'I have a strong understanding of web development',
  quantifiers: [
    w('Frontend', 10),
    w('Design Architect', 8),
    w('Design Engineer', 9),
    w('Technology-Loving', 7),
    w('Experienced', 3),
    w('Senior-level', 3)
  ]
},
{
  title: 'I have natural mentoring instincts to lead and care for fellow team members',
  quantifiers: [
    w('Lead', 10),
    w('Design Evanglist', 10),
    w('Designer', 2),
    w('Design Architect', 2),
    w('Enthusiastic', 2)
  ]
},
{
  title: 'I have the willingness to share my knowledge',
  quantifiers: [
    w('Open-Minded', 10),
    w('Design Evanglist', 2)
  ]
},
{
  title: 'I have impressive skills in visual storytelling, ideation and sketching',
  quantifiers: [
    w('Designer', 6),
    w('UX', 8),
    w('Digital Product', 6)
  ]
},
{
  title: 'I love teamwork and brainstorming sessions',
  quantifiers: [
    w('Open-minded', 10)
  ]
},
{
  title: 'I am incurable curios about to all things related to design and technology',
  quantifiers: [
    w('Technology-Loving', 10),
    w('Designer', 0),
    w('Enthusiastic', 2)
  ]
},
{
  title: 'I have an healthy obsession for details',
  quantifiers: [
    w('Motivated', 2),
    w('Visual', 5),
    w('UI', 2),
    w('Frontend', 1),
    w('Designer', 2),
    w('Creative Coder', 0)
  ]
},
{
  title: 'I design interactions from a user\'s perspective',
  quantifiers: [
    w('UX', 10),
    w('UI', 9),
    w('Designer', 10)
  ]
},
{
  title: 'I work in an oh so agile way',
  quantifiers: [
    w('Open-Minded', 6),
    w('Motivated', 4)
  ]
},
{
  title: 'I am comfortable using version control, preferably Git',
  quantifiers: [
    w('Technology-Loving', 3),
    w('Design Engineer', 7),
    w('Creative Coder', 8),
    w('Frontend', 5)
  ]
},
{
  title: 'I am curious and open to learn new things and tools',
  quantifiers: [
    w('Motivated', 7),
    w('Open-Minded', 8),
    w('Designer', 0)
  ]
},
{
  title: 'I am comfortable presenting to clients',
  quantifiers: [
    w('Lead', 6),
    w('Senior-level', 5)
  ]
}
]));
  Backbone.history.start();
  if(!Modernizr.svganchors) {
    $('img.svg').fixSVGStack();
  }
  if(Modernizr.touch) {
    $('.input-options img:not(#input-keyboard)').tipsy({gravity: 's'});
  } else {
    $('.input-options img').tipsy({gravity: 's'});
  }

  if(!Modernizr.inputspeech) {
    $('#speechinput').hide();
  }
  // feature detection:
  var inputOptions = {
    'mic': Modernizr.inputspeech,
    'mouse': !Modernizr.touch,
    'touch': Modernizr.touch
  }
  _.each(inputOptions, function(enabled, inputOption) {
    if(!enabled) {
      $('img#input-' + inputOption).addClass('disabled');
    }
  });
};
$(init);
var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , InputElement = require('./input_element')
  , IndicatorView = require('./indicator_view')
  , SkillView = require('./skill_view')
  , SetupView = require('./setup_view')

  , MainView
  ;

module.exports = MainView = Backbone.View.extend({
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
      this.inputElement = new InputElement();
      this.indicatorView = new IndicatorView({model: this.model});
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

      if(!Modernizr.svganchors) {
        $('img.svg').fixSVGStack();
      }
      if(Modernizr.touch) {
        $('.input-options img:not(#input-keyboard)').tipsy({gravity: 's'});
        $('#input-keyboard').mouseup(function() {
          $('#ios-keyboard').focus();
        });
      } else {
        $('.input-options img').tipsy({gravity: 's'});
      }
      // feature detection:
      var inputOptions = {
        'mic': Modernizr.inputspeech,
        'mouse': !Modernizr.touch,
        'touch': Modernizr.touch
      };
      _.each(inputOptions, function(enabled, inputOption) {
        if(!enabled) {
          $('img#input-' + inputOption).addClass('disabled');
        }
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
      this.model.currentSkill().set({score: parseInt(score, 10)});
    },
    manipulateScore: function(score) {
      var currentScore = this.model.currentSkill().get('score');
      if(!_.isNumber(currentScore)) {
        currentScore = 0;
      }
      this.changeScore(currentScore + score);
    },
    submitScore: function() {
      //if last skill saved
      this.model.currentSkill().set({completed: true});

      if(!this.model.hasNext()) {
        this.router.gotoPosition();
        return;
      }
      var pos = this.model.get('skillPos');
      this.router.gotoNextQuestion();
      //this.model.next();
    },
    onScoreChange: function() {
      var score = this.model.currentSkill().get('score');
      this.inputElement.set(score);
      $('#ios-keyboard').val();
    },
    skillChange: function() {
      this.statementLayout();

      var currentSkill = this.model.currentSkill();
      this.listenTo(currentSkill, 'change:score', this.onScoreChange);
      this.skillView = new SkillView({model: this.model.currentSkill()});
      this.skillView.$el = this.$el.find('#skill');
      this.skillView.render();

      //this.skillView.appendInput(this.inputElement.$el);

      // strange, default value sometimes is undefined: quick fix:
      var score = this.model.currentSkill().get('score');
      if(!score) {
        this.model.currentSkill().set({'score': 50});
      } else {
        this.model.currentSkill().trigger('change:score');
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
        var url = "https://twitter.com/intent/tweet?text=" + window.escape(text);
        window.location.href = url;
        
      });

      $('button.facebook').click(function(e) {
        var text = "My #designposition: " + position;
        var url = "http://www.facebook.com/sharer/sharer.php?u=" + window.escape('http://bit.ly/design-positions') + "&t=" + window.escape(text);
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
      $('body').removeClass('position');
      $('header h1').html('Rate this statement');
      if(!Modernizr.svganchors) {
        $('header h1').fixSVGStackBackground();
      }
    },
    setupView: function() {
      this.setupView = new SetupView({model: this.model});
      this.setupView.$el = this.$el.find('#setup');
      this.setupView.render();
    }
  });
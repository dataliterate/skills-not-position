var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , InputElement = require('./input_element')
  , IndicatorView = require('./indicator_view')
  , SkillView = require('./skill_view')
  , SetupView = require('./setup_view')
  , Settings = require('../settings')

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


      $('#teaser').click(function(e) {
        e.preventDefault();
        $('body').removeClass('teaser-open');
      });
      if(!Modernizr.svganchors) {
        $('.svg').fixSVGStack();
      }
      // feature detection:
      var inputOptions = {
        'mic': Modernizr.inputspeech,
        'mouse': !Modernizr.touch,
        'touch': Modernizr.touch
      };
      _.each(inputOptions, function(enabled, inputOption) {
        if(!enabled) {
          $('img#input-' + inputOption).addClass('disabled').attr('title', $('img#input-' + inputOption).data('titledisabled'));
          //$('img#input-' + inputOption).attr('title', $('img#input-' + inputOption).data('titleDisabled'));
        }
      });
      if(Modernizr.touch) {
        $('.input-options img:not(#input-keyboard)').tipsy({gravity: 's'});
        $('#input-keyboard').mouseup(function() {
          $('#ios-keyboard').focus();
        });
      } else {
        $('.input-options img').tipsy({gravity: 's'});
      }
      if(Settings.SETUP) {
        this.setupView();
      }
      
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
      if(Settings.TRACK) {
        _gaq.push(['_trackEvent', 'Statement', 'rated', this.model.currentSkill().get('title'), this.model.currentSkill().get('score')]);
      }
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
    skillChange: function(e) {
      var currentSkill = this.model.currentSkill();
      if(currentSkill === undefined) {
        return;
      }
      this.statementLayout();
      window.scrollTo(0, 1);

      if(this.model.get('skillPos') > 0 && $('body').hasClass('teaser-open')) {
        $('body').removeClass('teaser-open');
      }

      var oldh = $('#skill').height();
      $('#scores').removeClass('active').hide();
      $('#skill').removeClass('animated').addClass('new-skill').css("height", "auto");

      this.listenTo(currentSkill, 'change:score', this.onScoreChange);
      this.skillView = new SkillView({model: this.model.currentSkill()});
      this.skillView.$el = this.$el.find('#skill');
      this.skillView.render();
      this.inputElement.set(0);

      var setScore = _.bind(function() {
        // strange, default value sometimes is undefined: quick fix:
        var score = this.model.currentSkill().get('score');
        if(!score) {
          this.model.currentSkill().set({'score': 50});
        } else {
          this.model.currentSkill().trigger('change:score');
        }
      }, this);

      if(oldh !== null) {
        var h = $('#skill').height();
        $('#skill').css('height', oldh + 'px');
        $('#scores').addClass('flash').show();
        _.delay(function() {
          $('#skill').addClass('animated').removeClass('new-skill').css('height', h + 'px');
          _.delay(function() {
            $('#scores').show();
            _.delay(function() {
              setScore();
              $('#scores').removeClass('flash');
              _.delay(function() {
                $('#scores').addClass('active');
                $('#skill').removeClass('animated').css("height", "auto");
              }, 400);
            }, 10);
          }, 100);
          
        }, 500);
      }

      //this.skillView.appendInput(this.inputElement.$el);

    },
    changeRange: function(e) {
      var x = $(e.currentTarget).val();
      this.changeScore(x);
    },
    showPosition: function() {
      var position = this.model.getPosition();
      if(Settings.TRACK) {
        _gaq.push(['_trackEvent', 'Position', 'generated', position]);
      }

      var positionInText = position; //.charAt(0).toLowerCase() + position.slice(1);
      if (['A', 'E', 'U', 'O'].indexOf(positionInText.charAt(0)) !== -1) {
        positionInText = 'an <em>' + positionInText + '</em>';
      } else {
        positionInText = 'a <em>' + positionInText + '</em>';
      }

      var html = this.resultTemplate({position: position, positionInText: positionInText});
      $('#position').html(html);
      this.positionLayout();

      $('button.twitter').click(function(e) {
        if(Settings.TRACK) {
          _gaq.push(['_trackEvent', 'Social', 'twitter-shared']);
        }
        var text = _.template($('#share-twitter-tmpl').html(), {position: position});
        var url = "https://twitter.com/intent/tweet?text=" + window.escape(text);
        window.open(url, "twitter", "status=1, height=500, width=360, resizable=0");
      });

      $('button#apply').click(_.bind(function(e) {
        if(Settings.TRACK) {
          _gaq.push(['_trackEvent', 'Conversion', 'applied']);
        }
        e.preventDefault();
        // create email link
        var mailto = 'mailto:jobs@precious-forever.com';
        mailto += '?subject=' + window.escape('Application as ' + position);
        var text = 'Hi precious,' + "\n" + "\n";
        text += '"' + position + '" describes me' + "\n" + "\n";
        text += '[x] very well' + "\n";
        text += '[  ] kind of' + "\n";
        text += '[  ] not at all' + "\n" + "\n";
        text += 'beacause [WRITE SOMETHING]' + "\n" + "\n" + "\n";
        text += 'T s c h u e s s,' + "\n" + "\n";
        text += '____' + "\n" + "\n";
        text += 'P.S.: I don\'t mind sharing my ratings:' + "\n";
        text += this.model.skills.getScores();

        mailto += '&body=' + window.escape(text);
        window.location.href = mailto;

      }, this));

      $('.learn-more').click(function(e) {
        if(Settings.TRACK) {
          _gaq.push(['_trackEvent', 'Conversion', 'learned']);
        }
      });

      $('button.facebook').click(function(e) {
        if(Settings.TRACK) {
          _gaq.push(['_trackEvent', 'Social', 'facebook-shared']);
        }
        var text = _.template($('#share-facebook-tmpl').html(), {position: position});
        var url = window.location.href.replace(window.location.hash, '');
        var query = 'p[title]=' + window.escape(window.document.title);
        query += '&p[images][0]=' + window.escape(url + 'positionfinder.png');
        query += '&p[summary]=' + window.escape(text);
        query += '&p[url]=' + window.escape(window.location.href.replace(window.location.hash, ''));
        var shareUrl = "http://www.facebook.com/sharer/sharer.php?s=100&" + query;
        window.open(shareUrl, "facebook", "status=1, height=500, width=360, resizable=0");
      });
    },
    currentLayout: null,
    positionLayout: function() {
      if(this.currentLayout === 'position') {
        return;
      }
      this.currentLayout = 'position';
      $('body').addClass('position').removeClass('statement').css('background-color', '#FFF');

      if(!Modernizr.svganchors) {
        $('header h1').fixSVGStackBackground();
        $('.sharing button').fixSVGStackBackground();
      }
    },
    statementLayout: function() {

      if(this.currentLayout === 'statement') {
        return;
      }
      this.currentLayout = 'statement';
      
      $('body').removeClass('position').addClass('statement');
      
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
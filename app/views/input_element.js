var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  ;

module.exports = InputElement = Backbone.View.extend({
    $el: null,
    template: _.template(
      $('#input-element-tmpl').html()
    ),
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
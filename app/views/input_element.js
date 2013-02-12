var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , InputElement
  ;

module.exports = InputElement = Backbone.View.extend({
    $el: null,
    template: _.template(
      $('#input-element-tmpl').html()
    ),
    $scorer: null,
    value: 0,
    initialize: function() {
      $('body').keydown(_.bind(this.onKeyDown, this));
      this.throttledDisplay = function() {};
      
    },
    render: function() {
      //this.$el = $('<div id="skill-input"></div>');

      this.$el.html(this.template());

      if(!Modernizr.inputspeech) {
        $('#speechinput').hide();
      } else {
        this.$el.find('#speechinput')[0].onwebkitspeechchange = _.bind(this.onSpeechChange, this);
      }
      this.$scorer = this.$el.find('#scorer');
      this.$scorer.change(_.bind(this.onRangeChange, this));
      this.$el.find('#submit').click(_.bind(this.onSubmit, this));
      if(Modernizr.touch) {
        this.$scorer.bind('touchstart', _.bind(this.onTouchStart, this));
        this.$scorer.bind('touchmove', _.bind(this.onTouchMove, this));
      }

      this.throttledDisplay = _.throttle(_.bind(this.display, this), 50);
      //this.$el.find('#scorer').bind('click', _.bind(this.onTouch, this));
    },
    touchData: {},
    onTouchStart: function(e) {
      e.preventDefault();
      $('.indicator-wrapper').removeClass('animated');
      var touch = event.touches[0];
      this.touchData.width = this.$scorer.width();
      this.touchData.offsetLeft = this.$scorer.offset().left;
      var v = Math.round((touch.pageX - this.touchData.offsetLeft) / this.touchData.width * 100);
      this.trigger('change', v);
    },
    onTouchMove: function(e) {
      e.preventDefault();
      var touch = event.touches[0];
      var v = Math.round((touch.pageX - this.touchData.offsetLeft) / this.touchData.width * 100);
      this.trigger('change', v);
    },
    onRangeChange: function(e) {
      $('.indicator-wrapper').removeClass('animated');
      var v = $(e.currentTarget).val();
      this.trigger('change', v);
    },
    onSubmit: function() {
      this.trigger('submit');
    },
    onSpeechChange: function(e) {
      $('.indicator-wrapper').addClass('animated');
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

      var processKey = _.bind(function(keyCode) {
        $('.indicator-wrapper').addClass('animated');
        var ENTER_KEY = 13;
        var CHROME_ANDROID_ENTER_KEY = 61;
        if(keyCode === ENTER_KEY || keyCode === CHROME_ANDROID_ENTER_KEY) {
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
        if(!isNaN(String.fromCharCode(keyCode))) {
          num = parseInt(String.fromCharCode(keyCode), 10);
        } else if(!isNaN(String.fromCharCode(keyCode - 48))) {
          num = parseInt(String.fromCharCode(keyCode - 48), 10);
        }
        if(num === null) {
          return;
        }
        var score = num;
        // photoshop opacity layer style input
        if(this.waitingForCompletion) {
          if(this.value === 10 && this.waitingForCompletion === 2) {
            num = 100;
          } else {
            num = this.value + num;
          }
          if(num === 10) {
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
      }, this);

      if(e.keyCode === 229) {
        // fix chrome android bug:
        _.delay(function() {
          var input = $('#ios-keyboard').val();
          if(!input.length) {
            return;
          }
          var keyCode = input.charCodeAt(0);
          if(input === "\n") {
            keyCode = 13;
          }
          $('#ios-keyboard').val('');
          processKey(keyCode);
        }, 50);
      } else {
        //e.preventDefault();
        processKey(e.keyCode);
      }

    },
    manipulateScore: function(score) {
      var currentScore = this.value;
      var newScore = currentScore + score;
      this.trigger('change', newScore);
    },
    displayNumber: function() {
      var h = '';
      if(this.waitingForCompletion === 1) {
        if(this.value === 0) {
          // special: change first char
          h += '<span class="changeable">' + String(this.value)[0] + '</span>';
        } else {
          h += String(this.value)[0];
          h += '<span class="changeable">' + String(this.value)[1] + '</span>';
        }
      } else if(this.waitingForCompletion === 2) {
        // special: allow hundred
        h += '10<span class="changeable">&nbsp;</span>';
      } else {
        h += '<span class="overwritable">' + String(this.value) + '</span>';
      }

      this.$el.find('#score').html(h);
    },
    display: function() {
      this.displayNumber();
      $('.indicator-wrapper').css('width', this.value + '%');
      this.$scorer.val(this.value);


      var middle = 187;
      var range = 30;
      var base = middle - range / 2;
      
      var gray = Math.floor(base + this.value / 100 * range);

      $('body').css('background', 'RGB(' + gray + ', '+ gray + ', ' + gray + ')');
      
    },
    set: function(v) {
      this.value = v;
      this.throttledDisplay();
    }
  });
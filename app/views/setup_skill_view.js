var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')

  , SetupSkillView
  ;

module.exports = SetupSkillView = Backbone.View.extend({
    template: _.template($('#setup-skill-tmpl').html()),
    events: {
      'change input': 'inputChange'
    },
    words: null,
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
      // DUCK TAPE PROGRAMMING::
      var grouped = this.words.getWordsByGroup();
      var html = '';
      var that = this;
      _.each(grouped, function(words, group) {
        html += '<div class="word-group"><h4>' + group + '</h4>';
        _.each(words, function(word) {
          var value = 0;
          value = that.getQuantifier(word);
          html += '<div class="input">';
          html += '<label>' + word.get('title') + '</label>';
          html += '<input name="' + word.get('title') + '" type="range" min="0" max="10" step="1" value="' + value + '"><br />';
          html += '</div>';
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
        newQuantifiers.push([this.words.getByTitle(word)[0], score]);
      }
      this.model.set({'quantifiers': newQuantifiers});
    },
    inputChange: function(e) {
      var $input = $(e.currentTarget);
      var name = $input.attr('name');
      this.setQuantifier($input.attr('name'), $input.val());
    }
  });
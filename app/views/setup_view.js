var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , SetupSkillView// = require('setupskill_view')
  , SetupView
  ;

module.exports = SetupView = Backbone.View.extend({
  template: _.template($('#setup-tmpl').html()),
  views: [],
  initialize: function() {
    
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.model.skills.each(_.bind(function(skillModel) {
      var skillSetupView = new SetupSkillView({model: skillModel});
      this.views.push(skillSetupView);
      skillSetupView.render();
      this.$el.find('ul').append(skillSetupView.el);
    }, this));
    
  },
  updateScore: function() {
    this.$el.find('input').val(this.model.get('score'));
  }
});
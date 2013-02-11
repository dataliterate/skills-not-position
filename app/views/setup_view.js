var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , SetupSkillView = require('./setup_skill_view')
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
      skillSetupView.words = this.model.words;
      this.views.push(skillSetupView);
      skillSetupView.render();
      this.$el.find('ul').append(skillSetupView.el);
    }, this));
    this.$el.find('button').click(_.bind(this.doExport, this));
  },

  doExport: function() {
    var text = this.model.skills.doExport();
    $('#setup-export-output').val(text).show();
  }
});
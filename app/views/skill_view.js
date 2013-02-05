var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')

  , SkillView
  ;

module.exports = SkillView = Backbone.View.extend({
  template: _.template($('#skill-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  }
});
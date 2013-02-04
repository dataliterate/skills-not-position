var _ =  require('underscore')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  ;

module.exports = IndicatorView = Backbone.View.extend({
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
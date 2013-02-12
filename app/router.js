var _ =  require('underscore')
  , Backbone = require('backbone')
  , Settings = require('./settings')
  , Session = require('./models/session')
  , MainView = require('./views/main_view')
  ;

var Router = Backbone.Router.extend({
  routes:{
    'statement/:n': 'statement',
    'position': 'position',
    '': 'defaultRoute'
  },
  session: null,
  mainView: null,
  defaultRoute: function() {
    this.startSession();
  },
  statement: function(i) {
    if(!this.hasSession()) {
      this.navigate('', {trigger: true});
      return;
    }
    i = parseInt(i, 10) - 1;
    if(!_.isNumber(i) || i > Settings.N_STATEMENTS) {
      return;
    }
    this.session.set({'skillPos': i, 'analysed': false});
  },
  position: function() {
    
    if(!this.hasSession()) {
      this.navigate('');
      return;
    }
    
    //if(!this.hasSession()) {
    //  this.startSession();
    //}
    this.navigate('position', {trigger: true});
    this.session.set({'skillPos': null});
    this.mainView.showPosition();
  },
  startSession: function() {
    if(!this.hasSession()) {
      this.session = new Session();
      this.mainView = new MainView({model: this.session});
      this.mainView.router = this;
      this.mainView.render();
    }
    this.navigate('statement/' + 1, {trigger: true});
  },
  hasSession: function() {
    return this.session;
  },
  gotoNextQuestion: function() {
    var skillPos = this.session.get('skillPos');
    this.navigate('statement/' + (skillPos + 2), {trigger: true});
  },
  gotoPosition: function() {
    this.navigate('position', {trigger: true});
  }
});

var AppRouter = new Router();
module.exports = AppRouter;

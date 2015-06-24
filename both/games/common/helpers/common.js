if (Meteor.isClient) {

  getGame = function(gameKey){
    var game = GameStatus.findOne({
      key: gameKey, userId: Meteor.userId()
    });
    if (!game) {
      throw new Meteor.Error(500, 'Bad data!');
    };
    return game;
  };

  noErrorDiv = function(){
    return $('div.has-error.form-group').length === 0
  };


  Template._body.events({
    'input input.validate-number': function(e, data, tpl){
      var el = e.target;
      var parent = el.parentNode;
      if (el.type === 'number') {
        var min = parseInt(el.min);
        var max = parseInt(el.max);
        var val = parseInt(el.value);
        if (val < min || val > max || isNaN(val)) {
          parent.classList.add('has-error');
        }else{
          parent.classList.remove('has-error');
        };
      };
    }
  });

  var tmpl = function(x){
    if (x < 0) {
      return null;
    };
    return Template.instance().data.gameKey + '-' + x;
  };


  var getStep = function(){
    var gameKey = Template.instance().data.gameKey;
    var gameStatus = GameStatus.findOne({key: gameKey});
    if (!gameStatus) {
      Meteor.call('initiateNewGame', gameKey);    
      gameStatus = GameStatus.findOne({key: gameKey});
    };
    return gameStatus ? gameStatus.step: 0;
  }

  Template.genericGameLayout.helpers({
    gameName: function(){
      var gameKey = Template.instance().data.gameKey;
      var name = Games.settings[gameKey].name;
      if (typeof(name) === 'undefined') {
        name = 'The ' + gameKey + ' game';
      };
      return name;
    },
    stepNumber: function(){
      return getStep();
    },
    stepNumber1: function(){
      return getStep()+1;
    },
    currTemplate: function(){
      return tmpl(getStep());
    },
    prevTemplate: function(){
      return tmpl(getStep() - 1);
    },
    nextTemplate: function(){
      return tmpl(getStep() + 1);
    },
    totalSteps: function(){
      return Games.settings[Template.instance().data.gameKey].steps;
    },
    totalSteps1: function(){
      return Games.settings[Template.instance().data.gameKey].steps + 1;
    },
    isDone: function(){
      if (getStep() >= Games.settings[Template.instance().data.gameKey].steps) {
        return true;
      };
      return false;
    }
  });

  Template.index.events({
    'click button.logout': function(){
      Meteor.logout();
    }
  })

  // Meteor.startup(function(){

  //   // Attach common helpers to all our game templates
  //   var templateNamePattern = '^(' + _.keys(Games.settings).join('|') + ')-\\d+$';
  //   var templateNameRegex = new RegExp(templateNamePattern);
  //   for (var t in Template){
  //     if (t.match(templateNameRegex)) {
  //       // Add a common helper here!
  //     };
  //   }
  // });
}
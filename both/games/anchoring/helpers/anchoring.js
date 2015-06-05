if (Meteor.isClient) {

  Template['anchoring-game'].created = function(){
    Meteor.call('initiateNewGame', 'anchoring');
  };

  var getStep = function(){
    var gameStatus = GameStatus.findOne({key: 'anchoring'});
    if (!gameStatus) {
      Meteor.call('initiateNewGame', 'anchoring');    
      gameStatus = GameStatus.findOne({key: 'anchoring'});
    };
    return gameStatus ? gameStatus.step: 0;
  }

  var tmpl = function(x){
    if (x < 0) {
      return null;
    };
    return 'anchoring-game-' + x
  }
  Template['anchoring-game'].helpers({
    stepNumber: function(){
      return getStep();
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
    isDone: function(){
      if (getStep() >= 3) {
        return true;
      };
      return false;
    }
  });

  Template['anchoring-game'].events({
    'click button.nextStep': function(e){
      e.preventDefault();
      // Move forward if there is no user input,
      // otherwise have to write custom logic.
      if ($('input').length === 0) {
        Meteor.call('incrementGameStep', 'anchoring');
      };
    },
    'click button.prevStep': function(e){
      e.preventDefault();
      console.log('clicked previous');
    },
    'click button.nextStep.step-0': function(e){
      var val = parseInt($('input#random-number').val());
      console.log(val);
      if ($('.has-error').length === 0) {
        console.log('no error detected');
        Meteor.call('setAnchoringRandomNumber', val, function(){
          Meteor.call('incrementGameStep', 'anchoring');        
        });
      };
    },
    'click button.nextStep.step-1': function(e){
      e.preventDefault();
      var decision = $('input[name=moreOrLess]:checked').val();
      Meteor.call('setAnchoringDirection', decision, function(){
        Meteor.call('incrementGameStep', 'anchoring');        
      });
    },
    'click button.nextStep.step-2': function(e){
      e.preventDefault();
      var price = $('input#price').val();
      Meteor.call('setAnchoringPrice', parseInt(price), function(){
        Meteor.call('incrementGameStep', 'anchoring');        
      });
    }


  });

  Template['anchoring-game-1'].helpers({
    randomNumber: function(){
      return GameStatus.findOne({key: 'anchoring'}).randomNumber;
    }
  });
  Template['anchoring-game-1'].created = function(){
    Session.set('disableNext', true);
  }
  Template['anchoring-game-1'].events({
    'change input': function(){
      return Session.set('disableNext', false);
    }
  });

  Template['anchoring-game-2'].helpers({
    priceRange: function(){
      var game = GameStatus.findOne({key: 'anchoring'});
      var min = 0;
      var max = 999;
      if (game.direction === 'more') {
        min = game.randomNumber;
      }
      if (game.direction === 'less') {
        max = game.randomNumber;
      }
      return {
        min: min,
        max: max,
        direction: game.direction
      };
    },
    randomNumber: function(){
      return GameStatus.findOne({key: 'anchoring'}).randomNumber;
    }

  });
  Template['anchoring-game-2'].created = function(){
    Session.set('disableNext', true);
  }

  Template['anchoring-game-2'].events({
    'change input': function(){
      return Session.set('disableNext', false);
    }
  });
  Template['anchoring-game-3'].helpers({
    price: function(){
      return GameStatus.findOne({key: 'anchoring'}).price;
    }
  });

};
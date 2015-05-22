if (Meteor.isClient) {

  Template['ultimatum-game'].created = function(){
    Meteor.call('initiateNewGame', 'ultimatum');
  };

  var getStep = function(){
    var gameStatus = GameStatus.findOne('ultimatum');
    if (!gameStatus) {
      Meteor.call('initiateNewGame', 'ultimatum');    
      gameStatus = GameStatus.findOne({key: 'ultimatum'});
    };
    console.log(gameStatus);
    return gameStatus ? gameStatus.step: 0;
  }

  var tmpl = function(x){
    if (x < 0) {
      return null;
    };
    return 'ultimatum-game-' + x
  }
  Template['ultimatum-game'].helpers({
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
  });
  Template['ultimatum-game'].events({
    'click button.nextStep': function(e){
      e.preventDefault();
      console.log('clicked next');
      Meteor.call('incrementGameStep', 'ultimatum');
    },
    'click button.prevStep': function(e){
      e.preventDefault();
      console.log('clicked previous');
    },
    'click button.nextStep.step-1': function(e){
      e.preventDefault();
      var player1Amount = parseInt($('input#player1-amount').val());
      var player2Amount = parseInt($('input#player2-amount').val());
      Meteor.call('setUltimatumAmounts', player1Amount, player2Amount);
    }
  })
  Template['ultimatum-game-1'].helpers({
    availableDollars: function(){
      return _.range(1, 101);
    },
    playerAmount: function(number){
      var gs = GameStatus.findOne('ultimatum');
      console.log(gs);
      try{
        return gs.amounts['player' + number] || 0;
      }catch(e){
        return 0;
      }
    }
  });
};
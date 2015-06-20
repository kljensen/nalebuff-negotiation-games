if (Meteor.isClient) {

  var gameKey = 'zincit';

  var getSettings = function(){
    return Games.settings[gameKey];
  }

  Template['zincit-0'].helpers({
    roles: function(){
      return _.map(Games.settings[gameKey].roles, function(v, k){
        return {name: v, key: k}
      });
    }
  });
  Template['zincit-2'].helpers({
    agreementStatus: function(){
      var game = getGame(gameKey);
      return game.agreementStatus;
    }
  });
  Template['zincit-6'].created = function(){
    var game = getGame(gameKey);
    if (game.renegotiatedLawyer === false) {
      Meteor.call('incrementGameStep', gameKey);
    };
  };
  Template['zincit-2'].created = function(){
    var game = getGame(gameKey);
    if (game.agreementStatus === false) {
      Meteor.call('incrementGameStep', gameKey);
    };
  };
  Template['zincit-7'].created = function(){
    var game = getGame(gameKey);
    if(!_.has(game, 'outcomes')){
      Meteor.call('calculateZincitOutcome');
    }
  };

  var goToNextStep = function(err, result){
    if (!err) {
      Meteor.call('incrementGameStep', gameKey);
    }else{
      console.log('Error calling method');
    };
  };

  var callMethodWithValue = function(inputName, methodName){
    var value = $('input[name=' + inputName + ']:checked').val();
    if (value && value.length > 0) {
      Meteor.call(methodName, value, goToNextStep);
    }else{
      console.log('no value...');
    }
  };

  Template.genericGameLayout.events({
   'click button.nextStep.zincit-0': function(e){
      callMethodWithValue('role', 'setZincitRole');
    },
   'click button.nextStep.zincit-1': function(e){
      callMethodWithValue('agreement', 'setZincitAgreementStatus');
    },
    'click button.nextStep.zincit-2': function(e){
      var upfront = parseInt($('input#upfront').val());
      var bonus = parseInt($('input#bonus').val());
      if (upfront > 0 && bonus > 0 && noErrorDiv()) {
        console.log('no error on page!');
        Meteor.call('setZincitAmounts', upfront, bonus, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
        console.log('error on page!')
      }
    },
    'click button.nextStep.zincit-3': function(e){
      var negotiationTime = parseInt($('input#negotiationTime').val());
      if (negotiationTime > 0 && negotiationTime <= 120 && noErrorDiv()) {
        console.log('no error on page!');
        Meteor.call('setZincitNegotiationTime', negotiationTime, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
        console.log('error on page!')
      }
    },
   'click button.nextStep.zincit-4': function(e){
      callMethodWithValue('calculatedPie', 'setZincitCalculatedPie');
    },
   'click button.nextStep.zincit-5': function(e){
      callMethodWithValue('renegotiatedLawyer', 'setZincitRenegotiatedLawyer');
    },
   'click button.nextStep.zincit-6': function(e){
      var lawyerUpfront = parseInt($('input#lawyerUpfront').val());
      var lawyerBonus = parseInt($('input#lawyerBonus').val());
      if (lawyerUpfront > 0 && lawyerBonus > 0 && noErrorDiv()) {
        console.log('no error on page!');
        Meteor.call('setZincitLawyerPercents', lawyerUpfront, lawyerBonus, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
        console.log('error on page!')
      }
    },
  });

};
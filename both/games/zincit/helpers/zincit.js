if (Meteor.isClient) {

  var gameKey = 'zincit';

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
  Template['zincit-7'].helpers({
    outcomes: function(){
      var outcomes = {
        sam: 0,
        hasan: 20,
        zincit: 0
      };
      var game = getGame(gameKey);
      var lawyerUpfrontAmount = 0;
      if (game.agreementStatus === true) {
        if (game.renegotiatedLawyer) {
          lawyerUpfrontAmount = game.lawyerAmounts.upfront * game.amounts.upfront / 100;
          outcomes.sam = lawyerUpfrontAmount + game.lawyerAmounts.bonus * game.amounts.bonus / 100;
        }else{
          lawyerUpfrontAmount = 0.05 * game.amounts.upfront;
          outcomes.sam = lawyerUpfrontAmount;
        };
        outcomes.hasan = game.amounts.upfront - lawyerUpfrontAmount + game.amounts.bonus * 0.6;
        outcomes.zincit = 30 - game.amounts.upfront + game.amounts.bonus * 0.1;
      };
      return outcomes;
    }
  });

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
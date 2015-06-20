var gameKey = 'zincit';

var updateZincitGame = function(update){
  return updateGameStatus(gameKey, update);
}
var booleanStatuses = {no: false, yes: true};

var setZinctItBoolean = function(attribute, value){
  if (!_.has(booleanStatuses, value)) {
    throw new Meteor.Error(400, 'Bad boolean value!');
  };
  var update = {};
  update[attribute] = booleanStatuses[value];
  updateZincitGame(update);
};

Meteor.methods({
  'setZincitRole': function(role){
    check(role, String);
    if (!_.has(Games.settings[gameKey].roles, role)) {
      throw new Meteor.Error(400, 'Bad role!');     
    };
    updateZincitGame({role: role});
  },
  'setZincitAgreementStatus': function(agreementStatus){
    setZinctItBoolean('agreementStatus', agreementStatus);
  },
  'setZincitCalculatedPie': function(calculatedPie){
    setZinctItBoolean('calculatedPie', calculatedPie);
  },
  'setZincitRenegotiatedLawyer': function(renegotiatedLawyer){
    setZinctItBoolean('renegotiatedLawyer', renegotiatedLawyer);
  },
  'setZincitAmounts': function(upfront, bonus){
    updateZincitGame({
      amounts: {
        upfront: checkIntInRange(upfront, 0, 1000),
        bonus: checkIntInRange(bonus, 0, 1000)        
      }
    });
  },
  'setZincitLawyerPercents': function(lawyerUpfront, lawyerBonus){
    updateZincitGame({
      lawyerAmounts: {
        upfront: checkIntInRange(lawyerUpfront, 0, 100),
        bonus: checkIntInRange(lawyerBonus, 0, 100)        
      }
    });
  },
  'setZincitNegotiationTime': function(negotiationTime){
    updateZincitGame({
      negotiationTime: checkIntInRange(negotiationTime, 1, 120),
    });
  },


});
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

var calculateOutcomes = function(){
  var outcomes = {
    sam: 1, // 0.5 * 20
    hasan: 19, // 20 - (0.5 * 20)
    zincit: 0
  };
  var game = getGameStatus(gameKey);
  var lawyerUpfrontAmount = 0;
  var settings = Games.settings[gameKey];
  if (game.agreementStatus === false) {
    return outcomes;
  }

  if (game.renegotiatedLawyer) {
    lawyerUpfrontAmount = game.lawyerAmounts.upfront * game.amounts.upfront / 100;
    outcomes.sam = lawyerUpfrontAmount + settings.bonusBeliefs.hasan * game.lawyerAmounts.bonus * game.amounts.bonus / 100;
  }else{
    lawyerUpfrontAmount = 0.05 * game.amounts.upfront;
    outcomes.sam = lawyerUpfrontAmount;
  };
  outcomes.hasan = game.amounts.upfront + settings.bonusBeliefs.hasan * game.amounts.bonus - outcomes.sam;
  outcomes.zincit = 30 - (game.amounts.upfront + settings.bonusBeliefs.zincit * game.amounts.bonus);
  return outcomes;
};


Meteor.methods({
  'setZincitRole': function(role){
    verifyUserIsLoggedIn();
    check(role, String);
    if (!_.has(Games.settings[gameKey].roles, role)) {
      throw new Meteor.Error(400, 'Bad role!');
    };
    updateZincitGame({role: role});
  },
  'setZincitAgreementStatus': function(agreementStatus){
    verifyUserIsLoggedIn();
    setZinctItBoolean('agreementStatus', agreementStatus);
  },
  'setZincitCalculatedPie': function(calculatedPie){
    verifyUserIsLoggedIn();
    setZinctItBoolean('calculatedPie', calculatedPie);
  },
  'setZincitRenegotiatedLawyer': function(renegotiatedLawyer){
    verifyUserIsLoggedIn();
    setZinctItBoolean('renegotiatedLawyer', renegotiatedLawyer);
  },
  'setZincitAmounts': function(upfront, bonus){
    verifyUserIsLoggedIn();
    updateZincitGame({
      amounts: {
        upfront: checkIntInRange(upfront, 0, 1000),
        bonus: checkIntInRange(bonus, 0, 1000)
      }
    });
  },
  'setZincitLawyerPercents': function(lawyerUpfront, lawyerBonus){
    verifyUserIsLoggedIn();
    updateZincitGame({
      lawyerAmounts: {
        upfront: checkIntInRange(lawyerUpfront, 0, 100),
        bonus: checkIntInRange(lawyerBonus, 0, 100)
      }
    });
  },
  'setZincitNegotiationTime': function(negotiationTime){
    verifyUserIsLoggedIn();
    updateZincitGame({
      negotiationTime: checkIntInRange(negotiationTime, 1, 120),
    });
  },
  'calculateZincitOutcome': function(){
    verifyUserIsLoggedIn();
    updateZincitGame({outcomes: calculateOutcomes()});
  },
  'getZincitOutcomeDistribution': function(){
    verifyUserIsLoggedIn();
    if (Meteor.isServer) {
      var settings = Games.settings[gameKey];
      var games = GameStatus.find(
        {key: gameKey, step: {$gte: settings.steps}},
        {fields: {outcomes: 1}}
      ).fetch();
      var distribution = {};
      _.each(_.keys(settings.roles), function(role){
        distribution[role] = getStatisticalMoments(_.map(games, function(g){
          return g.outcomes[role];
        }));
      });
      console.log('distribution =', distribution);
      return distribution;
    };
  }
});

var gameKey = 'outpsider';

var updateOutpsiderGame = function(update){
  return updateGameStatus(gameKey, update);
}
var booleanStatuses = {no: false, yes: true};

var checkBoolean = function(value){
  if (!_.has(booleanStatuses, value)) {
    throw new Meteor.Error(400, 'Bad boolean value!');
  };
  return booleanStatuses[value];
}

var setOutpsiderBoolean = function(attribute, value){
  checkBoolean(value);
  var update = {};
  update[attribute] = booleanStatuses[value];
  updateOutpsiderGame(update);
};

var calculateOutcomes = function(){
  var outcomes = {
    sam: 0,
    hasan: 20,
    outpsider: 0
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
  outcomes.outpsider = 30 - (game.amounts.upfront + settings.bonusBeliefs.outpsider * game.amounts.bonus);
  return outcomes;
};


Meteor.methods({
  'setOutpsiderRole': function(role){
    check(role, String);
    if (!_.has(Games.settings[gameKey].roles, role)) {
      throw new Meteor.Error(400, 'Bad role!');     
    };
    updateOutpsiderGame({role: role});
  },
  'setOutpsiderAgreementStatus': function(agreementStatus){
    setOutpsiderBoolean('agreementStatus', agreementStatus);
  },
  'setOutpsiderHelenSharedLoss': function(x){
    setOutpsiderBoolean('helenSharedLoss', x);
  },
  'setOutpsiderCalculatedPie': function(calculatedPie){
    setOutpsiderBoolean('calculatedPie', calculatedPie);
  },
  'setOutpsiderRenegotiatedLawyer': function(renegotiatedLawyer){
    setOutpsiderBoolean('renegotiatedLawyer', renegotiatedLawyer);
  },
  'setOutpsiderAmounts': function(upfront, bonus){
    updateOutpsiderGame({
      amounts: {
        upfront: checkIntInRange(upfront, 0, 1000),
        bonus: checkIntInRange(bonus, 0, 1000)        
      }
    });
  },
  'setOutpsiderNoncashDescription': function(desc){
    updateOutpsiderGame({
      noncashDescription: desc
    });
  },
  'setOutpsiderNoncash': function(hadNoncash, noncashDescription, freeAdsStill, freePagesCountedAgainst, numFreePages){
    if (Meteor.isServer === false) {
      return;
    };
    var update = {};
    update.hadNoncash = checkBoolean(hadNoncash);
    if (update.hadNoncash) {
      check(noncashDescription, String);
      update.noncashDescription = noncashDescription;
      update.freeAdsStill = checkBoolean(freeAdsStill);
      update.freePagesCountedAgainst = checkBoolean(freePagesCountedAgainst);
      if (freeAdsStill) {
        update.numFreePages = checkIntInRange(numFreePages, 1, 36)
      };
    };
    updateOutpsiderGame(update);
  },

  'setOutpsiderPatPayment': function(x){
    updateOutpsiderGame({
      patPayment: checkIntInRange(x, 1, 1000000),
    });
  },
  'calculateOutpsiderOutcome': function(){
    updateOutpsiderGame({outcomes: calculateOutcomes()});
  },
  'getOutpsiderOutcomeDistribution': function(){
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

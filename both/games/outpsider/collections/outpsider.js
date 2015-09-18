var gameKey = 'outpsider';

var updateOutpsiderGame = function(update){
  return updateGameStatus(gameKey, update);
}
var booleanStatuses = {no: false, yes: true};

var checkBoolean = function(value){
  if (!_.has(booleanStatuses, value)){
    throw new Meteor.Error(400, 'Bad boolean value!:', value);
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
    cade: 80000,
    helen: 80000,
    pat: 0
  };
  var game = getGameStatus(gameKey);
  var settings = Games.settings[gameKey];
  var patViolatedConstraint;
  if (game.agreementStatus === false) {
    return outcomes;
  }



  // Main outcome calc
  //
  var patPayment = game.patPayment;
  var nonCashValue = game.hadNoncash ? game.numFreePages * 2500 : 0;
  var totalValue = patPayment + nonCashValue;
  if (totalValue > 500000) {
    outcomes.cade = settings.numShares.cade * totalValue / settings.numShares.total;
    outcomes.helen = outcomes.cade;
  }else{
    if (!game.helenSharedLoss && !game.hadNoncash) {
      outcomes.cade = patPayment - 400000;
      outcomes.helen = 100000;
    }else if(game.helenSharedLoss && !game.hadNoncash){
      outcomes.cade = (patPayment - 300000)/2;
      outcomes.helen = outcomes.cade;
    }else if(!game.helenSharedLoss && game.hadNoncash){
      outcomes.cade = patPayment + nonCashValue  - 400000;
      outcomes.helen = 100000;
    }else if(game.helenSharedLoss && game.hadNoncash){
      outcomes.cade = (patPayment + nonCashValue - 300000)/2;
      outcomes.helen = outcomes.cade;
    };
  };
  console.log('outcomes =', outcomes);

  // Penalizing Pat
  if (patPayment > 470000) {
    outcomes.pat = -250000;
    patViolatedConstraint = true;
  }else{
    outcomes.pat = 750000 - patPayment;
    patViolatedConstraint = false;
  };
  return outcomes;
};

Meteor.methods({
  'setOutpsiderRole': function(role){
    verifyUserIsLoggedIn();
    check(role, String);
    if (!_.has(Games.settings[gameKey].roles, role)) {
      throw new Meteor.Error(400, 'Bad role!');
    };
    updateOutpsiderGame({role: role});
  },
  'setOutpsiderAgreementStatus': function(agreementStatus){
    verifyUserIsLoggedIn();
    setOutpsiderBoolean('agreementStatus', agreementStatus);
  },
  'setOutpsiderHelenSharedLoss': function(x){
    verifyUserIsLoggedIn();
    setOutpsiderBoolean('helenSharedLoss', x);
  },
  'setOutpsiderCalculatedPie': function(calculatedPie){
    verifyUserIsLoggedIn();
    setOutpsiderBoolean('calculatedPie', calculatedPie);
  },
  'setOutpsiderRenegotiatedLawyer': function(renegotiatedLawyer){
    verifyUserIsLoggedIn();
    setOutpsiderBoolean('renegotiatedLawyer', renegotiatedLawyer);
  },
  'setOutpsiderAmounts': function(upfront, bonus){
    verifyUserIsLoggedIn();
    updateOutpsiderGame({
      amounts: {
        upfront: checkIntInRange(upfront, 0, 1000),
        bonus: checkIntInRange(bonus, 0, 1000)
      }
    });
  },
  'setOutpsiderNoncashDescription': function(desc){
    verifyUserIsLoggedIn();
    updateOutpsiderGame({
      noncashDescription: desc
    });
  },
  'setOutpsiderNoncash': function(hadNoncash, noncashDescription, freeAdsStill, numFreePages){
    verifyUserIsLoggedIn();
    if (Meteor.isServer) {
      var update = {};
      update.hadNoncash = checkBoolean(hadNoncash);
      if (update.hadNoncash) {
        check(noncashDescription, String);
        update.noncashDescription = noncashDescription;
        update.freeAdsStill = checkBoolean(freeAdsStill);
        if (update.freeAdsStill) {
          update.numFreePages = checkIntInRange(numFreePages, 1, 36)
        }else{
          update.numFreePages = 0;
        };
      };
      updateOutpsiderGame(update);
    };
  },

  'setOutpsiderPatPayment': function(x){
    verifyUserIsLoggedIn();
    updateOutpsiderGame({
      patPayment: checkIntInRange(x, 1, 1000000),
    });
  },
  'calculateOutpsiderOutcome': function(){
    verifyUserIsLoggedIn();
    console.log('updating outcomes!');
    updateOutpsiderGame({outcomes: calculateOutcomes()});
  },
  'getOutpsiderOutcomeDistribution': function(){
    console.log('in getOutpsiderOutcomeDistribution');
    verifyUserIsLoggedIn();
    if (Meteor.isServer) {
      var settings = Games.settings[gameKey];
      var games = GameStatus.find(
        {key: gameKey, step: {$gte: settings.steps}},
        {fields: {outcomes: 1}}
      ).fetch();
      console.log('games =', games);
      var distribution = {};
      _.each(_.keys(settings.roles), function(role){
        distribution[role] = getStatisticalMoments(_.map(games, function(g){
          console.log('g.outcomes =', g.outcomes);
          return g.outcomes[role];
        }));
      });
      console.log('distribution =', distribution);
      return distribution;
    };
  }
});

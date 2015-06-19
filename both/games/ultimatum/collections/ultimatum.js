GameStatus = new Mongo.Collection('game-status');
Games = {
  settings: {
    ultimatum: {
      steps: 7
    },
    anchoring: {
      steps: 3
    },
    zincit: {
      steps: 8,
      name: 'The Zincit case',
      roles: {
        hasan: 'Dr. Hasan',
        sam: 'Sam Massey',
        zincit: 'Zincit Rep.'
      },
    } 
  }
}

var allowedGames = {};
_.each(_.keys(Games.settings), function(k){
  allowedGames[k] = true;
});

console.log(allowedGames);

var checkRound = function (round) {
    check(round, Match.Integer);
    if (round < 0 || round > 1) {
      throw new Meteor.Error(500, 'Bad data!');
    };
}

var setRoundData = function (key, data) {
  var set = {};
  set[key] = data;
  var results = GameStatus.update(
      {key: 'ultimatum', userId: Meteor.userId() },
      {$set: set}
  );
  if (results !== 1) {
    throw new Meteor.Error(400, 'Bad request!');      
  };
}
Games.allowedGames = allowedGames;
Games.checkRound = checkRound;
Games.setRoundData = setRoundData;

var populateCDF = function(x, y){
  // Overwrites the y array. Assumes the values of x are =
  // less than the length of y!

  // First count occurances of each player2 amount
  for (var i = x.length - 1; i >= 0; i--) {
    y[x[i]] += 1;
  };

  // Now turn into a CDF by dividing by the number
  // of observations to get a probability and then
  // accumulating the probabilities.
  for (var i = 0; i < y.length; i++) {
    y[i] /= x.length;
    if (i > 0) {
      y[i] += y[i-1];
    };
  };
}


var payoffCDF = function(player1amounts, player2amounts){

  if (player1amounts.length !== player2amounts.length) {
    throw new Meteor.Error(400, 'bad array lengths!');
  };
  var numPlayers = player1amounts.length;

  function newArray () {
    return Array.apply(null, new Array(101)).map(Number.prototype.valueOf,0);
  }

  // An array where player2CDF[i] is the cumulative probability
  // of player2 numbers <= i.
  var player2CDF = newArray();
  populateCDF(player2amounts, player2CDF);

  // The payoff for player1 at each i. Player1 is paid
  // if player2 would have accepted their offer of i.
  // So, their payoff is (100 - i) * probability that
  // the other people would have accepted their offer
  // in the role of player2. That is, the fraction of
  // player2 numbers that are less than or equal to i,
  // or player2CDF[i].
  //
  var player1payoffs = newArray();
  for (var i = 0; i < player1payoffs.length; i++) {
    player1payoffs[i] = (100 - i) * player2CDF[i];
  };

  var player1CDF = newArray();
  populateCDF(player1amounts, player1CDF);

  var player2CDF = newArray();
  populateCDF(player2amounts, player2CDF);

  // The payoff for player2 at each i. Player2 is 
  // paid if player1 would have offered more than
  // they demanded. They receive player1's offer
  // in the case that player1's offer is more than
  // their demand. They receive zero if player1's
  // offer is less than their demand.
  var player2payoffs = newArray();

  // Working from the largest player1 amounts to the smallest
  var sortedPlayer1amounts = player1amounts.concat().sort(function(a,b){
    return a - b;
  });

  var j = numPlayers - 1;

  // Keep a running sum so we can take an average
  var runningSum = 0;

  // Working backwards from 100 and backwards from the 
  // max player1 offer.
  for (var i = player2payoffs.length - 1; i >= 0; i--) {

    // If there are no more offers or the current
    // amount is greater than the current max offer
    if (j < 0 || i > sortedPlayer1amounts[j]) {

      // Just copy the payoff from the next highest
      // amount because nothing has changed.
      if (i === player2payoffs.length - 1) {

        // Of course, there is no value to copy if
        // we're at 100.
        player2payoffs[i] = 0
      }else{
        player2payoffs[i] = player2payoffs[i+1];
      };

    }else if (j >= 0){

      // If the current amount is equal to the max
      // offer, add those to the running sum.
      while(j >= 0 && i === sortedPlayer1amounts[j]){
        console.log('adding ', i, 'to running sum');
        runningSum += i;
        j--;
      }

      // We've decremented i to the point that we now
      // have new player1s that are paying out.
      // The payoff for player2 is the average of the
      // payoffs they would have received across all
      // players at this particular i.
      player2payoffs[i] = runningSum / numPlayers;
    };
  };

  return {
    player1CDF: player1CDF,
    player1payoffs: player1payoffs,
    player1amounts: player1amounts,
    player2CDF: player2CDF,
    player2payoffs: player2payoffs,
    player2amounts: player2amounts
  }
};

var results = payoffCDF([5, 30, 50], [51, 20, 30]);
if (results.player2payoffs[0] !== (85/3)) {
  console.log(results.player2amounts);
  throw "Bad results from payoffCDF!!!";
};


Meteor.methods({
  // Create a new game. There are only two games
  // right now.
  initiateNewGame: function (gameKey) {
    if (Meteor.isServer) {
      check(gameKey, String);

      if (!_.has(allowedGames, gameKey)) {
        throw new Meteor.Error(400, 'Bad request!');
      };

      var game = GameStatus.findOne({
        key: gameKey, userId: Meteor.userId()
      });
      if (!game) {
        var id = GameStatus.insert({
          key: gameKey,
          userId: Meteor.userId(),
          step: 0,
          rounds: []
        });
        console.log('Added GameStatus:', id);
      }else{
        console.log('Alreay have GameStatus');
      };      
    };
  },
  incrementGameStep: function(gameKey){
    check(gameKey, String);

    if (!_.has(allowedGames, gameKey)) {
      throw new Meteor.Error(400, 'Bad request!');
    };
    var result = GameStatus.upsert(
      {key: gameKey, userId: Meteor.userId()},
      {$inc: {step: 1}}
    );
    console.log('Increment GameStatus step with result', result);

  },
  setUltimatumAmounts: function(a1, a2, round){
    check(a1, Match.Integer);
    check(a2, Match.Integer);
    if (a1 < 0 || a1 > 100 || a2 < 0 || a2 > 100) {
      throw new Meteor.Error(500, 'Bad data!');
    };
    checkRound(round);
    setRoundData('rounds.' + round, {
      amounts: {player1: a1, player2: a2},
      acceptsOwn: a1 >= a2
    });
  },
  setRoundDecision: function (decision, round) {
    checkRound(round);
    check(decision, String);
    if (decision !== 'accept' && decision !== 'reject') {
      throw new Meteor.Error(400, 'Bad request!');
    };
    setRoundData('rounds.' + round + '.accepted', decision === 'accept');
  },
  // Retreive the number of game plays that are internally consistent
  // and inconsistent: that is, those that accept or reject their own offers.
  getNumAcceptingOwn: function(round){
    checkRound(round);
    var qtrue = {},
        qfalse = {};
    qtrue['rounds.' + round + '.acceptsOwn']= true;
    qfalse['rounds.' + round + '.acceptsOwn']= false;
    return {
      acceptedOwn: GameStatus.find(qtrue).count(),
      rejectedOwn: GameStatus.find(qfalse).count()
    }
  },
  getPayoffCDF: function(round){
    checkRound(round);
    var playedGames = GameStatus.find({
      key: 'ultimatum',
      step: {$gte: 7}
    }).fetch();

    var player1amounts = [];
    var player2amounts = [];
    for (var i = playedGames.length - 1; i >= 0; i--) {
      player1amounts.push(playedGames[i].rounds[round].amounts.player1);
      player2amounts.push(playedGames[i].rounds[round].amounts.player2);
    };

    return payoffCDF(player1amounts, player2amounts);
  },  

});
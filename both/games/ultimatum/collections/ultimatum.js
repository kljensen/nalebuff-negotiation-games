GameStatus = new Mongo.Collection('game-status');
Games = {}

var allowedGames = {
  'ultimatum': true,
  'anchoring': true
};

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

    function newArray () {
      return Array.apply(null, new Array(101)).map(Number.prototype.valueOf,0);
    }

    var acceptProbability = newArray();
    var demandProbability = newArray();
    var acceptPayoffs = newArray();
    var demandPayoffs = newArray();

    _.each(playedGames, function(gs){
      var amounts = gs.rounds[round].amounts;
      for (var i = amounts.player1; i >= 0; i--) {
        demandProbability[i] += 1;
        demandPayoffs[i] += amounts.player1;
      };
      for (var i = amounts.player2; i <= 100; i++) {
        acceptProbability[i] += 1;
      };
    });
    var numPlayedGames = demandProbability[0];
    console.log('numPlayedGames =', numPlayedGames);
    console.log('demandPayoffs = ', demandPayoffs);
    for (var i = demandProbability.length - 1; i >= 0; i--) {
      demandProbability[i] /= numPlayedGames;
      acceptProbability[i] /= numPlayedGames;
      demandPayoffs[i] /= numPlayedGames;
    };
    console.log('NOW');
    console.log('demandPayoffs = ', demandPayoffs);


    var acceptPayoffs = _.map(acceptProbability, function(v, i){
      return Math.round(100 - (i * v), 1);
    });

    return {
      acceptProbability: acceptProbability,
      demandProbability: demandProbability,
      demandPayoffs: demandPayoffs,
      acceptPayoffs: acceptPayoffs,
    }
  },  

});
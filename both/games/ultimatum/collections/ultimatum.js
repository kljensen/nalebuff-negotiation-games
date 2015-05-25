GameStatus = new Mongo.Collection('game-status');

var allowedGames = {
  'ultimatum': 1
};

var checkRound = function (round) {
    check(round, Match.Integer);
    if (round < 0 || round > 1) {
      throw new Meteor.Error(500, 'Bad data!');
    };
}

var setRoundData = function (round, data) {
  var set = {};
  set['rounds.' + round] = data;
  var results = GameStatus.update(
      {key: 'ultimatum', userId: Meteor.userId() },
      {$set: set}
  );
  if (results !== 1) {
    throw new Meteor.Error(400, 'Bad request!');      
  };
}

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
    setRoundData(round, {amounts: {player1: a1, player2: a2}});
  },
  setRoundDecision: function (decision, round) {
    checkRound(round);
    check(decision, String);
    if (decision !== 'accept' && decision !== 'reject') {
      throw new Meteor.Error(400, 'Bad request!');
    };
    setRoundData(round, {accepted: decision === 'accept'});
  }

});
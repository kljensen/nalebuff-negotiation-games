GameStatus = new Mongo.Collection('game-status');

var allowedGames = {
  'ultimatum': 1
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
          step: 0
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
  setUltimatumAmounts: function(a1, a2){
    check(a1, Number);
    check(a2, Number);
    if (a1 < 0 || a1 > 100 || a2 < 0 || a2 > 100) {
      throw new Meteor.Error(500, 'Bad data!');
    };
    var results = GameStatus.update(
        {key: 'ultimatum', userId: Meteor.userId() },
        {$set: {amounts: {player1: a1, player2: a2}}}
    );
    if (results !== 1) {
      throw new Meteor.Error(400, 'Bad request!');      
    };
  }

});
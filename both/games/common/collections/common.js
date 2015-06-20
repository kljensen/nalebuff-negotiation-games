var getGameStatus = function(gameKey){
  var game = GameStatus.findOne({
    key: gameKey, userId: Meteor.userId()
  });
  if (!game) {
    throw new Meteor.Error(500, 'Bad data!');
  };
  return game;
}

checkIntInRange = function(x, min, max){
  check(x, Match.Integer);
  if (!(x >= min && x <= max)) {
    throw new Meteor.Error(400, 'Bad value: ' + x);      
  };
  return parseInt(x);
}

updateGameStatus = function(gameKey, update){
  var query = {key: gameKey, userId: Meteor.userId()};
  var numAffected = GameStatus.update(query, {$set: update});
  if (numAffected === 0) {
    throw new Meteor.Error(404, 'No such game!');
  };
  return numAffected;
};
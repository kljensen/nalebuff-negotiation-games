var gameKey = 'zincit';

var getGame = function(){
  var game = GameStatus.findOne({
    key: gameKey, userId: Meteor.userId()
  });
  if (!game) {
    throw new Meteor.Error(500, 'Bad data!');
  };
  return game;
}

Meteor.methods({
  'setZincitRole': function(role){
    check(role, String);
    if (!_.has(Games.settings[gameKey].roles, role)) {
      throw new Meteor.Error(400, 'Bad role!');     
    };
    var game = getGame();
    GameStatus.update({_id: game._id}, {$set: {role: role}});
  },
  'setZincitAgreementStatus': function(agreementStatus){
    check(agreementStatus, String);

    if (agreementStatus !== 'no' && agreementStatus !== 'yes') {
      throw new Meteor.Error(400, 'Bad agreement status!');
    };
    var game = getGame();
    GameStatus.update({_id: game._id}, {$set: {agreementStatus: agreementStatus}});
  }

});
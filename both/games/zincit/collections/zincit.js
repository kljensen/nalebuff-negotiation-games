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
    validStatuses = {no: false, yes: true};
    if (!_.has(validStatuses, agreementStatus)) {
      throw new Meteor.Error(400, 'Bad agreement status!');
    };
    agreementStatus = validStatuses[agreementStatus];
    var game = getGame();
    GameStatus.update({_id: game._id}, {$set: {agreementStatus: agreementStatus}});
  },
  'setZincitAmounts': function(upfront, bonus){
    check(upfront, Match.Integer);
    check(bonus, Match.Integer);
    if (upfront < 0 || upfront > 1000 || bonus < 0 || bonus > 1000) {
      throw new Meteor.Error(400, 'Bad agreement amounts!');      
    };
    var game = getGame();
    GameStatus.update({_id: game._id}, {$set: {
      amounts: {
        upfront: upfront,
        bonus: bonus        
      }
    }});
  }


});
Meteor.methods({
  'resetGame': function(gameStatusId){
    if (Roles.userIsInRole(this.userId, 'admin')) {
      GameStatus.update({_id: gameStatusId}, {$set: {step: 0}});
    }
  },
  'deleteGame': function(gameStatusId){
    if (Roles.userIsInRole(this.userId, 'admin')) {
      GameStatus.remove({_id: gameStatusId});
    }
  },
});
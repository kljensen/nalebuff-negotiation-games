Meteor.publish("game-status", function (gameKey) {
  return GameStatus.find({key: gameKey, userId: this.userId});
});


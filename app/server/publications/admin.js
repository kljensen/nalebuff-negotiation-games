Meteor.publish("admin-data", function (gameKey) {
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return [
  		GameStatus.find({}),
      Meteor.users.find({})
  	];
  }
  return [];
});


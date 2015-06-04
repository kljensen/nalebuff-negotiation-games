Meteor.methods({
  'setAnchoringRandomNumber': function(num){
    check(num, Match.Integer);
    num = parseInt(num);
    var game = GameStatus.findOne({
        key: 'anchoring', userId: Meteor.userId()
    });

    if (!game || num < 0 || num > 100) {
      throw new Meteor.Error(500, 'Bad data!');
    };
    GameStatus.update({_id: game._id}, {$set: {randomNumber: num}});

    console.log(game);
  },
  'setAnchoringDirection': function(direction){
    check(direction, String);
    var validDirections = {'more': true, 'less': true, 'same': true};
    var game = GameStatus.findOne({
        key: 'anchoring', userId: Meteor.userId()
    });
    if (!game || !_.has(validDirections, direction)) {
      throw new Meteor.Error(400, 'Bad data!');
    };
    GameStatus.update({_id: game._id}, {$set: {direction: direction}});
  },
  'setAnchoringPrice': function(price){
    check(price, Match.Integer);
    price = parseInt(price);
    var game = GameStatus.findOne({
        key: 'anchoring', userId: Meteor.userId()
    });

    if (!game || price < 0 || price > 999) {
      throw new Meteor.Error(400, 'price is out of range');
    };
    if (game.direction === 'more' && price < game.randomNumber) {
      throw new Meteor.Error(400, 'price lower than min');      
    };
    if (game.direction === 'less' && price > game.randomNumber) {
      throw new Meteor.Error(400, 'price higher than max');      
    };
    GameStatus.update({_id: game._id}, {$set: {price: price}});
  },
});

Meteor.methods({
  'setAnchoringRandomNumber': function(num){
    verifyUserIsLoggedIn();
    check(num, Match.Integer);
    num = parseInt(num);
    var game = GameStatus.findOne({
        key: 'anchoring', userId: Meteor.userId()
    });

    if (!game || num < 0 || num > 999) {
      throw new Meteor.Error(500, 'Bad data!');
    };
    GameStatus.update({_id: game._id}, {$set: {randomNumber: num}});

    // console.log(game);
  },
  'setAnchoringDirection': function(direction){
    verifyUserIsLoggedIn();
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
    verifyUserIsLoggedIn();
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
  'getAnchorPriceDistribution': function(){
    verifyUserIsLoggedIn();
    var games = GameStatus.find({key: 'anchoring'}).fetch();
    var ranges = [
      {min: 0, max: 250, prices: []},
      {min: 250, max: 500, prices: []},
      {min: 500, max: 750, prices: []},
      {min: 750, max: 1000, prices: []}
    ];
    for (var i = games.length - 1; i >= 0; i--) {
      if(!_.has(games[i], 'price') || !_.has(games[i], 'randomNumber')){
        continue;
      }
      for (var j = ranges.length - 1; j >= 0; j--) {
        if (games[i].randomNumber > ranges[j].min && games[i].randomNumber <= ranges[j].max) {
          ranges[j].prices.push(games[i].price);
          break;
        };
      };
    };
    for (var j = ranges.length - 1; j >= 0; j--) {
      ranges[j].stats = getStatisticalMoments(ranges[j].prices);
    };
    // console.log('Done with ranges =', ranges);
    return ranges;
  }
});

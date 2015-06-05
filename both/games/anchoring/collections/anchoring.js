
var median = function(values) {

  values.sort( function(a,b) {return a - b;} );

  var half = Math.floor(values.length/2);

  if(values.length % 2){
    return values[half];
  }else{
      return (values[half-1] + values[half]) / 2.0;
  }
};

var getStats = function(a) {
  var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
  r.median = median(a);
  if (a.length === 0) {
    r.empty = true;
  }else{
    r.empty = false;
  };
  for(var m, s = 0, l = t; l--; s += a[l]);
  for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
  return r.deviation = Math.sqrt(r.variance = s / t), r;
}

Meteor.methods({
  'setAnchoringRandomNumber': function(num){
    check(num, Match.Integer);
    num = parseInt(num);
    var game = GameStatus.findOne({
        key: 'anchoring', userId: Meteor.userId()
    });

    if (!game || num < 0 || num > 999) {
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
  'getAnchorPriceDistribution': function(){
    var games = GameStatus.find({key: 'anchoring'}).fetch();
    var ranges = [
      {min: 0, max: 250, prices: []},
      {min: 250, max: 500, prices: []},
      {min: 500, max: 750, prices: []},
      {min: 750, max: 1000, prices: []}
    ];
    for (var i = games.length - 1; i >= 0; i--) {
      if(!_.has(games[i], 'price')){
        continue;
      }
      var price = games[i].price;
      for (var j = ranges.length - 1; j >= 0; j--) {
        if (price > ranges[j].min && price <= ranges[j].max) {
          ranges[j].prices.push(price);
          break;
        };
      };
    };
    for (var j = ranges.length - 1; j >= 0; j--) {
      ranges[j].stats = getStats(ranges[j].prices);
    };
    console.log('Done with ranges =', ranges);
    return ranges;
  }
});
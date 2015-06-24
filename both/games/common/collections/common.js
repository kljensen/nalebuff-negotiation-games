
verifyUserIsLoggedIn = function(){
  if (!Meteor.userId()) {
    throw new Meteor.Error(403, "You must be logged in to do that");
    return false;
  }
  return true;
}

var median = function(values) {

  values.sort( function(a,b) {return a - b;} );

  var half = Math.floor(values.length/2);

  if(values.length % 2){
    return values[half];
  }else{
      return (values[half-1] + values[half]) / 2.0;
  }
};

getStatisticalMoments = function(a) {
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

getGameStatus = function(gameKey){
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

callMethodWithNumber = function(gameKey, selector, min, max, methodName){
  var value = parseInt($(selector).val());
  if (value >= min && value <= max && noErrorDiv()) {
    Meteor.call(methodName, value, function(){
      Meteor.call('incrementGameStep', gameKey);        
    });
  }else{
    console.log('Bad number for "', selector, '": ', value);
  }
};

callMethodWithString = function(gameKey, selector, minLength, maxLength, methodName){
  var value = $(selector).val();
  if (value.length >= minLength && value.length <= maxLength && noErrorDiv()) {
    Meteor.call(methodName, value, function(){
      Meteor.call('incrementGameStep', gameKey);        
    });
  }else{
    console.log('Bad string for "', selector, '": ', value);
  }
};
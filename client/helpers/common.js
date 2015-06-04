Template.registerHelper('formatDate', function(date, dateFormat){
    return moment(date).format(dateFormat);
})

Template.registerHelper('equals', function (a, b) {
      return a === b;
});

Template.registerHelper('sessionVariableEquals', function (key, value) {
      return Session.get(key) === value;
});

Template.registerHelper('log', function(){
    console.log(this);
});

Template.registerHelper('getSessionVariable', function(x){
  console.log('in getSessionVariable');
  console.log(Session.get(x));
    return Session.get(x);
});  

Template.registerHelper('pluralize', function(x, w1, w2){
  if (x > 1) {
    return w2;
  };
  return w1;
});

Template.registerHelper('englishNumber', function(x){
    var numbers = {
      1: 'one',
      2: 'two',
      3: 'three',
      4: 'four',
      5: 'five',
      6: 'six',
      7: 'seven',
      8: 'eight',
      9: 'nine',
      10: 'ten'
    };
    if (_.has(numbers, x)) {
      return numbers[x];
    };
    return x;
});  
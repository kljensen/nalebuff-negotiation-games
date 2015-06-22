Template.registerHelper('formatDate', function(date, dateFormat){
    return moment(date).format(dateFormat);
})

Template.registerHelper('equals', function (a, b) {
      return a === b;
});

Template.registerHelper('toFixed', function (a, b) {
      return a.toFixed(b);
});


Template.registerHelper('sessionVariableEquals', function (key, value) {
      return Session.get(key) === value;
});

Template.registerHelper('log', function(){
    console.log(this);
});

Template.registerHelper('getSessionVariable', function(x){
    return Session.get(x);
});

Template.registerHelper('pluralize', function(x, w1, w2){
  if (x > 1) {
    return w2;
  };
  return w1;
});

var toTitleCase = function(string)
{
    // \u00C0-\u00ff for a happy Latin-1
    return string.toLowerCase().replace(/_/g, ' ').replace(/\b([a-z\u00C0-\u00ff])/g, function (_, initial) {
        return initial.toUpperCase();
    }).replace(/(\s(?:de|a|o|e|da|do|em|ou|[\u00C0-\u00ff]))\b/ig, function (_, match) {
        return match.toLowerCase();
    });
}

Template.registerHelper('englishNumber', function(x, capitalize){
    var numbers = {
      0: 'zero',
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
      if (capitalize === true) {
        return toTitleCase(numbers[x]);
      };
      return numbers[x];
    };
    return x;
});  
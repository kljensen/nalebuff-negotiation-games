if (Meteor.isClient) {

  var gameKey = 'outpsider';

  var getSettings = function(){
    return Games.settings[gameKey];
  }
  var goToNextStep = function(err, result){
    if (!err) {
      Meteor.call('incrementGameStep', gameKey);
    }else{
      console.log('error: ', err);
    };
  };
  var callMethodWithRadioValue = function(inputName, methodName){
    var value = $('input[name=' + inputName + ']:checked').val();
    if (value && value.length > 0) {
      Meteor.call(methodName, value, goToNextStep);
    }
  };

  var getRoles = function(){
    return _.map(Games.settings[gameKey].roles, function(v, k){
      return {name: v, key: k}
    });
  };

  Template['outpsider-0'].helpers({
    roles: getRoles
  });

  var advanceIfFalse = function(attribute){
    return function(){
      var game = getGame(gameKey);
      if (game[attribute] === false) {
        Meteor.call('incrementGameStep', gameKey);
      };      
    }
  };

  Template['outpsider-2'].onCreated(advanceIfFalse('agreementStatus'));
  Template['outpsider-3'].onCreated(advanceIfFalse('agreementStatus'));
  Template['outpsider-4'].onCreated(advanceIfFalse('agreementStatus'));

  Template['outpsider-4'].onCreated(function(){
    this.freeAdsStill = new ReactiveVar('no');
    this.hadNoncash = new ReactiveVar('no');
  });

  var setReactiveVarFromRadio = function(attribute){
    return function(event, template, el){
      template[attribute].set(event.target.value);
    }
  }

  Template['outpsider-4'].events({
    'change input[name="freeAdsStill"]': setReactiveVarFromRadio('freeAdsStill'),
    'change input[name="hadNoncash"]': setReactiveVarFromRadio('hadNoncash'),
  });
  var trueForYes = function(attribute){
    return function(){
      var t = Template.instance();
      if (_.has(t, attribute)) {
        var val = t[attribute].get();
        if (val === 'yes') {
          return true;
        };
      };
      return false;
    }
  };
  Template['outpsider-4'].helpers({
    'freeAdsStill': trueForYes('freeAdsStill'),
    'hadNoncash': trueForYes('hadNoncash')
  });

  Template['outpsider-5'].onCreated(function(){
    this.outcomeStats = new ReactiveVar();
    this.outcomeStats.set({foo: 'bar'});
  });

  var calculateOutcomes = function(){
    var outcomes = {
      cade: 80000,
      helen: 80000,
      pat: 0
    };
    var game = getGameStatus(gameKey);
    var settings = Games.settings[gameKey];
    var patViolatedConstraint;
    if (game.agreementStatus === false) {
      return outcomes;
    }



    // Main outcome calc
    // 
    var patPayment = game.patPayment;
    var nonCashValue = game.hadNoncash ? game.numFreePages * 2500 : 0;
    var totalValue = patPayment + nonCashValue;
    if (totalValue > 500000) {
      outcomes.cade = settings.numShares.cade * totalValue / settings.numShares.total;
      outcomes.helen = outcomes.cade;
    }else{
      if (!game.helenSharedLoss && !game.hadNoncash) {
        outcomes.cade = patPayment - 400000;
        outcomes.helen = 100000;
      }else if(game.helenSharedLoss && !game.hadNoncash){
        outcomes.cade = (patPayment - 300000)/2;
        outcomes.helen = outcomes.cade;
      }else if(game.helenSharedLoss && game.hadNoncash){
        outcomes.cade = (patPayment + game.numFreePages * 2500 - 300000)/2;
        outcomes.helen = outcomes.cade;
      };
      
    };

    // Penalizing Pat
    if (patPayment > 470000) {
      outcomes.pat = -250000;
      patViolatedConstraint = true;
    }else{
      outcomes.pat = 245800*5 - patPayment;
      patViolatedConstraint = false;
    };
    return outcomes;
  };

  Template['outpsider-5'].helpers({
    outcomeStats: function(){
      if (_.has(Template.instance(), 'outcomeStats')) {
        var outcomeStats = Template.instance().outcomeStats.get();
        return outcomeStats;
      };
      return null;
    },
    roleOutcomes: function(){
      var outcomes = calculateOutcomes();
      console.log('outcomes =', outcomes);
      var game = getGameStatus(gameKey);

      return _.map(getRoles(), function(r){
        r.outcome = outcomes[r.key];
        console.log('r.outcome =', r.outcome);
        r.ownRole = r.key === game.role ? true : false;
        return r;
      });
    }
  });


  Template.genericGameLayout.events({
   'click button.nextStep.outpsider-0': function(e){
      callMethodWithRadioValue('role', 'setOutpsiderRole');
    },
   'click button.nextStep.outpsider-1': function(e){
      callMethodWithRadioValue('agreement', 'setOutpsiderAgreementStatus');
    },
  'click button.nextStep.outpsider-2': function(e){
      callMethodWithNumber(gameKey, 'input#patPayment', 1, 1000000, 'setOutpsiderPatPayment');
    },
   'click button.nextStep.outpsider-3': function(e){
      console.log('clicked!');
      callMethodWithRadioValue('helenSharedLoss', 'setOutpsiderHelenSharedLoss');
    },
   // 'click button.nextStep.outpsider-4': function(e){
   //    callMethodWithRadioValue('hadNoncash', 'setOutpsiderHadNoncash');
   //  },
   // 'click button.nextStep.outpsider-4': function(e){
   //    callMethodWithString(gameKey, '#noncash', 0, 500, 'setOutpsiderNoncashDescription');
   //  },
   'click button.nextStep.outpsider-4': function(e){
      var hadNoncash, noncashDescription, freeAdsStill, freePagesCountedAgainst, numFreePages;

      var hadNoncash = $('input[name="hadNoncash"]:checked').val();
      if (hadNoncash === 'yes') {
        noncashDescription = $('textarea#noncashDescription').val();
        freeAdsStill = $('input[name="hadNoncash"]').val();
        numFreePages = parseInt($('input[name="numFreePages"]').val());
      };
      if (noErrorDiv()) {
        console.log('noErrorDiv!');
        Meteor.call(
          'setOutpsiderNoncash',
          hadNoncash,
          noncashDescription,
          freeAdsStill,
          numFreePages,
          goToNextStep
        );
      }else{
        console.log('error on page!!');
      };
    },
  });

};

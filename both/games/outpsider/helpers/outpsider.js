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
    return getRolesForGame(gameKey);
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



  Template['outpsider-5'].helpers({
    outcomeStats: function(){
      if (_.has(Template.instance(), 'outcomeStats')) {
        var outcomeStats = Template.instance().outcomeStats.get();
        return outcomeStats;
      };
      console.log('returning null in outcomeStats/!');
      return null;
    },
    roleOutcomes: function(){
      var game = getGameStatus(gameKey);
      return getRoleOutcomesForGame(game);
    }
  });

  Template['outpsider-5'].onCreated(function(){
    console.log('woot 0');
    var dis = this;
    var game = getGame(gameKey);
    var wrapper;
    dis.outcomeStats = new ReactiveVar(null);


    if(!_.has(game, 'outcomes')){
      wrapper = function(cb){
        return Meteor.call('calculateOutpsiderOutcome', cb);
      }
    }else{
      wrapper = function(cb){
        return cb();
      }      
    }
    console.log('woot 1');
    wrapper(function(){
      console.log('woot 2');
      Meteor.call('getOutpsiderOutcomeDistribution', function(err, result){
        console.log('woot 3');
        console.log('err = ', err);
        if(typeof(err) === 'undefined'){
          console.log('woot 4');
          dis.outcomeStats.set(result);
        }
      });
    });

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

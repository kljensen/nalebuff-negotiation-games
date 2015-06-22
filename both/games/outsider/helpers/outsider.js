if (Meteor.isClient) {

  var gameKey = 'outsider';

  var getSettings = function(){
    return Games.settings[gameKey];
  }
  var goToNextStep = function(err, result){
    if (!err) {
      Meteor.call('incrementGameStep', gameKey);
    }else{
    };
  };
  var callMethodWithRadioValue = function(inputName, methodName){
    var value = $('input[name=' + inputName + ']:checked').val();
    if (value && value.length > 0) {
      Meteor.call(methodName, value, goToNextStep);
    }
  };

  Template['outsider-0'].helpers({
    roles: function(){
      return _.map(Games.settings[gameKey].roles, function(v, k){
        return {name: v, key: k}
      });
    }
  });

  var advanceIfFalse = function(attribute){
    return function(){
      var game = getGame(gameKey);
      if (game[attribute] === false) {
        Meteor.call('incrementGameStep', gameKey);
      };      
    }
  };

  Template['outsider-2'].onCreated(advanceIfFalse('agreementStatus'));
  Template['outsider-3'].onCreated(advanceIfFalse('agreementStatus'));

  Template['outsider-4'].onCreated(function(){
    this.freeAdsStill = new ReactiveVar('no');
    this.hadNoncash = new ReactiveVar('no');
  });

  var setReactiveVarFromRadio = function(attribute){
    return function(event, template, el){
      template[attribute].set(event.target.value);
    }
  }

  Template['outsider-4'].events({
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
  Template['outsider-4'].helpers({
    'freeAdsStill': trueForYes('freeAdsStill'),
    'hadNoncash': trueForYes('hadNoncash')
  });

  Template.genericGameLayout.events({
   'click button.nextStep.outsider-0': function(e){
      callMethodWithRadioValue('role', 'setOutsiderRole');
    },
   'click button.nextStep.outsider-1': function(e){
      callMethodWithRadioValue('agreement', 'setOutsiderAgreementStatus');
    },
  'click button.nextStep.outsider-2': function(e){
      callMethodWithNumber(gameKey, 'input#patPayment', 1, 1000000, 'setOutsiderPatPayment');
    },
   'click button.nextStep.outsider-3': function(e){
      console.log('clicked!');
      callMethodWithRadioValue('helenSharedLoss', 'setOutsiderHelenSharedLoss');
    },
   // 'click button.nextStep.outsider-4': function(e){
   //    callMethodWithRadioValue('hadNoncash', 'setOutsiderHadNoncash');
   //  },
   // 'click button.nextStep.outsider-4': function(e){
   //    callMethodWithString(gameKey, '#noncash', 0, 500, 'setOutsiderNoncashDescription');
   //  },
   'click button.nextStep.outsider-4': function(e){
      var hadNoncash, noncashDescription, freeAdsStill, freePagesCountedAgainst, numFreePages;

      var hadNoncash = $('input[name="hadNoncash"]:checked').val();
      if (hadNoncash === 'yes') {
        noncashDescription = $('textarea#noncashDescription').val();
        freeAdsStill = $('input[name="hadNoncash"]').val();
        freePagesCountedAgainst = $('input[name="freePagesCountedAgainst"]:checked').val();
        numFreePages = parseInt($('input[name="numFreePages"]').val());
      };
      if (noErrorDiv()) {
        Meteor.call(
          'setOutsiderNoncash',
          hadNoncash,
          noncashDescription,
          freeAdsStill,
          freePagesCountedAgainst,
          numFreePages,
          goToNextStep
        );
      };
      console.log('hadNoncash =', hadNoncash);
      console.log('noncashDescription =', noncashDescription);
      console.log('freeAdsStill =', freeAdsStill);
      console.log('numFreePages =', numFreePages);
      console.log('freePagesCountedAgainst =', freePagesCountedAgainst);
    },
  });

};
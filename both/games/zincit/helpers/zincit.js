if (Meteor.isClient) {

  var gameKey = 'zincit';

  var getSettings = function(){
    return Games.settings[gameKey];
  }

  Template['zincit-0'].helpers({
    roles: function(){
      return _.map(Games.settings[gameKey].roles, function(v, k){
        return {name: v, key: k}
      });
    }
  });
  Template['zincit-2'].helpers({
    agreementStatus: function(){
      var game = getGame(gameKey);
      return game.agreementStatus;
    }
  });
  Template['zincit-6'].created = function(){
    var game = getGame(gameKey);
    if (game.renegotiatedLawyer === false) {
      Meteor.call('incrementGameStep', gameKey);
    };
  };
  Template['zincit-2'].created = function(){
    var game = getGame(gameKey);
    if (game.agreementStatus === false) {
      Meteor.call('incrementGameStep', gameKey);
    };
  };
  Template['zincit-7'].onCreated(function(){
    var dis = this;
    var game = getGame(gameKey);
    var wrapper;
    dis.outcomeStats = new ReactiveVar(null);


    if(!_.has(game, 'outcomes')){
      wrapper = function(cb){
        return Meteor.call('calculateZincitOutcome', cb);
      }
    }else{
      wrapper = function(cb){
        return cb();
      }      
    }
    wrapper(function(){
      Meteor.call('getZincitOutcomeDistribution', function(err, result){
        if(typeof(err) === 'undefined'){
          dis.outcomeStats.set(result);
        }
      });
    });

  });
  Template['zincit-7'].helpers({
    outcomeStats: function(){
      if (_.has(Template.instance(), 'outcomeStats')) {
        var outcomeStats = Template.instance().outcomeStats.get();
        return outcomeStats;
      };
      return null;
    },
    roleOutcomes: function(){
      var game = getGameStatus(gameKey);
      return getRoleOutcomesForGame(game);
    }
  });

  Template['zincit_rolestats'].helpers({
    zscore: function(){
      var mean = Template.instance().data.mean;
      var deviation = Template.instance().data.deviation;
      var amount = Template.instance().data.amount;
      var zscore = 0;
      var sameAsMean = false;
      var direction;
      if (deviation !== 0) {
        zscore = (amount - mean) / deviation;
      };
      if(zscore < 0){
        direction = 'less';
      }else{
        direction = 'more';
      };
      if(deviation === 0 || zscore === 0){
        sameAsMean = true;
      }
      return {
        value: Math.abs(zscore),
        sameAsMean: sameAsMean,
        direction: direction
      };
    }
  });

  var goToNextStep = function(err, result){
    if (!err) {
      Meteor.call('incrementGameStep', gameKey);
    }else{
    };
  };

  var callMethodWithValue = function(inputName, methodName){
    var value = $('input[name=' + inputName + ']:checked').val();
    if (value && value.length > 0) {
      Meteor.call(methodName, value, goToNextStep);
    }else{
    }
  };

  Template.genericGameLayout.events({
   'click button.nextStep.zincit-0': function(e){
      callMethodWithValue('role', 'setZincitRole');
    },
   'click button.nextStep.zincit-1': function(e){
      callMethodWithValue('agreement', 'setZincitAgreementStatus');
    },
    'click button.nextStep.zincit-2': function(e){
      var upfront = parseInt($('input#upfront').val());
      var bonus = parseInt($('input#bonus').val());
      if (upfront > 0 && bonus > 0 && noErrorDiv()) {
        Meteor.call('setZincitAmounts', upfront, bonus, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
      }
    },
    'click button.nextStep.zincit-3': function(e){
      var negotiationTime = parseInt($('input#negotiationTime').val());
      if (negotiationTime > 0 && negotiationTime <= 120 && noErrorDiv()) {
        Meteor.call('setZincitNegotiationTime', negotiationTime, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
      }
    },
   'click button.nextStep.zincit-4': function(e){
      callMethodWithValue('calculatedPie', 'setZincitCalculatedPie');
    },
   'click button.nextStep.zincit-5': function(e){
      callMethodWithValue('renegotiatedLawyer', 'setZincitRenegotiatedLawyer');
    },
   'click button.nextStep.zincit-6': function(e){
      var lawyerUpfront = parseInt($('input#lawyerUpfront').val());
      var lawyerBonus = parseInt($('input#lawyerBonus').val());
      if (lawyerUpfront > 0 && lawyerBonus > 0 && noErrorDiv()) {
        Meteor.call('setZincitLawyerPercents', lawyerUpfront, lawyerBonus, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
      }
    },
  });

};
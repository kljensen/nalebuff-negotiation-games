if (Meteor.isClient) {

  var gameKey = 'zincit';

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

  var goToNextStep = function(err, result){
    if (!err) {
      Meteor.call('incrementGameStep', gameKey);
    };    
  };

  Template.genericGameLayout.events({
   'click button.nextStep.zincit-0': function(e){
      var role = $('input[name=role]:checked').val();
      if (role) {
        Meteor.call('setZincitRole', role, goToNextStep);
      }
    },
   'click button.nextStep.zincit-1': function(e){
      var agreementStatus = $('input[name=agreement]:checked').val();
      if (agreementStatus) {
        Meteor.call('setZincitAgreementStatus', agreementStatus, goToNextStep);
      }
    },
    'click button.nextStep.zincit-2': function(e){
      var upfront = parseInt($('input#upfront').val());
      var bonus = parseInt($('input#bonus').val());
      if (upfront > 0 && bonus > 0 && noErrorDiv()) {
        console.log('no error on page!');
        Meteor.call('setZincitAmounts', upfront, bonus, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }else{
        console.log('error on page!')
      }
    }
  });

};
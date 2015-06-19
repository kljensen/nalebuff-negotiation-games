if (Meteor.isClient) {

  var gameKey = 'zincit';
  Template['zincit-0'].helpers({
    roles: function(){
      return _.map(Games.settings[gameKey].roles, function(v, k){
        return {name: v, key: k}
      });
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
    }
  });

};
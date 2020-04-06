Template.index.helpers({
  siteName: function(){
    return Meteor.settings.public.siteName;
  },
  usingCas: function(){
    if(Meteor.settings.public.auth === 'cas'){
      return true;
    }
    return false;
  }
});

Template.casLoginButton.events({
  'click button': function () {
    event.preventDefault();

    Meteor.loginWithCas(function(){
      // console.log('Woot Meteor.user()=', Meteor.user());
    });
    return false;
  }
});

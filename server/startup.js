Meteor.startup(function(){
  console.log('STARTING UP');
  // console.log(Meteor);
  // var users = Meteor.users.find()

    Accounts.loginServiceConfiguration.remove({service: 'coursera'});
    Accounts.loginServiceConfiguration.insert({
        service: 'coursera',
        clientId: 'xxx',
        secret: 'xxx'
    });
})
Meteor.startup(function(){
	ServiceConfiguration.configurations.remove({
	      service: 'coursera'
	});
	 
	 ServiceConfiguration.configurations.insert({
	    service: 'coursera',
	    clientId: Meteor.settings.coursera.clientId,
	    secret: Meteor.settings.coursera.secret
	 });

    Meteor.users.deny({
      update: function() {
        return true;
      }
    });
})
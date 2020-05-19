Meteor.startup(function(){

	Meteor.users.deny({
		update: function() {
			return true;
		}
	});

	if (Meteor.settings.public.auth !== 'cas') {
		ServiceConfiguration.configurations.remove({
			service: 'coursera'
		});

		ServiceConfiguration.configurations.insert({
			service: 'coursera',
			clientId: Meteor.settings.coursera.clientId,
			secret: Meteor.settings.coursera.secret
		});
	}
})

Router.configure({
  layoutTemplate: 'layout',
  waitOn: function(){
      return [
      ]
  },
  data: function(){
    return {
    }
  }
})


Router.map(function() {
  var path = '';
  try{
    pathPrefix = Meteor.settings.public.pathPrefix;
  }catch (e){
    pathPrefix = '';
  }

  this.route(pathPrefix, {
    path: pathPrefix,
    template: 'index',
    name: 'index',
    waitOn: function() {
      return [
      ];
    },
    data: function(){
      return {
          splash: true
      }
    },
    onBeforeAction: function() {
      $('body').addClass('cover-bg');
      this.next();
    },
    onStop: function() {
      $('body').removeClass('cover-bg');
    },
  });


  this.route(pathPrefix, {
    path: pathPrefix + 'games/' + ':gameKey',
    template: 'genericGameLayout',
    name: 'game',
    waitOn: function() {
      return [
        Meteor.subscribe('game-status', this.params.gameKey)
      ];
    },
    data: function(){
      return {
        gameKey: this.params.gameKey,
        gameStatus: GameStatus.findOne(),
        settings: Games.settings[this.params.gameKey]
      }
    },
    onBeforeAction: function() {
      var user = Meteor.user();
      if(!user) {
        this.redirect('index');
        this.stop();
      }
      this.next();
    }
  });

  this.route(pathPrefix, {
    path: pathPrefix + 'admin',
    template: 'admin',
    name: 'admin',
    waitOn: function() {
      return [
        Meteor.subscribe('admin-data')
      ];
    },
    onBeforeAction: function() {
      var user = Meteor.user();
      if(!Roles.userIsInRole(user, ['admin'])) {
        this.redirect('index');
        this.stop();
      }
      this.next();
    }
  });

  if (Meteor.isServer) {
    Router.route('ecamm-call-recorder.zip', function () {
      var url = 'https://www.dropbox.com/s/riwqh0pq13y088m/CallRecorder25day.zip?dl=0';
      this.response.writeHead(302, {
        'Location': url
      });
      this.response.end();

    }, {where: 'server'});
  };

});

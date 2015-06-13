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
    path: pathPrefix + 'games/' + 'ultimatum',
    template: 'ultimatum-game',
    name: 'ultimatum-game',
    waitOn: function() {
      return [
        Meteor.subscribe('game-status', 'ultimatum')
      ];
    },
    data: function(){
      return {
        gameStatus: GameStatus.findOne()
      }
    },
  });

  this.route(pathPrefix, {
    path: pathPrefix + 'games/' + 'anchoring',
    template: 'anchoring-game',
    name: 'anchoring-game',
    waitOn: function() {
      return [
        Meteor.subscribe('game-status', 'anchoring')
      ];
    },
    data: function(){
      return {
        gameStatus: GameStatus.findOne()
      }
    },
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
      console.log('wooooot in onBeforeAction');
      user = Meteor.user();
      if(!Roles.userIsInRole(user, ['admin'])) {
        this.redirect('index');
        this.stop();
      }
      this.next();
    }
  });


});

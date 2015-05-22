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
          foo: 'bar'
      }
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



});

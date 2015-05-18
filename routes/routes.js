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
      console.log('woot');
      return [
      ];
    },
    fastRender: true,
    data: function(){
      return {
          foo: 'bar'
      }
    },
  });

  this.route(pathPrefix + '/login', {
    name: 'login'
  });


});

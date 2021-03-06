Template.admin.helpers({
  games: function(){
    var keys = _.unique(_.pluck(GameStatus.find({}).fetch(), 'key'));
    var keyObjects = _.map(keys, function(x){return {key: x}});
    return keyObjects;
  }
});

function getHash(href) {
  var parser = document.createElement('a');
  parser.href = href;
  return parser.hash;
}

Template.admin.events({
  'click a.deeplink':function(e,tmpl) {
      e.preventDefault();
      var hash = getHash(e.target.href);
      var el = $('a[name=' + hash.slice(1) +']');
      if (el) {
        $('html, body').animate({
            scrollTop: el.offset().top
        }, 600);
      }
   }
});

Template._admin_game_table.helpers({
  games: function(){
    var games = GameStatus.find({key: Template.instance().data.key});
    // console.log(games);
    return games;
  }
});

Template._admin_game_table_row.events({
  'click .reset-game': function(event, template){
    Meteor.call('resetGame', template.data._id);
  },
  'click .delete-game': function(event, template){
    Meteor.call('deleteGame', template.data._id);
  },
});

Template._admin_game_table_user.helpers({
  user: function(){
    var userId = Template.instance().data.userId;
    return Meteor.users.findOne({_id: userId});
  }
});

Template._admin_game_table_game_details_modal.helpers({
  gameData: function(){
    return JSON.stringify(this, ' ', 2);
  }
})

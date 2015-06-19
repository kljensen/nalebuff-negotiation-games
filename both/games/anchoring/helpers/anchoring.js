if (Meteor.isClient) {

  var gameKey = 'anchoring';

  var setDisableNextFalse = _.throttle(function(e) {
    Session.set('disableNext', false);
  }, 200);

  Template.done.events({
    'click': function(){
      Router.go('index');
    }
  });

  Template['anchoring-0'].created = function(){
    Meteor.call('initiateNewGame', gameKey);
  };

  Template.genericGameLayout.events({
    'click button.nextStep.anchoring-0': function(e){
      var val = parseInt($('input#random-number').val());
      if (noErrorDiv()) {
        Meteor.call('setAnchoringRandomNumber', val, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      };
    },
    'click button.nextStep.anchoring-1': function(e){
      e.preventDefault();
      var decision = $('input[name=moreOrLess]:checked').val();
      if (noErrorDiv()) {
        Meteor.call('setAnchoringDirection', decision, function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }
    },
    'click button.nextStep.anchoring-2': function(e){
      e.preventDefault();
      var price = $('input#price').val();
      if (noErrorDiv()) {
        Meteor.call('setAnchoringPrice', parseInt(price), function(){
          Meteor.call('incrementGameStep', gameKey);        
        });
      }
    }


  });


  Template['anchoring-1'].helpers({
    randomNumber: function(){
      return GameStatus.findOne({key: gameKey}).randomNumber;
    }
  });
  Template['anchoring-1'].created = function(){
    Session.set('disableNext', true);
  }
  Template['anchoring-1'].events({
    'change input': setDisableNextFalse
  });

  Template['anchoring-2'].helpers({
    priceRange: function(){
      var game = GameStatus.findOne({key: gameKey});
      var min = 0;
      var max = 999;
      if (game.direction === 'more') {
        min = game.randomNumber;
      }
      if (game.direction === 'less') {
        max = game.randomNumber;
      }
      return {
        min: min,
        max: max,
        direction: game.direction,
        randomNumber: game.randomNumber
      };
    },
    randomNumber: function(){
      return GameStatus.findOne({key: gameKey}).randomNumber;
    }

  });
  Template['anchoring-2'].created = function(){
    Session.set('disableNext', true);
  };

  Template['anchoring-2'].events({
    'keyup input': setDisableNextFalse
  });
  Template['anchoring-3'].helpers({
    price: function(){
      return GameStatus.findOne({key: gameKey}).price;
    },
    ranges: function(){
      if (_.has(Template.instance().data, 'ranges')) {
        return Template.instance().data.ranges.get();
      };
      return [];
    }
  });

  Template['anchoring-3'].created = function(){
    var dis = this;
    dis.data.ranges = new ReactiveVar(null);
    Meteor.call('getAnchorPriceDistribution', function(err, result){
      if (!err) {
        dis.data.ranges.set(result);
      };
    });

  };

};
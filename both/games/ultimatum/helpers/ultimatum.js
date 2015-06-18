if (Meteor.isClient) {

  var gameKey = 'ultimatum';

  Template['ultimatum-0'].created = function(){
    Meteor.call('initiateNewGame', gameKey);
  };

  var getStep = function(){
    var gameStatus = GameStatus.findOne({key: gameKey});
    if (!gameStatus) {
      Meteor.call('initiateNewGame', gameKey);    
      gameStatus = GameStatus.findOne({key: gameKey});
    };
    return gameStatus ? gameStatus.step: 0;
  }

  var callSetUltimatumAmounts = function(e, round){
    e.preventDefault();
    var player1Amount = parseInt($('input#player1-amount').val());
    var player2Amount = parseInt($('input#player2-amount').val());
    Meteor.call('setUltimatumAmounts', player1Amount, player2Amount, round, function(err){
        Meteor.call('incrementGameStep', gameKey);
    });
  };

  Template.genericGameLayout.events({
    'click button.nextStep': function(e){
      // Move forward if there is no user input,
      // otherwise have to write custom logic.
      if ($('input').length === 0) {
        Meteor.call('incrementGameStep', gameKey);
      };
    },
    'click button.nextStep.ultimatum-1': function(e){
      callSetUltimatumAmounts(e, 0);
    },
    'click button.nextStep.ultimatum-4': function(e){
      callSetUltimatumAmounts(e, 1);
    },
    'click button.nextStep.ultimatum-2': function(e){
      var decision = $('input[name=confirmReject]:checked').val();
      Meteor.call('setRoundDecision', decision, 0, function(err){
        Meteor.call('incrementGameStep', gameKey);
      });
    }

  });
  Template['ultimatum_price_choice_form'].helpers({
    availableDollars: function(){
      return _.range(1, 101);
    },
    playerAmount: function(number){
      var gs = GameStatus.findOne({key: gameKey});
      try{
        return gs.rounds[this.round].amounts['player' + number] || 0;
      }catch(e){
        return 0;
      }
    }
  });

  var getOffer = function(round){
    var gs = GameStatus.findOne({key: gameKey});
    return Math.max(gs.rounds[round].amounts['player1'], 0);
  }
  var getDemand = function(round){
    var gs = GameStatus.findOne({key: gameKey});
    return gs.rounds[round].amounts['player2'];    
  }
  Template['ultimatum-2'].helpers({
    offer: function(){
      return getOffer(0);
    },
    demand: function(){
      return getDemand(0);
    },
    demandMinusOne: function(){
      return getDemand(0)-1;
    }    
  });


  Template['ultimatum-5'].created = function(){
    var dis = this;
    dis.data.acceptedOwnCount = new ReactiveVar(null);
    dis.data.rejectedOwnCount = new ReactiveVar(null);
    Meteor.call('getNumAcceptingOwn', 1, function(err, result){
      if (!err) {
        dis.data.acceptedOwnCount.set(result.acceptedOwn);
        dis.data.rejectedOwnCount.set(result.rejectedOwn);
      };
    });
  };
  Template['ultimatum-5'].helpers({
    acceptedOwn: function(){
      var gs = GameStatus.findOne({key: gameKey});
      return gs.rounds[1].acceptsOwn;      
    },
    acceptedOwnCount: function(){
      return Template.instance().data.acceptedOwnCount.get();
    },
    rejectedOwnCount: function(){
      return Template.instance().data.rejectedOwnCount.get();
    },
    acceptedOwnPercent: function(){
      var x = Template.instance().data.acceptedOwnCount.get();
      var y = Template.instance().data.rejectedOwnCount.get();
      return Math.round((x/ (x+y)) * 100, 1);
    },
    rejectedOwnPercent: function(){
      var x = Template.instance().data.acceptedOwnCount.get();
      var y = Template.instance().data.rejectedOwnCount.get();
      return Math.round((y/ (x+y)) * 100, 1);
    },
  });
  Template['ultimatum-7'].created = function(){
    var dis = this;

    // Initialize a set of reactive variables
    var variableNames = [
      'player1CDF',
      'player1payoffs',
      'player1amounts',
      'player2CDF',
      'player2payoffs',
      'player2amounts'
    ];
    _.each(variableNames, function(v){
      dis.data[v] = new ReactiveVar(null);      
    });

    Meteor.call('getPayoffCDF', 1, function(err, result){
      if (!err) {
        _.each(variableNames, function(v){
          dis.data[v].set(result[v]);
        });

        new Chartist.Bar('.ultimatum-payoff-chart', {
          labels: _.map(_.range(101), function(x){return '$' + x}),
          series: [
            result.player1payoffs
          ]
          }, {
            height: '1500px',
            // seriesBarDistance: 10,
            reverseData: true,
            horizontalBars: true,
            onlyInteger: true,
            divisor: 4,
            high: 100,
            low: 0,
            axisY: {
                // position: 'start',
                showGrid: false,
                labelInterpolationFnc: function(value, index) {
                  return index % 5 === 0 ? value : null;
                }
            },
            axisX: {
                showGrid: true,
                position: 'start'
            }
        });

      };
    });

  };

  Template['ultimatum-7'].helpers({
    possibleAmounts: function(){
      return _.map(_.range(101), function(x){return {amount: x}});
    },
    player1amount: function(){
      return getOffer(1);
    },
    player2amount: function(){
      return getDemand(1);
    },
    player1amounts: function(){
      console.log(Template.instance().data);
      return Template.instance().data.player1amounts.get();
    },
    player2amounts: function(){
      return Template.instance().data.player2amounts.get();
    },
    playerAmounts: function(){
      var player1amounts = Template.instance().data.player1amounts.get();
      var player2amounts = Template.instance().data.player2amounts.get();
      if (player1amounts && player2amounts) {
        var zippedAmounts = _.zip(player1amounts, player2amounts);
        return _.map(zippedAmounts, function(x){
          return {p1: x[0], p2: x[1]};
        });
      };
    },
    player1CDF: function(x){
      var player1CDF = Template.instance().data.player1CDF.get();
      if (player1CDF) {
        return (100 * player1CDF[x]).toFixed(2);
      };
    },
    player1CDFinv: function(x){
      var player1CDF = Template.instance().data.player1CDF.get();
      if (player1CDF) {
        return (100 * (1-player1CDF[x])).toFixed(2);
      };
    },
    player2CDF: function(x){
      var player2CDF = Template.instance().data.player2CDF.get();
      if (player2CDF) {
        return (100 * player2CDF[x]).toFixed(2);
      };
    },
    player1payoff: function(x){
      if (typeof(x) === 'undefined') {
        x = getOffer(1);
      };
      var player1payoffs = Template.instance().data.player1payoffs.get();
      if (player1payoffs) {
        return player1payoffs[x].toFixed(2);
      };
    },
    player2payoff: function(x){
      if (typeof(x) === 'undefined') {
        x = getDemand(1);
      };
      var player2payoffs = Template.instance().data.player2payoffs.get();
      if (player2payoffs) {
        return player2payoffs[x].toFixed(2);
      };
    },
    player2efficiency: function(x){
      if (typeof(x) === 'undefined') {
        x = getDemand(1);
      };
      var player2payoffs = Template.instance().data.player2payoffs.get();
      if (player2payoffs) {
        return (100 * (player2payoffs[x] / player2payoffs[0])).toFixed(2);
      };
    }
  });
};
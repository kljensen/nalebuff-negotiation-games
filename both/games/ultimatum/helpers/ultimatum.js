if (Meteor.isClient) {

  Template['ultimatum-game'].created = function(){
    Meteor.call('initiateNewGame', 'ultimatum');
  };

  Template._body.events({
    'input input.validate-number': function(e, data, tpl){
      var el = e.target;
      var parent = el.parentNode;
      if (el.type === 'number') {
        var min = parseInt(el.min);
        var max = parseInt(el.max);
        var val = parseInt(el.value);
        if (val < min || val > max || isNaN(val)) {
          parent.classList.add('has-error');
        }else{
          parent.classList.remove('has-error');
        };
      };
    }
  })

  var getStep = function(){
    var gameStatus = GameStatus.findOne({key: 'ultimatum'});
    if (!gameStatus) {
      Meteor.call('initiateNewGame', 'ultimatum');    
      gameStatus = GameStatus.findOne({key: 'ultimatum'});
    };
    return gameStatus ? gameStatus.step: 0;
  }

  var tmpl = function(x){
    if (x < 0) {
      return null;
    };
    return 'ultimatum-game-' + x
  }
  Template['ultimatum-game'].helpers({
    stepNumber: function(){
      return getStep();
    },
    currTemplate: function(){
      return tmpl(getStep());
    },
    prevTemplate: function(){
      return tmpl(getStep() - 1);
    },
    nextTemplate: function(){
      return tmpl(getStep() + 1);
    },
    isDone: function(){
      if (getStep() >= 7) {
        return true;
      };
      return false;
    }
  });

  var callSetUltimatumAmounts = function(e, round){
    e.preventDefault();
    var player1Amount = parseInt($('input#player1-amount').val());
    var player2Amount = parseInt($('input#player2-amount').val());
    Meteor.call('setUltimatumAmounts', player1Amount, player2Amount, round, function(err){
        Meteor.call('incrementGameStep', 'ultimatum');
    });
  };

  Template['ultimatum-game'].events({
    'click button.nextStep': function(e){
      e.preventDefault();
      // Move forward if there is no user input,
      // otherwise have to write custom logic.
      if ($('input').length === 0) {
        Meteor.call('incrementGameStep', 'ultimatum');
      };
    },
    'click button.prevStep': function(e){
      e.preventDefault();
    },
    'click button.nextStep.step-1': function(e){
      callSetUltimatumAmounts(e, 0);
    },
    'click button.nextStep.step-4': function(e){
      callSetUltimatumAmounts(e, 1);
    },
    'click button.nextStep.step-2': function(e){
      e.preventDefault();
      var decision = $('input[name=confirmReject]:checked').val();
      Meteor.call('setRoundDecision', decision, 0, function(err){
        Meteor.call('incrementGameStep', 'ultimatum');
      });
    }

  });
  Template['ultimatum_price_choice_form'].helpers({
    availableDollars: function(){
      return _.range(1, 101);
    },
    playerAmount: function(number){
      var gs = GameStatus.findOne({key: 'ultimatum'});
      try{
        return gs.rounds[this.round].amounts['player' + number] || 0;
      }catch(e){
        return 0;
      }
    }
  });

  var getOffer = function(round){
    var gs = GameStatus.findOne({key: 'ultimatum'});
    return Math.max(gs.rounds[round].amounts['player1'], 0);
  }
  var getDemand = function(round){
    var gs = GameStatus.findOne({key: 'ultimatum'});
    return gs.rounds[round].amounts['player2'];    
  }
  Template['ultimatum-game-2'].helpers({
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


  Template['ultimatum-game-5'].created = function(){
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
  Template['ultimatum-game-5'].helpers({
    acceptedOwn: function(){
      var gs = GameStatus.findOne({key: 'ultimatum'});
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
  Template['ultimatum-game-7'].created = function(){
    var dis = this;

    dis.data.player1CDF = new ReactiveVar(null);
    dis.data.player1payoffs = new ReactiveVar(null);
    dis.data.player2CDF = new ReactiveVar(null);
    dis.data.player2payoffs = new ReactiveVar(null);


    Meteor.call('getPayoffCDF', 1, function(err, result){
      if (!err) {
        dis.data.player1CDF.set(result.player1CDF);
        dis.data.player1payoffs.set(result.player1payoffs);
        dis.data.player2CDF.set(result.player2CDF);
        dis.data.player2payoffs.set(result.player2payoffs);

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

  Template['ultimatum-game-7'].helpers({
    possibleAmounts: function(){
      return _.map(_.range(101), function(x){return {amount: x}});
    },
    player1amount: function(){
      return getOffer(1);
    },
    player2amount: function(){
      return getDemand(1);
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
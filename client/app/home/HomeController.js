app.factory('Results', function(){
  var services = {};
  var duration = 0, text = "hello world", scores = [0];
  
  services.setDuration = function(minutes){
    duration = minutes;
  };
  services.setText = function(string) {
    text = string;
  };
  services.setScores = function(array) {
    scores = array;
  };
  services.getDuration = function() {
    return duration;
  };
  services.getText = function() {
    return text;
  };
  services.getScores = function() {
    return scores;
  };
  return services;
});

app.controller('HomeController', ['$scope', '$interval', 'Results', function($scope, $interval, Results) {

  $scope.lastTime = 1;

  $scope.unsubmitted = true;
  $scope.gameOver = false;

  $scope.timerInput = 15;

  $scope.scores = [];

  var allScores = [];

  $scope.latestScore = 0;

  $scope.totalScore = 0;

  $scope.minute = 0;

  $scope.startTime;

  $scope.timer = 0;

  $scope.sessionScore = 0;

  $scope.potentialScoreSoFar = 0;

  $scope.colorIndex;

  var start;

  // calculates the colorIndex
  // calculates color based on the quotient between actual and potential
  // returns a corresponding index between 0 - 10
  $scope.getRoundedIndex = function(actual, potential) {
    if (actual > potential) {
      throw "ERROR: Trying to find quotient when the actual score is higher than potential";
    }

    var prop = actual / potential;

    // console.log(prop);
    
    return Math.floor(prop * 10);
  };
  


  $scope.setTime = function(event){
    $scope.lastTime = event.timeStamp;
  };

  var getTime = function() {
    var date = new Date();
    return date.getTime();
  };

  var updateMinute = function() {
    $scope.minute = Math.floor((getTime() - $scope.startTime) / 60000);
  };

  var getScore = function() {
    // How long to wait before score starts to decrease (in ms)
    var gracePeriod = 1500;
    // Length of time from end of grace period to score of zero (in ms)
    var countdown = 8000; 
       
    var score = 10000;

    var diff = getTime() - $scope.lastTime;

    if (diff > gracePeriod && diff <= gracePeriod + countdown) {
      score -= Math.floor((diff - gracePeriod) * (score / countdown));
    } else if (diff > gracePeriod + countdown) {
      score = 1;
    }

    updateMinute();

    $scope.scores[$scope.minute] += score;
    $scope.sessionScore += score;
    $scope.latestScore = score;

    allScores.push(score);
    console.log(score);

    // updates potential session score so far
    $scope.potentialScoreSoFar += 10000;
    $scope.colorIndex = $scope.getRoundedIndex($scope.sessionScore, $scope.potentialScoreSoFar);
  };

  var createScoresArray = function(minutes) {
    var array = [];
    for (var i = 0; i < minutes; i++) {
      array.push(0);
    }
    return array;
  };

  var getTimer = function(elapsed) {
    var mins = (parseInt($scope.timerInput) - Math.floor(elapsed / 60000) - 1).toString();
    var seconds = (60 - Math.floor(((elapsed % 60000) / 1000)) - 1).toString();
    if (seconds.length === 1) seconds = '0' + seconds;

    return mins + ':' + seconds;
  }

  var checkForEnd = function(elapsed) {
    return elapsed >= parseInt($scope.timerInput) * 60000;
  }

  $scope.startTimer = function() {

    if (angular.isDefined(start)) return;

    var duration = $scope.timerInput = parseInt($scope.timerInput);

    if (duration > 0) {

      $scope.unsubmitted = false;

      // $scope.potentialSession = $scope.timerInput * 60 * 10000;
      $scope.startTime = getTime();
      $scope.scores = createScoresArray(duration);

      getScore();
      $scope.timer = getTimer(getTime() - $scope.startTime);

      start = $interval(function() {
        var elapsed = getTime() - $scope.startTime;
        if (checkForEnd(elapsed)) {
          $scope.stopTimer();
          $scope.showResults();
        } else {
          getScore();
          $scope.timer = getTimer(elapsed);
        }
      }, 1000, 0);

    } else {
      console.log('invalid time');
    } 
  };

  $scope.stopTimer = function() {
    if (angular.isDefined(start)) {
      $interval.cancel(start);
      start = undefined;
    }
  };

  $scope.showResults = function() {
    Results.setDuration($scope.timerInput);
    console.log(Results.getDuration());
    Results.setText($scope.textInput);
    console.log(Results.getText());
    Results.setScores(allScores);
    console.log(Results.getScores());
    $scope.gameOver = true;
  };

}]);
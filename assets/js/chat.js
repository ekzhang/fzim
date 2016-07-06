
angular.module('fzim', [])
.controller('ChatCtrl', ['$scope', '$timeout', function($scope, $timeout) {
  // debugging
  window.SCOPE = $scope;

  $scope.messages = [];
  $scope.inputMessage = '';

  io.socket.on('connect', function() {
    io.socket.get('/message?limit=200&sort=createdAt%20DESC&channel=' + $scope.channel, {},
    function(messages) {
      messages.reverse();
      messages.forEach(function(message) {
        $scope.addMessage(message);
      });
      $scope.$apply();
    });

    io.socket.on('message', function(data) {
      console.log('Got message', data);
      if (data.verb === 'created') {
        var message = data.data;
        if (message.channel != $scope.channel)
          return;
        $scope.addMessage(message);
        $scope.$apply();
      }
    });
  });

  $scope.addMessage = function(msg) {
    $scope.messages.push(msg);
    $timeout(function() {
      var scroller = document.getElementsByClassName('message-container')[0];
      scroller.scrollTop = scroller.scrollHeight;
    }, 0, false);
  };

  $scope.sendMessage = function() {
    if (!$scope.inputMessage) return;
    var name_elem = document.getElementById('username');
    var name = name_elem ? name_elem.innerHTML : 'Anonymous';
    var msg = {
      sender: name,
      message: $scope.inputMessage,
      channel: $scope.channel
    };
    io.socket.post('/message', msg);
    $scope.addMessage(msg);
    $scope.inputMessage = '';
  };

  $scope.inputKeyDown = function(event) {
    if (event.keyCode == 13) {
      $scope.sendMessage();
    }
  };

  $scope.changeChannel = function() {
    var newChannel = prompt('Which channel do you want to switch to?');
    if (newChannel) {
      location.href = '/_channel/' + newChannel;
    }
  };

}]);

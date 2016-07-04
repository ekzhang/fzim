
angular.module('fzim', [])
.controller('ChatCtrl', ['$scope', '$timeout', function($scope, $timeout) {
  // debugging
  window.SCOPE = $scope;

  $scope.messages = [];
  $scope.inputMessage = '';
  $scope.username = 'Anonymous';

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
      // console.log('Got message', data);
      var message = data.data;
      if (message.channel != $scope.channel) {
        return;
      }
      $scope.addMessage(message);
      $scope.$apply();
    });
  });

  $scope.addMessage = function(msg) {
    $scope.messages.push(msg);
    $timeout(function() {
      var scroller = document.getElementById('message-container');
      scroller.scrollTop = scroller.scrollHeight;
    }, 0, false);
  };

  $scope.sendMessage = function() {
    if (!$scope.inputMessage) return;
    var username = $scope.username;
    if (!username) {
      username = 'Anonymous';
    }
    var msg = {
      sender: username,
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

}]);

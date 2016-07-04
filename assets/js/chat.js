
angular.module('fzim', [])
.controller('ChatCtrl', ['$scope', function($scope) {
  // debugging
  window.ChatCtrl = $scope;

  $scope.messages = [];
  $scope.inputMessage = '';

  io.socket.on('connect', function() {
    io.socket.get('/message', {}, function(messages) {
      messages.forEach(function(message) {
        $scope.messages.push(message);
      });
      $scope.$apply();
    });

    io.socket.on('message', function(data) {
      console.log('Got message', data);
      var message = data.data;
      $scope.messages.push(message);
      $scope.$apply();
    });
  });

  $scope.sendMessage = function() {
    if (!$scope.inputMessage) return;
    var msg = { sender: 'Anonymous', message: $scope.inputMessage };
    io.socket.post('/message', msg);
    $scope.messages.push(msg);
    $scope.inputMessage = '';
  };

  $scope.inputKeyDown = function(event) {
    if (event.keyCode == 13) {
      $scope.sendMessage();
    }
  };

}]);

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
    swal({
      title: 'Change channels',
      text: 'Which channel do you want to switch to?',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'slide-from-top'
    },
    function (newChannel) {
      if (newChannel === false) return false;
      if (newChannel === '') {
        swal.showInputError('You need to specify which channel you wish to switch to!');
        return false;
      }
      swal('Success!', 'Currently changing channels to ' + newChannel + '...', 'success');
      location.href = '/_channel/' + newChannel;
    });
  };

  $scope.addUser = function() {
    swal({
      title: 'Add a user',
      text: 'Username of the person you want to add to the channel:',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'slide-from-top'
    },
    function (inputValue) {
      if (inputValue === false) return false;
      if (inputValue === '') {
        swal.showInputError('You need to include the username!');
        return false;
      }
      io.socket.post('/_channel/' + $scope.channel + '/addUser',
                     { username: inputValue }, function(resData, jwres) {

        if (jwres.statusCode === 200) {
          swal('Success!', 'User ' + inputValue + ' has been added to the channel.', 'success');
        }
        else {
          if (resData) {
            swal.showInputError(resData);
          }
          else {
            swal.showInputError('There was an error with your request.');
          }
          return false;
        }
      });
    });
  };
}])
.controller('CreatePrivateCtrl', ['$scope', function($scope) {

  SCOPE = $scope;

  $scope.createChannel = function() {
    io.socket.get('/user/me', function(err, jwr) {
      var user = jwr.body;
      // console.log(user);
      if (!user || !user.id) {
        return window.location = '/login';
      }
      if (!$scope.channel_id) {
        $scope.errorText = 'Channel ID cannot be null.';
        $scope.$apply();
      }
      else {
        io.socket.get('/privatechannel?channel=' + $scope.channel_id, {}, function(data) {
          if (data.length != 0) {
            $scope.errorText = 'That channel already exists.';
            $scope.$apply();
          }
          else {
            io.socket.post('/privatechannel', {
              channel: $scope.channel_id,
              owner: user.id,
              members: []
            }, function(data) {
              if (data.owner != user.id) {
                $scope.errorText = 'An error occured.';
                $scope.$apply();
              }
              else {
                window.location = '/_channel/private/' + $scope.channel_id;
              }
            });
          }
        });
      }
    });
  };
}]);

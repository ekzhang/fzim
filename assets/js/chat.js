var addMessage = function(message) {
  var text = '<b>' + message.sender + ': </b>' + message.message;
  $('#message-container').append('<div class="message">' + text + '</div>');
};

var sendMessage = function(message) {
  // console.log('Sending message: ', message);
  io.socket.post('/message', message);
};

io.socket.on('connect', function() {
  io.socket.get('/message', {}, function(messages) {
    messages.forEach(function(message) {
      addMessage(message);
    });
  });

  io.socket.on('message', function(data) {
    var message = data.data;
    addMessage(message);
  });
});

$(document).ready(function() {
  $('#input-message').keydown(function(event){
    if (event.keyCode == 13) {
      $('#input-button').click();
    }
  });

  $('#input-button').click(function() {
    var msg = { sender: 'Anonymous', message: $('#input-message')[0].value };
    sendMessage(msg);
    addMessage(msg);
    $('#input-message')[0].value = '';
  });
});

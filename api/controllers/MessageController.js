/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  toLobby: function(req, res) {
    return res.redirect('/_channel/lobby');
  },
  joinChannel: function(req, res) {
    var channel_id = req.param('channel_id');
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);

      return res.view('chat', {
        channel_id: channel_id,
        title: 'fz-im Chat Room: ' + channel_id,
        user: user
      });
    });
  }
};

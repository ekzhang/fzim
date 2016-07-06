/**
 * PrivateChannelController
 *
 * @description :: Server-side logic for managing Privatechannels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  newPrivateChannel: function(req, res) {
    var channel_id = req.param('channel_id') || '';
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.redirect('/login');
      return res.view('newPrivateChannel', { user: user, channel_id: channel_id });
    });
  },
  joinPrivateChannel: function(req, res) {
    // sails.log.info('in joinPrivate');
    var channel_id = req.param('channel_id');
    if (!channel_id) {
      return res.notFound('Need a `channel_id`.');
    }
    UserService.getUser(req, function(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.forbidden('Need to be logged in to access private room.');

      PrivateChannel.findOne({ channel: channel_id }).exec(function(err, resp) {
        if (err) return res.negotiate(err);
        if (!resp) {
          return res.redirect('/newPrivateChannel?channel_id=' + channel_id);
        }
        if (user.id !== resp.owner && resp.members.indexOf(user.id) === -1) {
          return res.forbidden('You do not have access to this room.');
        }

        res.view('chat', {
          channel_id: 'private/' + channel_id,
          title: 'fz-im Chat Room: ' + channel_id,
          user: user
        });
      });
    });
  }
};
